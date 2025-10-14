<template>
  <div class="btc-crud" :class="{ 'is-border': border }" :style="{ padding }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useCrud, type CrudService, type CrudOptions } from '@btc/shared-core';

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
}

const props = withDefaults(defineProps<Props>(), {
  border: false,
  padding: '0',
});

// 创建 CRUD 实例
const crud = useCrud({
  service: props.service,
  ...props.options,
});

// 提供给子组件
provide('btc-crud', crud);

// 暴露给父组件
defineExpose({
  crud,
  ...crud,
});
</script>

