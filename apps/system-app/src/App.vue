<template>
  <div class="system-app">
    <router-view v-slot="{ Component, route }">
      <!-- 关键：根据路由的 noLayout 标记决定是否使用 key -->
      <!-- 如果路由标记为 noLayout（如登录页），使用 key 强制重新创建组件 -->
      <!-- 否则不使用 key，让 Vue 复用 Layout 组件实例，避免顶栏、侧边栏、标签栏等固定元素重新渲染 -->
      <component 
        v-if="Component" 
        :is="Component" 
        :key="route.meta?.noLayout ? route.fullPath : undefined"
      />
      <div v-else-if="isProd" style="padding: 20px; color: red;">
        <p>路由组件加载失败</p>
        <p>路径: {{ route.path }}</p>
        <p>匹配的路由: {{ route.matched.length }}</p>
      </div>
    </router-view>
    <RetryStatusIndicator />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initEpsData } from '@btc/shared-core';
import RetryStatusIndicator from '@/components/RetryStatusIndicator/index.vue';

import epsData from 'virtual:eps';

// 生产环境标志（用于模板）
const isProd = import.meta.env.PROD;

// 初始化 EPS 数据
onMounted(() => {
  try {
    initEpsData(epsData);
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
