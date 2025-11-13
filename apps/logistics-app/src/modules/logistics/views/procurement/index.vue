<template>
  <div class="procurement-page">
    <router-view v-slot="{ Component }">
      <div class="procurement-page__content">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LogisticsProcurement',
});
</script>

<style scoped lang="scss">
.procurement-page {
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.procurement-page__content {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.procurement-page__content > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>

