<template>
  <div class="mobile-layout">
    <main class="mobile-layout__content">
      <router-view />
    </main>
    <Tabbar v-if="showTabbar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Tabbar from './Tabbar.vue';

defineOptions({
  name: 'BtcMobileLayout',
});

const route = useRoute();

// 显示底部导航栏的页面：主页、查询
const showTabbar = computed(() => {
  const tabbarRoutes = ['Home', 'Query'];
  return tabbarRoutes.includes(route.name as string) || route.path === '/';
});
</script>

<style lang="scss" scoped>
.mobile-layout {
  // 确保没有顶部导航栏
  :deep(.van-nav-bar) {
    display: none !important;
  }
}
</style>


