<template>
  <router-view />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMobileApp',
});
</script>

<style>
/* 移动端全局样式 */
@import './styles/index.scss';
/* 共享组件样式 */
@use '@btc/shared-components/styles/index.scss' as *;

html {
  /* 使用动态视口高度，适配移动端浏览器地址栏 */
  height: 100%;
  height: 100dvh; /* 动态视口高度（支持的浏览器会优先使用） */
}

body,
#app {
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh; /* 动态视口高度，适配移动端浏览器地址栏 */
  margin: 0;
  padding: 0;
  background: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  
  /* 移动端适配 */
  /* 1. 防止 iOS Safari 双击缩放 */
  touch-action: manipulation;
  /* 2. 优化触摸滚动性能 */
  -webkit-overflow-scrolling: touch;
}

/* 支持安全区域的设备 - 全局适配 */
@supports (padding: env(safe-area-inset-top)) {
  body {
    /* 确保内容不被刘海屏、全面屏等遮挡 */
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    /* 顶部和底部安全区域留给具体页面处理 */
  }
  
  #app {
    /* 应用级别也考虑左右安全区域 */
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

* {
  box-sizing: border-box;
}
</style>

