export const DB_NAME = 'btc-mobile-app';
export const DB_VERSION = 1;

export interface Item {
  id?: number;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit?: string;
  batchNo?: string;
  validity?: string;
  barCode?: string;
  updatedAt?: number;
}

export interface Location {
  id?: number;
  code: string;
  name: string;
  updatedAt?: number;
}

export interface InventorySession {
  id?: number;
  baseId?: string;
  checkNo?: string;
  domainId?: string;
  checkType?: string;
  checkStatus?: string;
  startTime?: string;
  endTime?: string;
  checkerId?: string;
  remark?: string;
  startedAt?: number;
  status?: string;
  updatedAt?: number;
}

export interface Count {
  id?: number;
  sessionId: number;
  baseId?: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit?: string;
  batchNo?: string;
  validity?: string;
  bookQty?: number;
  actualQty: number;
  storageLocation?: string;
  diffQty?: number;
  diffRate?: number;
  isDiff?: number;
  checkerId?: string;
  remark?: string;
  ts?: number;
  synced?: boolean;
}

export interface Attachment {
  id?: number;
  sessionId: number;
  refId?: number;
  type?: string;
  url?: string;
  ts?: number;
}

export interface PendingOp {
  id?: number;
  type: string;
  payload: any;
  ts?: number;
  retries?: number;
}

export const tables = {
  items: '++id, materialCode, materialName, specification, unit, batchNo, validity, barCode, updatedAt',
  locations: '++id, code, name, updatedAt',
  inventory_sessions: '++id, baseId, checkNo, domainId, checkType, checkStatus, startTime, endTime, checkerId, remark, startedAt, status, updatedAt',
  counts: '++id, sessionId, baseId, materialCode, materialName, specification, unit, batchNo, validity, bookQty, actualQty, storageLocation, diffQty, diffRate, isDiff, checkerId, remark, ts, synced',
  attachments: '++id, sessionId, refId, type, url, ts',
  pending_ops: '++id, type, payload, ts, retries',
} as const;

