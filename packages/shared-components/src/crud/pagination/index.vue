<template>
  <el-pagination
    v-model:current-page="crud.pagination.page"
    v-model:page-size="crud.pagination.size"
    :total="crud.pagination.total"
    :page-sizes="pageSizes"
    :layout="layout"
    v-bind="$attrs"
    @current-change="crud.handlePageChange"
    @size-change="crud.handleSizeChange"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue';
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
</script>

