<template>
  <div :class="['admin-app', { 'is-standalone': isStandalone }]">
    <div class="admin-app__container" ref="containerRef">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-left" mode="out-in">
          <div :key="route.fullPath" ref="contentRef" class="admin-app__page">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { provideContentHeight } from '@btc/shared-components';

defineOptions({
  name: 'AdminApp',
});

const route = useRoute();
const viewKey = ref(1);
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
const emitter = (window as any).__APP_EMITTER__;
const containerRef = ref<HTMLElement | null>(null);
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
.admin-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.admin-app.is-standalone {
  padding: 20px;
}

.admin-app__container {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.admin-app__page {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-app__page > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
