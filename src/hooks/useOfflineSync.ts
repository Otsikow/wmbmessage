import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { offlineStorage, STORES } from '@/lib/offlineStorage';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage offline data synchronization
 * Handles caching data locally and syncing with Supabase when online
 */
export const useOfflineSync = () => {
  const { user } = useAuth();

  // Initialize offline storage
  useEffect(() => {
    offlineStorage.init().catch(console.error);
  }, []);

  // Cache sermons for offline reading
  const cacheSermons = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: sermons, error } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (sermons && sermons.length > 0) {
        await offlineStorage.putBulk(STORES.SERMONS, sermons);
        console.log(`Cached ${sermons.length} sermons`);
      }
    } catch (error) {
      console.error('Failed to cache sermons:', error);
    }
  }, []);

  // Cache sermon paragraphs for offline reading
  const cacheSermonParagraphs = useCallback(async (sermonId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: paragraphs, error } = await supabase
        .from('sermon_paragraphs')
        .select('*')
        .eq('sermon_id', sermonId)
        .order('paragraph_number', { ascending: true });

      if (error) throw error;

      if (paragraphs && paragraphs.length > 0) {
        await offlineStorage.putBulk(STORES.SERMON_PARAGRAPHS, paragraphs);
        console.log(`Cached ${paragraphs.length} paragraphs for sermon ${sermonId}`);
      }
    } catch (error) {
      console.error('Failed to cache sermon paragraphs:', error);
    }
  }, []);

  // Cache user notes for offline access
  const cacheUserNotes = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;

    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (notes && notes.length > 0) {
        await offlineStorage.putBulk(STORES.NOTES, notes);
        console.log(`Cached ${notes.length} notes`);
      }
    } catch (error) {
      console.error('Failed to cache notes:', error);
    }
  }, [user]);

  // Cache cross references for offline access
  const cacheCrossReferences = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: crossRefs, error } = await supabase
        .from('cross_references')
        .select('*')
        .limit(1000);

      if (error) throw error;

      if (crossRefs && crossRefs.length > 0) {
        await offlineStorage.putBulk(STORES.CROSS_REFERENCES, crossRefs);
        console.log(`Cached ${crossRefs.length} cross references`);
      }
    } catch (error) {
      console.error('Failed to cache cross references:', error);
    }
  }, []);

  // Get cached sermons (used when offline)
  const getCachedSermons = useCallback(async () => {
    try {
      return await offlineStorage.getAll(STORES.SERMONS);
    } catch (error) {
      console.error('Failed to get cached sermons:', error);
      return [];
    }
  }, []);

  // Get cached sermon paragraphs (used when offline)
  const getCachedSermonParagraphs = useCallback(async (sermonId: string) => {
    try {
      return await offlineStorage.getByIndex(
        STORES.SERMON_PARAGRAPHS,
        'sermon_id',
        sermonId
      );
    } catch (error) {
      console.error('Failed to get cached sermon paragraphs:', error);
      return [];
    }
  }, []);

  // Get cached notes (used when offline)
  const getCachedNotes = useCallback(async () => {
    if (!user) return [];

    try {
      return await offlineStorage.getByIndex(
        STORES.NOTES,
        'user_id',
        user.id
      );
    } catch (error) {
      console.error('Failed to get cached notes:', error);
      return [];
    }
  }, [user]);

  // Sync offline changes to Supabase
  const syncOfflineChanges = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    if (!navigator.onLine) {
      console.log('Cannot sync - offline');
      return;
    }

    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          if (item.type === 'notes') {
            if (item.action === 'create' || item.action === 'update') {
              await (supabase as any)
                .from('notes')
                .upsert([item.data] as any);
            } else if (item.action === 'delete') {
              await (supabase as any)
                .from('notes')
                .delete()
                .eq('id', (item.data as any).id);
            }
          } else if (item.type === 'cross_references') {
            if (item.action === 'create' || item.action === 'update') {
              await (supabase as any)
                .from('user_cross_references')
                .upsert([item.data] as any);
            } else if (item.action === 'delete') {
              await (supabase as any)
                .from('user_cross_references')
                .delete()
                .eq('id', (item.data as any).id);
            }
          }

          // Remove from queue after successful sync
          await offlineStorage.removeFromSyncQueue(item.id);
          console.log(`Synced ${item.type} ${item.action}`);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Keep in queue for retry
        }
      }
    } catch (error) {
      console.error('Failed to sync offline changes:', error);
    }
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const handleOnline = () => {
      syncOfflineChanges();
      // Re-cache data to get latest updates
      cacheSermons();
      cacheUserNotes();
      cacheCrossReferences();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineChanges, cacheSermons, cacheUserNotes, cacheCrossReferences]);

  // Listen for sync messages from service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_ITEM') {
          syncOfflineChanges();
        }
      });
    }
  }, [syncOfflineChanges]);

  // Cache initial data when online
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    if (navigator.onLine) {
      cacheSermons();
      cacheUserNotes();
      cacheCrossReferences();
    }
  }, [cacheSermons, cacheUserNotes, cacheCrossReferences]);

  return {
    cacheSermons,
    cacheSermonParagraphs,
    cacheUserNotes,
    cacheCrossReferences,
    getCachedSermons,
    getCachedSermonParagraphs,
    getCachedNotes,
    syncOfflineChanges,
    isOnline: navigator.onLine,
  };
};
