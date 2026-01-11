import { useCallback, useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { offlineStorage, STORES } from '@/lib/offlineStorage';
import type { UserNote } from '@/hooks/useNotes';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingNotesCount, setPendingNotesCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingNotes = useCallback(async () => {
    if (!user) {
      setPendingNotesCount(0);
      return;
    }

    try {
      await offlineStorage.init();
      const cachedNotes = await offlineStorage.getByIndex<UserNote>(
        STORES.NOTES,
        'user_id',
        user.id
      );
      setPendingNotesCount(cachedNotes.length);
    } catch (error) {
      console.error('Failed to check pending offline notes:', error);
    }
  }, [user]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored. Syncing changes...',
        duration: 3000,
      });

      // Trigger background sync (if supported)
      if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('sync-offline-changes');
        }).catch((error) => {
          console.error('Background sync registration failed:', error);
        });
      }

      // Auto-hide after 5 seconds
      setTimeout(() => setShowIndicator(false), 5000);
      void fetchPendingNotes();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      toast({
        title: 'You\'re Offline',
        description: 'You can continue reading. Changes will sync when reconnected.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator if starting offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchPendingNotes, toast]);

  useEffect(() => {
    let isMounted = true;

    const updatePendingNotes = async () => {
      if (!isMounted) return;
      await fetchPendingNotes();
    };

    updatePendingNotes();
    const interval = window.setInterval(updatePendingNotes, 10000);
    window.addEventListener('focus', updatePendingNotes);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', updatePendingNotes);
    };
  }, [fetchPendingNotes]);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: 'Cannot Sync',
        description: 'You are offline. Please check your connection.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    try {
      if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-offline-changes');
        toast({
          title: 'Sync Complete',
          description: 'Your offline changes have been synced.',
        });
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: 'Unable to sync changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      await fetchPendingNotes();
    }
  };

  if (!showIndicator && isOnline && pendingNotesCount === 0) {
    return null;
  }

  const hasPendingNotes = pendingNotesCount > 0;
  const pendingNotesLabel = `${pendingNotesCount} offline note${pendingNotesCount === 1 ? '' : 's'}`;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert
        className={`shadow-lg border-2 transition-all duration-300 ${
          isOnline && !hasPendingNotes
            ? 'bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-700'
            : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi
                className={`h-5 w-5 ${
                  hasPendingNotes
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              />
            ) : (
              <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <AlertDescription className="font-medium">
              {isOnline ? (
                <span
                  className={
                    hasPendingNotes
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-green-800 dark:text-green-200'
                  }
                >
                  {hasPendingNotes
                    ? `Sync pending - ${pendingNotesLabel}`
                    : 'Connected - All changes saved'}
                </span>
              ) : (
                <span className="text-yellow-800 dark:text-yellow-200">
                  Offline Mode - Reading locally
                  {hasPendingNotes ? ` • ${pendingNotesLabel} waiting to sync` : ''}
                </span>
              )}
            </AlertDescription>
          </div>
          
          {isOnline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};
