<template>
  <div class="btc-crud-actions btc-crud-right-group">
    <slot />
    <BtcTableToolbar />
  </div>
</template>

<script setup lang="ts">
import BtcTableToolbar from '../toolbar/inline.vue';
</script>
