<template>
  <!-- 独立运行时：直接渲染 router-view，让 AppLayout 占据整个容器 -->
  <!-- qiankun 模式：使用包装层，因为子应用需要被主应用的布局包裹 -->
  <div v-if="!isStandalone" :class="['logistics-app']">
    <router-view v-slot="{ Component, route }">
      <transition :name="pageTransition" mode="out-in">
        <component v-if="Component" :is="Component" :key="route.fullPath || viewKey" />
      </transition>
    </router-view>
  </div>
  <router-view v-else v-slot="{ Component, route }">
    <transition :name="pageTransition" mode="out-in">
      <component v-if="Component" :is="Component" :key="route.fullPath || viewKey" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { usePageTransition } from '@btc/shared-utils';
import { useLogout } from '@/composables/useLogout';

defineOptions({
  name: 'LogisticsApp',
});

// 关键：在应用启动时立即初始化通信桥和登出监听
useLogout();

const viewKey = ref(1);
// 关键：在 layout-app 环境下，isStandalone 应该是 false
// 这样会使用包装层（.logistics-app），确保样式正确应用
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
const emitter = (window as any).__APP_EMITTER__;
const { pageTransition } = usePageTransition();

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
.logistics-app {
  flex: 1 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

/* 确保 router-view 正确渲染 */
.logistics-app :deep(> router-view) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

/* 确保 router-view 渲染的组件正确显示 */
.logistics-app :deep(> router-view > *) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

/* 确保 transition 组件正确渲染 */
.logistics-app :deep(.transition-group),
.logistics-app :deep(.transition-group > *) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}
</style>

