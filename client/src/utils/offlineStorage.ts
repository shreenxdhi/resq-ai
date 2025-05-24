// Offline storage utility
// Uses IndexedDB for storing plans and other data

interface Plan {
  id: string;
  location: string;
  disasterType: string;
  content: string;
  createdAt: string;
}

const DB_NAME = 'resq-db';
const DB_VERSION = 1;
const PLANS_STORE = 'plans';

// Open IndexedDB connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject('Error opening database');
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(PLANS_STORE)) {
        db.createObjectStore(PLANS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Save plans to IndexedDB
export const savePlanOffline = async (plan: Plan): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(PLANS_STORE, 'readwrite');
    const store = transaction.objectStore(PLANS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put(plan);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject('Error saving plan offline');
      };
    });
  } catch (error) {
    console.error('Failed to save plan offline:', error);
    throw error;
  }
};

// Get all plans from IndexedDB
export const getOfflinePlans = async (): Promise<Plan[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(PLANS_STORE, 'readonly');
    const store = transaction.objectStore(PLANS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Error retrieving offline plans');
      };
    });
  } catch (error) {
    console.error('Failed to get offline plans:', error);
    return [];
  }
};

// Delete plan from IndexedDB
export const deleteOfflinePlan = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(PLANS_STORE, 'readwrite');
    const store = transaction.objectStore(PLANS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject('Error deleting offline plan');
      };
    });
  } catch (error) {
    console.error('Failed to delete offline plan:', error);
    throw error;
  }
};

// Update plan in IndexedDB
export const updateOfflinePlan = async (plan: Plan): Promise<void> => {
  return savePlanOffline(plan);
};

// Check online status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Add event listeners for online/offline status
export const setupOnlineStatusListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
};

// Clean up listeners
export const cleanupOnlineStatusListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.removeEventListener('online', onlineCallback);
  window.removeEventListener('offline', offlineCallback);
}; 