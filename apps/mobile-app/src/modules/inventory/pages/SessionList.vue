<template>
  <div class="page">
    <PullRefresh v-model="refreshing" @refresh="onRefresh">
      <List
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <Cell
          v-for="session in sessions"
          :key="session.id"
          :title="session.checkNo || `会话 #${session.id}`"
          :label="formatDate(session.startedAt)"
          is-link
          @click="handleSelectSession(session)"
        />
      </List>
    </PullRefresh>
    <FloatingBubble
      axis="xy"
      icon="plus"
      @click="handleCreateSession"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  PullRefresh,
  List,
  Cell,
  FloatingBubble,
} from 'vant';
import { useInventoryStore } from '@/stores/inventory';

defineOptions({
  name: 'BtcMobileInventorySessions',
});

const router = useRouter();
const inventoryStore = useInventoryStore();

const sessions = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

onMounted(() => {
  loadSessions();
});

async function loadSessions() {
  await inventoryStore.loadSessions();
  sessions.value = inventoryStore.sessions;
}

function formatDate(timestamp?: number) {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleString('zh-CN');
}

async function onRefresh() {
  refreshing.value = true;
  await loadSessions();
  refreshing.value = false;
}

function onLoad() {
  // TODO: 实现分页加载
  finished.value = true;
}

function handleSelectSession(session: any) {
  inventoryStore.setCurrentSession(session);
  router.push({ name: 'InventoryScanner', params: { sessionId: session.id } });
}

function handleCreateSession() {
  router.push({ name: 'InventoryEntry' });
}
</script>


