/**
 * IndexedDB helper for offline storage
 * Stores Bible verses, sermons, and user data locally
 */

const DB_NAME = 'MessageGuideDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  BIBLE_VERSES: 'bible_verses',
  SERMONS: 'sermons',
  SERMON_PARAGRAPHS: 'sermon_paragraphs',
  NOTES: 'notes',
  CROSS_REFERENCES: 'cross_references',
  SYNC_QUEUE: 'sync_queue',
};

export interface SyncQueueItem {
  id: string;
  type: 'notes' | 'cross_references';
  action: 'create' | 'update' | 'delete';
  data: SyncQueuePayload;
  timestamp: number;
}

export type SyncQueuePayload = Record<string, unknown>;

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.BIBLE_VERSES)) {
          const bibleStore = db.createObjectStore(STORES.BIBLE_VERSES, { keyPath: 'id' });
          bibleStore.createIndex('book', 'book', { unique: false });
          bibleStore.createIndex('chapter', 'chapter', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SERMONS)) {
          const sermonsStore = db.createObjectStore(STORES.SERMONS, { keyPath: 'id' });
          sermonsStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SERMON_PARAGRAPHS)) {
          const paragraphsStore = db.createObjectStore(STORES.SERMON_PARAGRAPHS, { keyPath: 'id' });
          paragraphsStore.createIndex('sermon_id', 'sermon_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          notesStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CROSS_REFERENCES)) {
          const crossRefStore = db.createObjectStore(STORES.CROSS_REFERENCES, { keyPath: 'id' });
          crossRefStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async putBulk<T>(storeName: string, items: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      let completed = 0;
      let hasError = false;

      items.forEach((item) => {
        const request = store.put(item);
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });

      if (items.length === 0) {
        resolve();
      }
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue operations
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    await this.put(STORES.SYNC_QUEUE, queueItem);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  }

  async clearSyncQueue(): Promise<void> {
    await this.clear(STORES.SYNC_QUEUE);
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete(STORES.SYNC_QUEUE, id);
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();
