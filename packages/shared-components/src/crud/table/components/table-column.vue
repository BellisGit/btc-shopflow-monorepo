<template>
  <el-table-column
    v-if="!column.hidden"
    v-bind="column"
    :resizable="getColumnResizable(column)"
  >
    <!-- 澶氱骇琛ㄥご锛氶€掑綊娓叉煋瀛愬垪 -->
    <template v-if="column.children && column.children.length > 0">
      <table-column
        v-for="(child, childIndex) in column.children"
        :key="child.prop || childIndex"
        :column="child"
      />
    </template>

    <!-- 鏅€氬垪鍐呭 -->
    <template v-if="!column.children && column.type !== 'selection' && column.type !== 'index' && column.type !== 'expand' && column.type !== 'op'" #default="scope">
      <!-- 瀛楀吀褰╄壊鏍囩 -->
      <el-tag
        v-if="column._dictFormatter && column.prop"
        :type="column._dictFormatter(scope.row).type"
        size="small"
      >
        {{ column._dictFormatter(scope.row).label }}
      </el-tag>

      <!-- 鑷畾涔夋覆鏌撶粍浠?-->
      <component
        v-else-if="column.component && column.prop"
        :is="column.component.name"
        :modelValue="scope.row[column.prop!]"
        v-bind="column.component.props"
        @update:modelValue="(val: any) => column.prop && (scope.row[column.prop] = val)"
      />

      <!-- 鏍煎紡鍖栧櫒 -->
      <span v-else-if="column.formatter && column.prop">
        {{ column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) }}
      </span>

      <!-- 榛樿鏄剧ず -->
      <span v-else-if="column.prop">{{ scope.row[column.prop] }}</span>
    </template>

    <!-- 鎿嶄綔鍒?-->
    <template v-if="!column.children && column.type === 'op'" #default="scope">
      <slot name="op-slot" :scope="scope" :column="column" />
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import type { TableColumn } from '../types';

defineOptions({
  name: 'TableColumn',
});

defineProps<{
  column: TableColumn;
}>();

// 智能判断列是否可调整宽度
const getColumnResizable = (column: TableColumn): boolean => {
  // 如果明确设置了 resizable 属性，使用该值
  if (column.resizable !== undefined) {
    return column.resizable;
  }

  // 默认规则：所有列都支持调整（除了明确禁用的类型）
  const nonResizableTypes = ['selection', 'index'];
  const result = !nonResizableTypes.includes(column.type || '');

  return result;
};
</script>


