<template>
  <div class="sync-status-page">
    <CellGroup inset>
      <Cell title="待同步操作" :value="pendingOpsCount" />
      <Cell title="最后同步时间" :value="lastSyncTime || '从未同步'" />
    </CellGroup>
    <div style="margin: 16px">
      <Button type="primary" block @click="handleSync">
        立即同步
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-utils';
import { ref, onMounted } from 'vue';
import { CellGroup, Cell, Button } from 'vant';
import { db } from '@/db';
import { processQueue } from '../backgroundSync';

defineOptions({
  name: 'BtcMobileSyncStatus',
});

const pendingOpsCount = ref(0);
const lastSyncTime = ref<string>('');

onMounted(async () => {
  await updateStatus();
});

async function updateStatus() {
  pendingOpsCount.value = await db.pending_ops.count();
  // TODO: 从本地存储读取最后同步时间
  const lastSync = storage.get<number>('last_sync_time');
  if (lastSync) {
    lastSyncTime.value = new Date(Number(lastSync)).toLocaleString('zh-CN');
  }
}

async function handleSync() {
  try {
    await processQueue();
    await updateStatus();
  } catch (error) {
    console.error('[SyncStatus] Failed to sync:', error);
  }
}
</script>


