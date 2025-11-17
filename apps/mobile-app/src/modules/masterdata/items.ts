import { db } from '@/db';
import type { Item } from '@/db/schema';

export async function getItemByCode(materialCode: string): Promise<Item | undefined> {
  return db.items.where('materialCode').equals(materialCode).first();
}

export async function getAllItems(): Promise<Item[]> {
  return db.items.toArray();
}

export async function upsertItem(item: Item): Promise<number> {
  const existing = await db.items.where('materialCode').equals(item.materialCode).first();
  if (existing) {
    await db.items.update(existing.id!, { ...item, updatedAt: Date.now() });
    return existing.id!;
  } else {
    return db.items.add({ ...item, updatedAt: Date.now() });
  }
}

export async function deleteItem(id: number): Promise<void> {
  await db.items.delete(id);
}

