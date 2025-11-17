<template>
  <router-view />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMobileApp',
});
</script>

<style>
/* 共享组件样式 */
@import '@btc-styles/index.scss';
/* 移动端全局样式 */
@import './styles/index.scss';

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
</style>

