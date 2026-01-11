<template>
  <div class="todo-page">
    <div class="todo-page__content">
      <BtcEmpty :description="t('todo.empty')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { BtcEmpty } from '@btc/shared-components';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.todo-page {
  width: 100%;
  max-width: 100%;
  background-color: #0a0a0a; // 统一使用深色背景，与其他应用保持一致
  min-height: 100%;
  padding: 20px;

  &__content {
    background-color: var(--el-bg-color);
    border-radius: 4px;
    padding: 40px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

