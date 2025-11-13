<template>
  <div :class="['logistics-app', { 'is-standalone': isStandalone }]">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <div :key="viewKey" ref="contentRef" class="logistics-app__page">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { provideContentHeight } from '@btc/shared-components';

defineOptions({
  name: 'LogisticsApp',
});

const viewKey = ref(1);
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
const emitter = (window as any).__APP_EMITTER__;
const contentRef = ref<HTMLElement | null>(null);
const { register: registerContentHeight, emit: emitContentResize } = provideContentHeight();

// 刷新视图
function refreshView() {
  viewKey.value += 1;
}

onMounted(() => {
  if (emitter) {
    emitter.on('subapp.refresh', refreshView);
  }
  registerContentHeight(contentRef.value);
  const handleWindowResize = () => emitContentResize();
  window.addEventListener('resize', handleWindowResize);
  onUnmounted(() => {
    window.removeEventListener('resize', handleWindowResize);
  });
});

onUnmounted(() => {
  if (emitter) {
    emitter.off('subapp.refresh', refreshView);
  }
});

watch(contentRef, (el) => {
  registerContentHeight(el ?? null);
  emitContentResize();
});
</script>

<style scoped>
.logistics-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.logistics-app.is-standalone {
  padding: 20px;
}

.logistics-app__page {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.logistics-app__page > * {
  flex: 1 1 auto;
  min-width: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

