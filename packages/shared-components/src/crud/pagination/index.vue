<template>
  <el-pagination
    v-model:current-page="crud.pagination.page"
    v-model:page-size="crud.pagination.size"
    :total="crud.pagination.total"
    :page-sizes="pageSizes"
    :layout="layout"
    v-bind="$attrs"
    @current-change="handleCurrentChange"
    @size-change="crud.handleSizeChange"
  />
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';

export interface Props {
  pageSizes?: number[];
  layout?: string;
}

withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
});

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcPagination] Must be used inside <BtcCrud>');
}

// 初始化标记，避免在组件初始化时触发页码变化事件
const isInitialized = ref(false);

onMounted(() => {
  // 延迟标记为已初始化，确保不会在初始化时触发事件
  setTimeout(() => {
    isInitialized.value = true;
  }, 100);
});

// 处理页码变化事件
const handleCurrentChange = (page: number) => {
  // 只有在初始化完成后才处理页码变化
  if (isInitialized.value) {
    crud.handlePageChange(page);
  }
};
</script>

