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
// 记录初始页码，避免在初始化时触发事件
const initialPage = ref(crud.pagination.page);
// 标记是否已经处理过初始页码设置
const hasHandledInitialPage = ref(false);

onMounted(() => {
  // 记录初始页码
  initialPage.value = crud.pagination.page;
  hasHandledInitialPage.value = true;
  // 延迟标记为已初始化，确保不会在初始化时触发事件
  setTimeout(() => {
    isInitialized.value = true;
  }, 200);
});

// 处理页码变化事件
const handleCurrentChange = (page: number) => {
  // 如果还在初始化阶段，只更新初始页码，不触发数据加载
  if (!isInitialized.value) {
    if (!hasHandledInitialPage.value) {
      initialPage.value = page;
      hasHandledInitialPage.value = true;
    }
    return;
  }
  
  // 只有在初始化完成后，并且页码确实发生了变化，才触发数据加载
  if (page !== initialPage.value) {
    initialPage.value = page; // 更新初始页码
    crud.handlePageChange(page);
  }
};
</script>

