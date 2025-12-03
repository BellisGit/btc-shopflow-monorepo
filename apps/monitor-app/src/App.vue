<template>
  <div class="monitor-app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

defineOptions({
  name: 'MonitorApp',
});

const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
</script>

<style scoped>
.monitor-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

