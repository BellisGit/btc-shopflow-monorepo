<template>
  <!-- 使用包装 div 来隔离属性传递，避免 el-dropdown 的 role 属性传递到 el-tooltip -->
  <div class="btc-icon-button-wrapper">
    <el-tooltip
      v-if="tooltipText"
      :content="tooltipText"
      placement="bottom"
      teleported
    >
      <div
        :class="buttonClasses"
        :aria-disabled="isDisabled"
        @click="handleClick($event)"
      >
        <btc-svg
          :name="iconName"
          :size="config.size || 16"
        />
        <span
          v-if="config.badge !== undefined && config.badge > 0"
          class="btc-icon-button__badge"
        >
          {{ config.badge > 99 ? '99+' : config.badge }}
        </span>
      </div>
    </el-tooltip>
    <div
      v-else
      :class="buttonClasses"
      :aria-disabled="isDisabled"
      @click="handleClick($event)"
    >
      <btc-svg
        :name="iconName"
        :size="config.size || 16"
      />
      <span
        v-if="config.badge !== undefined && config.badge > 0"
        class="btc-icon-button__badge"
      >
        {{ config.badge > 99 ? '99+' : config.badge }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BtcSvg from '../../others/btc-svg/index.vue';
import type { IconButtonConfig } from './types';

const props = defineProps<{
  config: IconButtonConfig;
}>();

// 计算图标名称（支持动态函数）
const iconName = computed(() => {
  if (typeof props.config.icon === 'function') {
    return props.config.icon();
  }
  return props.config.icon;
});

// 计算 tooltip 文本（支持动态函数）
const tooltipText = computed(() => {
  if (!props.config.tooltip) return undefined;
  if (typeof props.config.tooltip === 'function') {
    return props.config.tooltip();
  }
  return props.config.tooltip;
});

const isDisabled = computed(() => Boolean(props.config.disabled));

const buttonClasses = computed(() => [
  'btc-comm__icon',
  'btc-icon-button',
  props.config.class,
  { 'is-disabled': isDisabled.value }
]);

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }
  if (props.config.onClick) {
    // 传递事件对象，以便用于动画计算（如主题切换动画）
    props.config.onClick(event as any);
  }
};
</script>

<style lang="scss" scoped>
.btc-icon-button-wrapper {
  display: inline-block;
}

.btc-icon-button {
  position: relative;

  &__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    line-height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--el-color-danger);
    border-radius: 8px;
    text-align: center;
    box-sizing: border-box;
    z-index: 10;
  }
}
</style>

