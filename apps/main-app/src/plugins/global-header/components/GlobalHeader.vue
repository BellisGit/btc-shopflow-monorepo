<template>
  <div class="global-header">
    <div class="header-left">
      <h1 class="app-title">BTC ShopFlow</h1>
    </div>

    <div class="header-center">
      <!-- 可以添加搜索框等 -->
    </div>

    <div class="header-right">
      <el-badge :value="notificationCount" :hidden="notificationCount === 0">
        <el-button circle @click="showNotifications">
          <btc-svg name="icon-notice" :size="20" />
        </el-button>
      </el-badge>

      <user-menu />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'GlobalHeader',
});

const notificationCount = ref(3);

const showNotifications = () => {
  console.log('显示通知');
};
</script>

<style scoped lang="scss">
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);

  .header-left {
    .app-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}
</style>

