<template>
  <!-- 嵌入 layout-app / qiankun 时需要外层容器样式；独立运行时无需强制包裹 -->
  <div v-if="!isStandalone" class="finance-app">
    <router-view :key="viewKey" />
  </div>
  <router-view v-else :key="viewKey" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

defineOptions({
  name: 'FinanceApp',
});

const viewKey = ref(1);
// 关键：在 layout-app 环境下，isStandalone 应该是 false（因为不是独立运行）
// 这样会使用包装层样式，确保正确渲染
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
const emitter = (window as any).__APP_EMITTER__;

// 刷新视图
function refreshView() {
  viewKey.value += 1;
}

onMounted(() => {
  if (emitter) {
    emitter.on('subapp.refresh', refreshView);
  }
});

onUnmounted(() => {
  if (emitter) {
    emitter.off('subapp.refresh', refreshView);
  }
});
</script>

<style scoped>
/* 只在 qiankun 模式下使用包装层样式 */
.finance-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}
</style>

