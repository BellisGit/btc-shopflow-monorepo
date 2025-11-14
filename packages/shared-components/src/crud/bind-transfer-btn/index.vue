<template>
  <BtcTableButton
    v-if="isMinimal"
    class="btc-crud-action-icon"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    class="btc-crud-btn"
    type="primary"
    @click="handleClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="connection" />
    <span class="btc-crud-btn__text">
      <slot>{{ buttonLabel }}</slot>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (event: 'click', evt: MouseEvent): void;
}>();

const { t } = useI18n();
const theme = useThemePlugin();

const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');
const buttonLabel = computed(() => props.text || t('common.button.add'));

function handleClick(evt: MouseEvent) {
  emit('click', evt);
}

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'connection',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: 'primary',
  onClick: () => handleClick(new MouseEvent('click')),
}));
</script>


