<template>
  <div class="config-page">
    <router-view v-slot="{ Component }">
      <div class="config-page__content">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LogisticsConfig',
});
</script>

<style scoped lang="scss">
.config-page {
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.config-page__content {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.config-page__content > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>

