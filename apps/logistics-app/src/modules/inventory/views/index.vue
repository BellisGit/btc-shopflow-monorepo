<template>
  <div class="inventory-page">
    <router-view v-slot="{ Component }">
      <div class="inventory-page__content">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LogisticsInventory',
});
</script>

<style scoped lang="scss">
.inventory-page {
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.inventory-page__content {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.inventory-page__content > * {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
