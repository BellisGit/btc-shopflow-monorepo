<template>
  <a :href="appConfig.company.website" class="copyright">
    {{ appConfig.copyright.text }}
  </a>
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app';

defineOptions({
  name: 'BtcAuthFooter'
});
</script>
