<template>
  <a href="https://btc-admin.com" class="copyright">
    {{ t('Copyright © {year} {appName}. All rights reserved.', { year: copyrightYear, appName: app.info.name }) }}
  </a>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';

defineOptions({
  name: 'LoginFooter'
});

defineProps<{
  app: any;
  t: (key: string, params?: any) => string;
}>();

// 生成版权数据，从2012年到当前年份
const currentYear = dayjs().year();
const startYear = 2012;
const copyrightYear = currentYear > startYear ? `${startYear}-${currentYear}` : startYear.toString();
</script>

<style lang="scss">
@use './styles.scss';
</style>
