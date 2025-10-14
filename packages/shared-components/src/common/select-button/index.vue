<template>
  <el-segmented
    v-model="value"
    :options="options"
    :class="['btc-select-button', { 'is-small': small }]"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcSelectButton'
});

import { computed } from 'vue';

interface Props {
  modelValue?: string | number | any[];
  options?: Array<{ label: string; value: any }>;
  prop?: string;
  small?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  small: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
  'change': [value: any];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
  }
});

const handleChange = (val: any) => {
  emit('change', val);
};
</script>

<style lang="scss" scoped>
.btc-select-button {
  padding: 5px;
  border-radius: var(--btc-select-button-radius);
  user-select: none;

  --btc-select-button-radius: 6px;
  --btc-select-button-padding: 5px 15px;

  :deep(.el-segmented__item-selected) {
    border-radius: var(--btc-select-button-radius) !important;
  }

  :deep(.el-segmented__item) {
    padding: var(--btc-select-button-padding) !important;
    border-radius: var(--btc-select-button-radius) !important;
  }

  :deep(.el-segmented__item-label) {
    line-height: unset;
  }

  &.is-small {
    --btc-select-button-radius: 4px;
    --btc-select-button-padding: 3px 10px;

    :deep(.el-segmented__item) {
      padding: var(--btc-select-button-padding) !important;
      font-size: 12px;
    }
  }
}
</style>

