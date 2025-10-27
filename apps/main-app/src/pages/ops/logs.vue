<template>
  <div class="ops-logs-page">
    <OpsLogs />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import OpsLogs from '@modules/ops/views/logs/index.vue';

defineOptions({
  name: 'OpsLogsPage'
});

onMounted(() => {
  console.log('[OpsLogsPage] 页面已加载');
});
</script>

<style lang="scss" scoped>
.ops-logs-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
