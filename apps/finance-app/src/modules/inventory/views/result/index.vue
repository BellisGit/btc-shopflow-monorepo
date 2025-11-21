<template>
  <div class="finance-inventory-result">
    <el-empty :description="t('finance.placeholder.inventoryResult')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'btc-finance-inventory-result',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.finance-inventory-result {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

