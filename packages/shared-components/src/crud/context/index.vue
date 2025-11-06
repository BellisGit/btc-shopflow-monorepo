<template>
  <div ref="crudRef" class="btc-crud" :class="{ 'is-border': border, 'has-pagination': hasPagination }" :style="{ padding }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, onMounted, ref, onUpdated, getCurrentInstance } from 'vue';
import { useCrud, type CrudService, type CrudOptions } from '@btc/shared-core';
import { BtcMessage } from '../../components/feedback/btc-message';

/**
 * BtcCrud 上下文容器
 * 提供 CRUD 上下文给所有子组件使用
 */

export interface Props {
  // CRUD 服务（必填）
  service: CrudService;

  // CRUD 配置
  options?: Omit<CrudOptions, 'service'>;

  // 样式
  border?: boolean;
  padding?: string;

  // 是否自动加载数据
  autoLoad?: boolean;

  // 刷新前钩子
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
}

const props = withDefaults(defineProps<Props>(), {
  border: false,
  padding: '0',
  autoLoad: true,
});

// 检测是否有分页组件
const hasPagination = ref(false);
const crudRef = ref<HTMLElement>();

// 创建 CRUD 实例
const crud = useCrud({
  service: props.service,
  onBeforeRefresh: props.onBeforeRefresh,
  onSuccess: (message: string) => {
    BtcMessage.success(message);
  },
  ...props.options,
});

// 提供给子组件
provide('btc-crud', crud);

// 检测分页组件的存在
function checkPagination() {
  if (!crudRef.value) return;

  // 在当前组件实例内查找分页组件
  const paginationEl = crudRef.value.querySelector('.el-pagination');
  hasPagination.value = !!paginationEl;
}

// 管理表格引用
const tableRef = ref();

// 提供给子组件
provide('btc-crud', crud);
provide('btc-table-ref', tableRef);

// 检测父组件的辅助函数
function checkParentComponent(componentName: string): boolean {
  let parent = getCurrentInstance()?.parent;

  while (parent) {
    if (parent.type.name === componentName || parent.type.__name === componentName) {
      return true;
    }
    parent = parent.parent;
  }

  return false;
}

// 组件挂载时自动加载数据
onMounted(() => {
  // 智能检测：如果有 BtcViewGroup 父组件，则不自动加载
  // BtcTableGroup 中的 BtcCrud 应该能够自动加载
  const hasViewGroupParent = checkParentComponent('BtcViewGroup');
  const hasTableGroupParent = checkParentComponent('BtcTableGroup');

  if (props.autoLoad && !hasViewGroupParent) {
    crud.loadData();
  }
  // 延迟检测分页组件，确保子组件已经渲染
  setTimeout(checkPagination, 500);
});

// 组件更新时重新检测分页组件
onUpdated(() => {
  checkPagination();
});

// 暴露给父组件
defineExpose({
  crud,
  ...crud,
});
</script>

