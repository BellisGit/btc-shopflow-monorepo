<template>
  <div class="system-app">
    <BtcDevTools />
    <router-view v-slot="{ Component, route }">
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
