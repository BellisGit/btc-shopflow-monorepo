<template>
  <div class="engineering-app">
    <router-view v-slot="{ Component }">
      <transition name="slide-left" mode="out-in">
        <component :is="Component" :key="viewKey" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({
  name: 'EngineeringApp',
});

const viewKey = ref(1);

function refreshView() {
  viewKey.value += 1;
}

onMounted(() => {
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.on('subapp.refresh', refreshView);
  }
});

onUnmounted(() => {
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.off('subapp.refresh', refreshView);
  }
});
</script>

<style scoped>
.engineering-app {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>

