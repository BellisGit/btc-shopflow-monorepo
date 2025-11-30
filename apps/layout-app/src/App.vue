<template>
  <div id="layout-app">
    <Layout />
  </div>
</template>

<script setup lang="ts">
import Layout from '@system/modules/base/components/layout/index.vue';
</script>

<style>
#layout-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
</style>

