<template>
  <el-table-column
    v-if="!column.hidden"
    v-bind="column"
  >
    <!-- 多级表头：递归渲染子列 -->
    <template v-if="column.children && column.children.length > 0">
      <table-column
        v-for="(child, childIndex) in column.children"
        :key="child.prop || childIndex"
        :column="child"
      />
    </template>

    <!-- 普通列内容 -->
    <template v-if="!column.children && column.type !== 'selection' && column.type !== 'index' && column.type !== 'expand' && column.type !== 'op'" #default="scope">
      <!-- 字典彩色标签 -->
      <el-tag
        v-if="column._dictFormatter && column.prop"
        :type="column._dictFormatter(scope.row).type"
        size="small"
      >
        {{ column._dictFormatter(scope.row).label }}
      </el-tag>

      <!-- 自定义渲染组件 -->
      <component
        v-else-if="column.component && column.prop"
        :is="column.component.name"
        :modelValue="scope.row[column.prop!]"
        v-bind="column.component.props"
        @update:modelValue="(val: any) => column.prop && (scope.row[column.prop] = val)"
      />

      <!-- 格式化器 -->
      <span v-else-if="column.formatter && column.prop">
        {{ column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) }}
      </span>

      <!-- 默认显示 -->
      <span v-else-if="column.prop">{{ scope.row[column.prop] }}</span>
    </template>

    <!-- 操作列 -->
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
</script>

