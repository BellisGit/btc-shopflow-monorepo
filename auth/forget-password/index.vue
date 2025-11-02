<template>
  <ForgetPasswordMain />
</template>

<script setup lang="ts">
import ForgetPasswordMain from './components/index.vue';

defineOptions({
  name: 'ForgetPassword'
});
</script>

<style lang="scss">
@use '/@/modules/base/pages/auth/shared/styles/auth.scss';
</style>
