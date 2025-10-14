<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initEpsData } from '@btc/shared-core';

// 初始化 EPS 数据
onMounted(async () => {
  try {
    const eps = await import('virtual:eps');
    const epsData = eps.default || eps;
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
