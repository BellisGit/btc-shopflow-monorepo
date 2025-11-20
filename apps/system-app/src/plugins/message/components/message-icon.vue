<template>
  <BtcIconButton :config="messageConfig" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMessageIcon'
});

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import BtcMessagePanel from './message-panel.vue';

const { t } = useI18n();

const unreadCount = ref(3); // 模拟未读数量

const hasUnread = computed(() => unreadCount.value > 0);

const messageConfig = computed(() => ({
  icon: 'msg',
  tooltip: t('common.tooltip.message'),
  class: hasUnread.value ? 'btc-icon-button--breath btc-icon-button--breath--success' : '',
  popover: {
    component: BtcMessagePanel,
    width: 360,
    placement: 'bottom-end',
    popperClass: 'btc-message-popover'
  }
}));
</script>

<style lang="scss" scoped>
</style>

