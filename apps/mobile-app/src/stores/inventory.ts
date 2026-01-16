import { db } from '@/db';

export const useInventoryStore = defineStore('inventory', () => {
  const currentSession = ref<any>(null);
  const sessions = ref<any[]>([]);

  async function loadSessions() {
    sessions.value = await db.inventory_sessions.toArray();
  }

  async function createSession(sessionData: any) {
    const id = await db.inventory_sessions.add(sessionData);
    await loadSessions();
    return id;
  }

  async function updateSession(id: string | number, updates: any) {
    await db.inventory_sessions.update(id, updates);
    await loadSessions();
  }

  async function deleteSession(id: string | number) {
    await db.inventory_sessions.delete(id);
    await loadSessions();
  }

  async function setCurrentSession(session: any) {
    currentSession.value = session;
  }

  return {
    currentSession,
    sessions,
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    setCurrentSession,
  };
});

