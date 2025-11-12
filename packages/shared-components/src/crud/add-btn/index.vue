<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    :type="type"
    class="btc-crud-btn"
    @click="crud.handleAdd"
  >
    <BtcSvg class="btc-crud-btn__icon" name="plus" />
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
  type?: string;
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
});

const { t } = useI18n();
const theme = useThemePlugin();
const attrs = useAttrs();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcAddBtn] Must be used inside <BtcCrud>');
}

const buttonLabel = computed(() => props.text || t('crud.button.add'));
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const isDisabled = computed(() => {
  const value = attrs.disabled;
  if (value === '' || value === true || value === 'true') return true;
  return false;
});

const allowedTypes = ['primary', 'success', 'warning', 'danger', 'info', 'default'] as const;
type AllowedButtonType = typeof allowedTypes[number];

const iconType = computed<AllowedButtonType>(() => {
  const value = (props.type || 'primary') as string;
  if (allowedTypes.includes(value as AllowedButtonType)) {
    return value as AllowedButtonType;
  }
  if (value === 'text') return 'default';
  return 'primary';
});

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'plus',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: iconType.value,
  onClick: () => {
    if (!isDisabled.value) {
      crud.handleAdd();
    }
  },
  disabled: isDisabled.value,
}));
</script>

