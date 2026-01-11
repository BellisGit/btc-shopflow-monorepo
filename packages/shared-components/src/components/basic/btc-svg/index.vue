<template>
  <svg :class="svgClass" :style="style" aria-hidden="true">
    <!-- 同时支持 href 和 xlink:href，确保兼容性 -->
    <use :href="iconName" :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'btc-svg'
});

import { computed } from 'vue';

// 解析像素值
function parsePx(val: string | number | undefined): string | undefined {
  if (val === undefined) return undefined;
  return typeof val === 'number' ? `${val}px` : val;
}

const props = defineProps({
  // 图标名称（不需要 icon- 前缀）
  name: String,
  // 自定义类名
  className: String,
  // 图标颜色
  color: String,
  // 图标大小
  size: [String, Number]
});

const style = computed(() => ({
  fontSize: parsePx(props.size),
  fill: props.color
}));

// 自动添加 icon- 前缀
const iconName = computed(() => `#icon-${props.name}`);

const svgClass = computed(() => {
  return ['btc-svg', `btc-svg__${props.name}`, String(props.className || '')];
});
</script>

<style lang="scss" scoped>
.btc-svg {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>

