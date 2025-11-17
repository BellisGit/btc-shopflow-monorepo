import { db } from '@/db';
import type { Location } from '@/db/schema';

export async function getLocationByCode(code: string): Promise<Location | undefined> {
  return db.locations.where('code').equals(code).first();
}

export async function getAllLocations(): Promise<Location[]> {
  return db.locations.toArray();
}

export async function upsertLocation(location: Location): Promise<number> {
  const existing = await db.locations.where('code').equals(location.code).first();
  if (existing) {
    await db.locations.update(existing.id!, { ...location, updatedAt: Date.now() });
    return existing.id!;
  } else {
    return db.locations.add({ ...location, updatedAt: Date.now() });
  }
}

export async function deleteLocation(id: number): Promise<void> {
  await db.locations.delete(id);
}

