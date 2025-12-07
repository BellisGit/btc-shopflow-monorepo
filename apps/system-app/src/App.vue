<template>
  <div class="system-app">
    <router-view v-slot="{ Component, route }">
      <!-- 关键：根据路由的 noLayout 标记决定是否使用 key -->
      <!-- 如果路由标记为 noLayout（如登录页），使用 key 强制重新创建组件 -->
      <!-- 否则不使用 key，让 Vue 复用 Layout 组件实例，避免顶栏、侧边栏、标签栏等固定元素重新渲染 -->
      <!-- 关键：对于主应用路由（如登录页），直接渲染 Component，让 Vue 处理 -->
      <!-- 如果 Component 存在，尝试渲染它；如果出错，Vue 的错误处理器会捕获 -->
      <component
        v-if="Component"
        :is="Component"
        :key="route.meta?.noLayout ? route.fullPath : undefined"
      />
      <div v-else style="padding: 20px; color: #999;">
        <p>⚠️ 路由组件未加载</p>
        <p>路径: {{ route.path }}</p>
        <p>匹配的路由: {{ route.matched.length }}</p>
        <p>Component: {{ Component ? '存在' : '不存在' }}</p>
        <p v-if="Component">Component 类型: {{ typeof Component }}</p>
        <p v-if="Component && typeof Component === 'object'">Component keys: {{ Object.keys(Component).join(', ') }}</p>
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
