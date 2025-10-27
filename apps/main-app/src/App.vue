<template>
  <router-view />
  <RetryStatusIndicator />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initEpsData } from '@btc/shared-core';
import RetryStatusIndicator from '@/components/RetryStatusIndicator/index.vue';

import epsData from 'virtual:eps';

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
}

#main-app {
  width: 100%;
  height: 100%;
}
</style>
