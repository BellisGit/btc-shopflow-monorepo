<template>
  <div class="system-app">
    <!-- 关键：DevTools 放在 router-view 外层，确保路由切换时不卸载 -->
    <BtcDevTools />
    <router-view v-slot="{ Component, route }">
      <!-- 关键：根据路由的 noLayout 标记决定是否使用 key -->
      <!-- 如果路由标记为 noLayout（如登录页），使用 key 强制重新创建组件 -->
      <!-- 否则不使用 key，让 Vue 复用 Layout 组件实例，避免顶栏、侧边栏、标签栏等固定元素重新渲染 -->
      <!-- 关键：对于主应用路由（如登录页），直接渲染 Component，让 Vue 处理 -->
      <!-- 如果 Component 不存在，Vue Router 会自动处理并显示404页面 -->
      <component
        v-if="Component"
        :is="Component"
        :key="route.meta?.noLayout ? route.fullPath : undefined"
      />
    </router-view>
    <RetryStatusIndicator />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initEpsData } from '@btc/shared-core';
import { BtcDevTools } from '@btc/shared-components';
import RetryStatusIndicator from '@/components/RetryStatusIndicator/index.vue';

import epsData from 'virtual:eps';

// 初始化 EPS 数据
onMounted(() => {
  try {
    initEpsData(epsData as any);
  } catch (error) {
    console.error('[App] Failed to load EPS data:', error);
  }
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

#main-app {
  width: 100%;
  height: 100%;
}

.system-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.system-app > router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
