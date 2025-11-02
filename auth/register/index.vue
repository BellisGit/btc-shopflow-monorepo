<template>
  <RegisterMain />
</template>

<script setup lang="ts">
import RegisterMain from './main/index.vue';

defineOptions({
  name: 'Register'
});
</script>

<style lang="scss">
@use '/@/modules/base/pages/auth/shared/styles/auth.scss';
</style>
