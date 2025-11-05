<template>
  <BtcIconButton
    :config="{
      icon: 'github',
      tooltip: t('common.tooltip.github'),
      onClick: toCode
    }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcGithubCode'
});

import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';

const { t } = useI18n();

function toCode() {
  window.open('https://github.com/BellisGit/btc-shopflow.git', '_blank');
}
</script>
