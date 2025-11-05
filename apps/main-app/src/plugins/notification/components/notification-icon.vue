<template>
  <BtcIconButton
    :config="{
      icon: 'notice',
      tooltip: t('common.tooltip.notification'),
      badge: unreadCount,
      popover: {
        component: BtcNotificationPanel,
        width: 360,
        placement: 'bottom-end',
        popperClass: 'btc-notification-popover'
      }
    }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcNotificationIcon'
});

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import BtcNotificationPanel from './notification-panel.vue';

const { t } = useI18n();

const unreadCount = ref(6); // 模拟未读数量
</script>

