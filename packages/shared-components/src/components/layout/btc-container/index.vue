<template>
  <div :class="containerClass" :style="containerStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, Comment } from 'vue';

export interface BtcContainerProps {
  /** 子组件之间的间距，默认 10px */
  gap?: number | string;
  /** 每行最大列数，默认根据子组件数量智能计算 */
  maxColsPerRow?: number;
}

const props = withDefaults(defineProps<BtcContainerProps>(), {
  gap: 10
});

const slots = useSlots();

// 计算子组件数量
const childrenCount = computed(() => {
  if (!slots.default) return 0;
  return slots.default().filter(node =>
    node.type !== Comment &&
    (typeof node.type !== 'symbol' || node.children)
  ).length;
});

// 根据子组件数量智能计算每行列数
const colsPerRow = computed(() => {
  const count = childrenCount.value;
  if (count === 0) return 1;

  // 如果指定了每行最大列数，使用指定值
  if (props.maxColsPerRow) {
    return props.maxColsPerRow;
  }

  // 智能计算每行列数（优先宽度布局）
  if (count === 1) {
    return 1; // 1个：1列
  } else if (count === 2) {
    return 1; // 2个：1列2行
  } else if (count === 3) {
    return 2; // 3个：第一行2个，第二行1个
  } else if (count === 4) {
    return 2; // 4个：2列2行（桌面端），1列4行（移动端）
  } else {
    return 2; // 5个及以上：保持2列，出现滚动条
  }
});

// 计算需要的行数
const totalRows = computed(() => {
  const count = childrenCount.value;
  const cols = colsPerRow.value;
  return Math.ceil(count / cols);
});

// 判断是否需要滚动
const needsScroll = computed(() => {
  const count = childrenCount.value;
  // 当子组件数量超过4个时，需要滚动
  return count > 4;
});

// 计算间距值
const gapValue = computed(() => {
  return typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
});

// 容器样式类
const containerClass = computed(() => {
  return {
    'btc-container': true,
    'btc-container--scrollable': needsScroll.value
  };
});

// 容器样式
const containerStyle = computed(() => {
  return {
    '--btc-container-gap': gapValue.value,
    '--btc-container-cols': colsPerRow.value.toString(),
    '--btc-container-rows': needsScroll.value ? '2' : totalRows.value.toString(),
    '--btc-container-total-items': childrenCount.value.toString(),
    '--btc-container-mobile-rows': childrenCount.value.toString()
  };
});
</script>

<style lang="scss" scoped>
.btc-container {
  // 使用 Grid 布局
  display: grid;
  gap: var(--btc-container-gap);
  width: 100%;
  height: 100%;

  // 默认桌面端布局：使用计算出的列数和行数
  grid-template-columns: repeat(var(--btc-container-cols), 1fr);
  grid-template-rows: repeat(var(--btc-container-rows), 1fr);

  // 默认不滚动
  overflow: hidden;

  // 响应式断点：中等屏幕及以下强制单列布局
  @media (max-width: 1200px) {
    // 中等屏幕时强制单列布局
    grid-template-columns: 1fr !important;

    // 根据子组件数量重新计算行数
    // 使用CSS自定义属性来动态设置行数
    grid-template-rows: repeat(var(--btc-container-mobile-rows, var(--btc-container-total-items, 4)), 1fr) !important;

    // 禁用滚动，显示所有内容
    overflow-y: visible !important;
  }

  // 平板屏幕
  @media (max-width: 768px) {
    gap: calc(var(--btc-container-gap) * 0.9); // 稍微减少间距
  }

  // 手机屏幕
  @media (max-width: 480px) {
    gap: calc(var(--btc-container-gap) * 0.8); // 进一步减少间距
  }

  // 当需要滚动时（仅在大屏幕）
  &--scrollable {
    @media (min-width: 1201px) {
      // 固定显示2行，超出部分滚动
      grid-template-rows: repeat(2, 1fr);
      overflow-y: auto;

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      }

      // 暗色模式滚动条
      @media (prefers-color-scheme: dark) {
        &::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);

          &:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }

  // 确保子元素填满网格项
  :deep(> *) {
    width: 100%;
    height: 100%;
    min-width: 0; // 防止内容溢出
    min-height: 0; // 防止内容溢出
    box-sizing: border-box; // 确保边框包含在尺寸内
  }
}
</style>
