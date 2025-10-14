<template>
  <el-button v-bind="$attrs" :type="type" @click="crud.handleAdd">
    <slot>{{ text || t('crud.button.add') }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';

export interface Props {
  type?: string;
  text?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
});

const { t } = useI18n();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcAddBtn] Must be used inside <BtcCrud>');
}
</script>
