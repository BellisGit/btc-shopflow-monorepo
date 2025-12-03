<template>
  <div id="layout-app">
    <AppLayout />
  </div>
</template>

<script setup lang="ts">
/**
 * layout-app: 子应用的布局容器应用
 * 
 * 作用：
 * 1. 当通过子域名直接访问时（如 logistics.bellis.com.cn），提供主应用布局
 * 2. 根据域名判断并加载对应的子应用
 * 3. 不包含任何应用的 manifest 数据（子应用自己注册）
 */
// 直接从组件路径导入，避免通过 index.ts 重新导出导致的循环依赖警告
import AppLayout from '@btc/shared-components/components/layout/app-layout/index.vue';
</script>

<style>
#layout-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
</style>

