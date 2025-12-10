<template>
  <!-- 独立运行时：直接渲染 router-view，让 AppLayout 占据整个容器 -->
  <!-- qiankun 模式：使用包装层，因为子应用需要被主应用的布局包裹 -->
  <!-- 关键：始终渲染 router-view，使用包装层 div 的 class 绑定控制样式，避免使用 v-if/v-else 导致 DOM 节点销毁重建 -->
  <div :class="['monitor-app', { 'monitor-app--standalone': isStandalone }]">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="viewKey" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

defineOptions({
  name: 'MonitorApp',
});

const viewKey = ref(1);
// 如果使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志），也应该使用包装层样式
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
/* qiankun 模式下使用包装层样式 */
.monitor-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

/* 独立运行模式下，包装层不应用样式，让 AppLayout 占据整个容器 */
.monitor-app--standalone {
  flex: none;
  width: auto;
  height: auto;
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

