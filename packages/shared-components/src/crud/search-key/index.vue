<template>
  <div class="btc-search-key">
    <el-input
      v-model="keyword"
      :placeholder="placeholder"
      clearable
      v-bind="$attrs"
      @keyup.enter="handleSearch"
      @clear="handleClear"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';

export interface Props {
  placeholder?: string;
  field?: string;
}

const props = withDefaults(defineProps<Props>(), {
  field: 'keyword',
});

const { t } = useI18n();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcSearchKey] Must be used inside <BtcCrud>');
}

const keyword = ref('');

const placeholder = computed(() => props.placeholder || t('crud.button.search'));

const handleSearch = () => {
  crud.handleSearch({ [props.field]: keyword.value });
};

const handleClear = () => {
  keyword.value = '';
  crud.handleReset();
};
</script>
