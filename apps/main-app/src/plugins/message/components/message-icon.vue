<template>
  <BtcIconButton
    :config="{
      icon: 'msg',
      tooltip: t('common.tooltip.message'),
      badge: unreadCount,
      popover: {
        component: BtcMessagePanel,
        width: 360,
        placement: 'bottom-end',
        popperClass: 'btc-message-popover'
      }
    }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMessageIcon'
});

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import BtcMessagePanel from './message-panel.vue';

const { t } = useI18n();

const unreadCount = ref(3); // 模拟未读数量

const handleClose = () => {
  // Popover 关闭由组件内部处理
};
</script>

