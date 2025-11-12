<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    type="danger"
    class="btc-crud-btn"
    :disabled="selectionCount === 0"
    @click="crud.handleMultiDelete"
  >
    <BtcSvg class="btc-crud-btn__icon" name="delete-batch" />
    <span class="btc-crud-btn__text">
      <slot v-if="hasDefaultSlot" />
      <template v-else>
        {{ buttonLabel }}
        <span class="btc-crud-btn__count"> ({{ selectionCount }})</span>
      </template>
    </span>
    <span v-if="selectionCount" class="btc-crud-btn__badge">
      {{ selectionCount }}
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue';
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
const slots = useSlots();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcMultiDeleteBtn] Must be used inside <BtcCrud>');
}

const selectionCount = computed(() => crud.selection.value.length);
const buttonLabel = computed(() => props.text || t('crud.button.multi_delete'));
const accessibleLabel = computed(() => {
  const base = buttonLabel.value;
  return selectionCount.value > 0 ? `${base} (${selectionCount.value})` : base;
});
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');
const hasDefaultSlot = computed(() => Boolean(slots.default));

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'delete-batch',
  tooltip: accessibleLabel.value,
  badge: selectionCount.value || undefined,
  type: 'danger',
  ariaLabel: accessibleLabel.value,
  onClick: () => {
    if (selectionCount.value > 0) {
      crud.handleMultiDelete(crud.selection.value as any[]);
    }
  },
  disabled: selectionCount.value === 0,
}));

</script>

