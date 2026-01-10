<template>
  <div class="customs-page">
    <el-empty :description="t('page.customs.placeholder')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'LogisticsCustoms',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.customs-page {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


