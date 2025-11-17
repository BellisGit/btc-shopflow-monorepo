import { db } from '@/db';

const RING_BUFFER_SIZE = 2000;
const DB_NAME = 'btc-logs';
const STORE_NAME = 'entries';

interface LogEntry {
  id?: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  meta?: any;
}

class LogBuffer {
  private buffer: LogEntry[] = [];
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  add(entry: LogEntry) {
    this.buffer.push(entry);
    
    if (this.buffer.length > RING_BUFFER_SIZE) {
      this.buffer.shift();
    }

    if (this.db) {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.add(entry);
    }
  }

  getAll(): LogEntry[] {
    return [...this.buffer];
  }

  async getAllFromDB(): Promise<LogEntry[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  clear() {
    this.buffer = [];
    
    if (this.db) {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
    }
  }
}

const logBuffer = new LogBuffer();

export function log(level: LogEntry['level'], message: string, meta?: any) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: Date.now(),
    meta,
  };
  
  logBuffer.add(entry);
  
  // 同时输出到控制台
  const consoleMethod = console[level] || console.log;
  consoleMethod(`[${level.toUpperCase()}]`, message, meta || '');
}

export const logger = {
  debug: (message: string, meta?: any) => log('debug', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  getAll: () => logBuffer.getAll(),
  getAllFromDB: () => logBuffer.getAllFromDB(),
  clear: () => logBuffer.clear(),
};

