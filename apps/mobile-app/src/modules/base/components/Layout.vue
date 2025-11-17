<template>
  <div class="mobile-layout">
    <NavBar
      v-if="showNavBar"
      :title="navTitle"
      left-arrow
      @click-left="handleBack"
    />
    <main class="mobile-layout__content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NavBar } from 'vant';

defineOptions({
  name: 'BtcMobileLayout',
});

const route = useRoute();
const router = useRouter();

const showNavBar = computed(() => {
  return route.meta.showNavBar !== false && route.name !== 'Home';
});

const navTitle = computed(() => {
  return (route.meta.title as string) || '拜里斯科技';
});

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'Home' });
  }
}
</script>


