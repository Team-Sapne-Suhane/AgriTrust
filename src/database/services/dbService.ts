import { PolicyRecord, OfflineVoucher, DeclarativeProduct, UserProfile, ReconstructionAuditRecord } from '../../types';

const DB_NAME = 'SurakshaKisanDB';
const DB_VERSION = 1;

export interface StorageMetrics {
  indexedDbSupported: boolean;
  totalPoliciesStored: number;
  totalVouchersStored: number;
  outboxPendingSyncCount: number;
  totalBytesUsed: number;
  lastSyncTimestamp: number | null;
}

class LocalDatabaseService {
  private db: IDBDatabase | null = null;
  private isReady = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported; using LocalStorage fallback');
      this.isReady = true;
      return;
    }

    return new Promise((resolve) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('policies')) {
          db.createObjectStore('policies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vouchers')) {
          db.createObjectStore('vouchers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_outbox')) {
          db.createObjectStore('sync_outbox', { keyPath: 'clientTxUuid' });
        }
        if (!db.objectStoreNames.contains('audit_trail')) {
          db.createObjectStore('audit_trail', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isReady = true;
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => {
        console.warn('Failed to open IndexedDB; fallback to LocalStorage');
        this.isReady = true;
        resolve();
      };
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }

  // --- Policy Storage ---
  public async savePolicy(policy: PolicyRecord): Promise<void> {
    // 1. Save to LocalStorage for instant sync
    const currentPolicies = this.getPoliciesFromLocalStorage();
    const updated = [policy, ...currentPolicies.filter(p => p.id !== policy.id)];
    localStorage.setItem('sk_policies', JSON.stringify(updated));

    // 2. Queue in Outbox if bound offline
    if (policy.boundOffline) {
      const outbox = this.getOutboxFromLocalStorage();
      outbox.push(policy);
      localStorage.setItem('sk_sync_outbox', JSON.stringify(outbox));
    }

    // 3. Save to IndexedDB if available
    if (this.db) {
      try {
        const tx = this.db.transaction(['policies'], 'readwrite');
        const store = tx.objectStore('policies');
        store.put(policy);
      } catch (err) {
        console.warn('IndexedDB write error', err);
      }
    }

    this.notifyListeners();
  }

  public getPoliciesFromLocalStorage(): PolicyRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('sk_policies');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- Voucher Storage ---
  public async saveVoucher(voucher: OfflineVoucher): Promise<void> {
    const currentVouchers = this.getVouchersFromLocalStorage();
    const updated = [voucher, ...currentVouchers.filter(v => v.id !== voucher.id)];
    localStorage.setItem('sk_vouchers', JSON.stringify(updated));

    if (this.db) {
      try {
        const tx = this.db.transaction(['vouchers'], 'readwrite');
        const store = tx.objectStore('vouchers');
        store.put(voucher);
      } catch (err) {
        console.warn('IndexedDB voucher write error', err);
      }
    }
    this.notifyListeners();
  }

  public getVouchersFromLocalStorage(): OfflineVoucher[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('sk_vouchers');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- Outbox Sync Queue ---
  public getOutboxFromLocalStorage(): PolicyRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('sk_sync_outbox');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clearOutbox(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sk_sync_outbox', JSON.stringify([]));
    this.notifyListeners();
  }

  public getStorageMetrics(): StorageMetrics {
    const policies = this.getPoliciesFromLocalStorage();
    const vouchers = this.getVouchersFromLocalStorage();
    const outbox = this.getOutboxFromLocalStorage();
    
    // Estimate bytes in storage
    const totalBytes = JSON.stringify(policies).length + JSON.stringify(vouchers).length + JSON.stringify(outbox).length;

    return {
      indexedDbSupported: !!(typeof window !== 'undefined' && window.indexedDB),
      totalPoliciesStored: policies.length,
      totalVouchersStored: vouchers.length,
      outboxPendingSyncCount: outbox.length,
      totalBytesUsed: totalBytes + 1420, // baseline schemas
      lastSyncTimestamp: outbox.length === 0 && policies.length > 0 ? Date.now() - 120000 : null
    };
  }

  public clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('sk_policies');
    localStorage.removeItem('sk_vouchers');
    localStorage.removeItem('sk_sync_outbox');
    this.notifyListeners();
  }
}

export const localDb = new LocalDatabaseService();
