<template>
  <div class="main-app">
    <BtcDevTools />
    <router-view v-slot="{ Component, route }">
      <component
        v-if="Component"
        :is="Component"
        :key="route.meta?.noLayout ? route.fullPath : undefined"
      />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { BtcDevTools } from '@btc/shared-components';
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

.main-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.main-app > router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

