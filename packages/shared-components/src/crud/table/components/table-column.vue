<template>
  <el-table-column
    v-if="!column.hidden"
    v-bind="column"
    :resizable="getColumnResizable(column)"
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
      <component :is="() => renderContent(column, scope)" />
    </template>

    <!-- 操作列-->
    <template v-if="!column.children && column.type === 'op'" #default="scope">
      <slot name="op-slot" :scope="scope" :column="column" />
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { h, getCurrentInstance, toRaw } from 'vue';
import { ElTag } from 'element-plus';
import type { TableColumn } from '../types';
import { BtcCodeJson } from '../../../plugins/code';

defineOptions({
  name: 'TableColumn',
});

defineProps<{
  column: TableColumn;
}>();

const instance = getCurrentInstance();

// 组件名称到组件实例的映射
const componentMap: Record<string, any> = {
  'BtcCodeJson': BtcCodeJson,
  'btc-code-json': BtcCodeJson,
};

// 渲染列内容
const renderContent = (column: TableColumn, scope: any) => {
  // 字典颜色标签
  if (column._dictFormatter && column.prop) {
    const dict = column._dictFormatter(scope.row);
    return h(ElTag, {
      type: dict.type,
      size: 'small',
      effect: 'plain', // 使用 plain 效果，减少动画
      style: {
        transition: 'none', // 禁用过渡动画
        animation: 'none'   // 禁用动画
      }
    }, { default: () => dict.label });
  }

  // 自定义渲染组件
  if (column.component && column.prop) {
    // 获取原始值，如果为 null 或 undefined 则使用空字符串
    const rawValue = scope.row[column.prop!];
    const modelValue = rawValue == null ? '' : rawValue;

    const props = {
      modelValue,
      ...getComponentProps(column.component.props, scope)
    };

    const componentName = column.component.name;
    if (typeof componentName === 'string') {
      // 从预定义的映射中获取组件
      const component = componentMap[componentName];
      if (component) {
        return h(toRaw(component), props);
      }
      // 如果找不到，回退到显示原始值
      return h('span', {}, { default: () => rawValue || '' });
    }
    // 如果是组件对象，直接使用
    return h(column.component.name, props);
  }

  // 格式化器
  if (column.formatter && column.prop) {
    return h('span', {}, {
      default: () => column.formatter!(
        scope.row,
        scope.column,
        scope.row[column.prop!],
        scope.$index
      )
    });
  }

  // 默认显示
  if (column.prop) {
    return h('span', {}, { default: () => scope.row[column.prop!] || '' });
  }

  return null;
};

// 获取组件属性
const getComponentProps = (props: any, scope: any) => {
  if (!props) return {};

  // 如果是函数，先执行获取属性
  if (typeof props === 'function') {
    return props(scope);
  }

  // 如果是对象，规范化布尔值属性
  if (typeof props === 'object' && props !== null) {
    const normalized = { ...props };
    // 将字符串 'true' 和 'false' 转换为布尔值
    for (const key in normalized) {
      if (normalized[key] === 'true') {
        normalized[key] = true;
      } else if (normalized[key] === 'false') {
        normalized[key] = false;
      }
    }
    return normalized;
  }

  return props;
};

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


