import Dexie, { type Table } from 'dexie';
import type {
  Item,
  Location,
  InventorySession,
  Count,
  Attachment,
  PendingOp,
} from './schema';
import { DB_NAME, DB_VERSION, tables } from './schema';

class MobileAppDatabase extends Dexie {
  items!: Table<Item>;
  locations!: Table<Location>;
  inventory_sessions!: Table<InventorySession>;
  counts!: Table<Count>;
  attachments!: Table<Attachment>;
  pending_ops!: Table<PendingOp>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      items: tables.items,
      locations: tables.locations,
      inventory_sessions: tables.inventory_sessions,
      counts: tables.counts,
      attachments: tables.attachments,
      pending_ops: tables.pending_ops,
    });
  }
}

export const db = new MobileAppDatabase();

