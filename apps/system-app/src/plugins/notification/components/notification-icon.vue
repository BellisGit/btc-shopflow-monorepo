<template>
  <BtcIconButton :config="notificationConfig" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcNotificationIcon'
});

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import BtcNotificationPanel from './notification-panel.vue';

const { t } = useI18n();

const unreadCount = ref(6); // 模拟未读数量
const hasUnread = computed(() => unreadCount.value > 0);

const notificationConfig = computed(() => ({
  icon: 'notice',
  tooltip: t('common.tooltip.notification'),
  class: hasUnread.value ? 'btc-icon-button--breath btc-icon-button--breath--warning' : '',
  popover: {
    component: BtcNotificationPanel,
    width: 360,
    placement: 'bottom-end',
    popperClass: 'btc-notification-popover'
  }
}));
</script>

<style lang="scss" scoped>
</style>

