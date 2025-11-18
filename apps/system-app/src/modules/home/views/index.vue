<template>
  <div class="system-home">
    <!-- 策略监控图表分析 -->
    <div class="strategy-charts">
      <BtcChartDemo :gap="10" :cols-per-row="2" chart-height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BtcChartDemo } from '@btc/shared-components';

defineOptions({
  name: 'SystemHome',
});
</script>

<style scoped lang="scss">
.system-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.strategy-charts {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
