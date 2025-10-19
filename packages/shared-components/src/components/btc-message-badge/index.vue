<template>
  <div class="btc-message-badge">
    <el-badge
      :value="displayCount"
      :max="99"
      :class="['btc-message-badge__badge', { 'is-hidden': shouldHide, 'is-animating': isAnimating }]"
    >
      <div class="btc-message-badge__placeholder"></div>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';

// 组件名称
defineOptions({
  name: 'BtcMessageBadge'
});

// Props 定义
interface Props {
  badgeCount: number;
}

const props = withDefaults(defineProps<Props>(), {
  badgeCount: 1
});

// 计算显示的数字，只有重复消息才显示数字
const displayCount = computed(() => {
  return props.badgeCount > 1 ? props.badgeCount : 0; // 只有重复消息才显示数字
});

// 计算是否应该隐藏徽章
const shouldHide = computed(() => {
  return props.badgeCount <= 1; // 只有当badgeCount为1或更小时才隐藏（单条消息不显示徽章）
});

// 添加数字变化的动画效果
const isAnimating = ref(false);

// 监听 badgeCount 变化，确保响应式更新
watch(() => props.badgeCount, (newCount, oldCount) => {
  // 如果数字发生变化，添加动画效果
  if (oldCount !== undefined && newCount !== oldCount) {
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 200);
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.btc-message-badge {
  // 徽章现在是完全独立的，不需要定位样式
  width: 0;
  height: 0;
  pointer-events: none;
  overflow: visible;

  &__badge {
    position: relative;
    display: block;
    width: 0;
    height: 0;

    :deep(.el-badge__content) {
      position: absolute;
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
      width: 18px !important;
      height: 18px !important;
      padding: 0 !important;
      border-radius: 9px;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 !important;
      border: none !important;
      box-sizing: border-box !important;
      overflow: visible !important;
      min-width: 18px;
      min-height: 18px;
      transition: all 0.2s ease-in-out;
      opacity: 1;
    }

    // 当徽章隐藏时的过渡效果
    &.is-hidden :deep(.el-badge__content) {
      opacity: 0;
      transform: translate(50%, -50%) scale(0.8);
    }

    // 数字变化时的动画效果
    &.is-animating :deep(.el-badge__content) {
      animation: badgePulse 0.2s ease-in-out;
    }
  }

  // 徽章脉冲动画
  @keyframes badgePulse {
    0% {
      transform: translate(50%, -50%) scale(1);
    }
    50% {
      transform: translate(50%, -50%) scale(1.2);
    }
    100% {
      transform: translate(50%, -50%) scale(1);
    }
  }

  &__placeholder {
    width: 0;
    height: 0;
    visibility: hidden;
    display: none;
  }
}
</style>
