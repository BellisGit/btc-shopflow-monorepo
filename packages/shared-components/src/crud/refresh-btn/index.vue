<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    class="btc-crud-btn"
    @click="crud.handleRefresh"
  >
    <BtcSvg class="btc-crud-btn__icon" name="refresh" />
    <span class="btc-crud-btn__text">
      <slot>{{ buttonLabel }}</slot>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  text?: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const theme = useThemePlugin();
const attrs = useAttrs();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcRefreshBtn] Must be used inside <BtcCrud>');
}

const buttonLabel = computed(() => props.text || t('crud.button.refresh'));
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const isDisabled = computed(() => {
  const value = attrs.disabled;
  return value === '' || value === true || value === 'true';
});

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'refresh',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: 'default',
  onClick: () => {
    if (!isDisabled.value) {
      crud.handleRefresh();
    }
  },
  disabled: isDisabled.value,
}));
</script>

