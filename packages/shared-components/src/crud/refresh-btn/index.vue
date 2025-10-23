<template>
  <el-button v-bind="$attrs" @click="crud.handleRefresh">
    <slot>{{ text || t('crud.button.refresh') }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';

export interface Props {
  text?: string;
}

defineProps<Props>();

const { t } = useI18n();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcRefreshBtn] Must be used inside <BtcCrud>');
}
</script>

