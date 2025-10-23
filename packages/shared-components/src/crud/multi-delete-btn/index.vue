<template>
  <el-button
    v-bind="$attrs"
    type="danger"
    :disabled="crud.selection.value.length === 0"
    @click="crud.handleMultiDelete"
  >
    <slot>{{ text || t('crud.button.multi_delete') }} ({{ crud.selection.value.length }})</slot>
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
  throw new Error('[BtcMultiDeleteBtn] Must be used inside <BtcCrud>');
}
</script>

