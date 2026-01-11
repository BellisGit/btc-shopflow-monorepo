<template>
  <div
    class="btc-split-layout"
    :class="[isExpand ? 'is-expand' : 'is-collapse', `is-left-size-${props.leftSize || 'default'}`]"
    :style="splitLayoutStyle"
  >
    <div class="btc-split-layout__wrap">
      <!-- 左侧 -->
      <div class="btc-split-layout__left">
        <slot name="left" :is-expand="isExpand" :expand="expand" />

        <!-- 收起按钮（移动端） -->
        <div v-if="isMobile && showMobileCollapseBtn" class="collapse-btn" @click="expand(false)">
          <btc-svg name="right" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="btc-split-layout__right">
        <!-- 右侧头部（可选） -->
        <div v-if="hasRightHeader" class="btc-split-layout__header">
          <slot name="header" :is-expand="isExpand" :expand="expand">
            <!-- 默认折叠按钮 -->
            <div
              class="header-icon"
              :class="{ 'is-fold': !isExpand }"
              @click="expand()"
            >
              <btc-svg name="back" />
            </div>

            <!-- 标题区域 -->
            <div class="header-title">
              <slot name="title" :is-expand="isExpand" />
            </div>

            <!-- 右侧操作区 -->
            <div class="header-actions">
              <slot name="actions" :is-expand="isExpand" />
            </div>
          </slot>
        </div>

        <!-- 右侧内容 -->
        <div class="btc-split-layout__content" :class="{ 'has-header': hasRightHeader }">
          <slot name="right" :is-expand="isExpand" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, useSlots } from 'vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import { useContentHeight } from '../../../composables/content-height';
import type { BtcSplitLayoutProps, BtcSplitLayoutEmits, BtcSplitLayoutExpose } from './types';

defineOptions({
  name: 'BtcSplitLayout',
  components: {
    BtcSvg,
  },
});

const props = withDefaults(defineProps<BtcSplitLayoutProps>(), {
  leftSize: 'default',
  defaultExpand: true,
  autoCollapseOnMobile: true,
});

const emit = defineEmits<BtcSplitLayoutEmits>();

// 定义插槽类型
defineSlots<{
  left?: (props: { isExpand: boolean; expand: (value?: boolean) => void }) => any;
  right?: (props: { isExpand: boolean }) => any;
  header?: (props: { isExpand: boolean; expand: (value?: boolean) => void }) => any;
  title?: (props: { isExpand: boolean }) => any;
  actions?: (props: { isExpand: boolean }) => any;
}>();

const slots = useSlots();

// 响应式数据
const isExpand = ref(props.defaultExpand);

// 计算左侧宽度：如果指定了 leftWidth 则使用，否则根据 leftSize 计算
const leftPaneWidth = computed(() => {
  // 如果明确指定了 leftWidth，优先使用
  if (props.leftWidth && typeof props.leftWidth === 'string' && props.leftWidth.trim()) {
    return props.leftWidth;
  }
  // 根据 leftSize 计算宽度：default 为 300px，small 为 150px，middle 为 225px
  if (props.leftSize === 'small') {
    return '150px';
  } else if (props.leftSize === 'middle') {
    return '225px';
  }
  return '300px';
});

// 样式计算
const splitLayoutStyle = computed(() => {
  const width = leftPaneWidth.value;
  return {
    '--btc-split-layout-left-width': width || '300px',
  };
});

// 检测移动端
const isMobile = computed(() => window.innerWidth <= 768);

// 是否显示右侧头部（如果提供了 header、title 或 actions 插槽）
const hasRightHeader = computed(() => {
  return !!(slots.header || slots.title || slots.actions);
});

// 是否显示移动端折叠按钮
const showMobileCollapseBtn = computed(() => {
  return slots.left && isMobile.value;
});

// 内容高度管理
const { emit: emitContentResize } = useContentHeight();

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

// 展开/收起
function expand(value?: boolean) {
  const newValue = value === undefined ? !isExpand.value : value;
  if (isExpand.value !== newValue) {
    isExpand.value = newValue;
    emit('expand-change', newValue);
    scheduleContentResize();
  }
}

// 监听屏幕变化 - 移动端自动收起
watch(
  [isMobile, () => props.autoCollapseOnMobile],
  ([mobile, autoCollapse]) => {
    if (mobile && autoCollapse) {
      expand(false);
    }
  },
  { immediate: true }
);

// 监听 defaultExpand 变化
watch(
  () => props.defaultExpand,
  (newValue) => {
    if (isExpand.value !== newValue) {
      isExpand.value = newValue;
    }
  }
);

// 暴露
defineExpose<BtcSplitLayoutExpose>({
  isExpand: computed(() => isExpand.value),
  isMobile,
  expand,
});
</script>

<style lang="scss" scoped>
.btc-split-layout {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__wrap {
    height: 100%;
    display: flex;
    overflow: hidden;
    position: relative;
    background-color: var(--el-bg-color);
    border-radius: 4px;
  }

  &__left {
    position: relative;
    height: 100%;
    width: var(--btc-split-layout-left-width, 300px);
    background-color: var(--el-bg-color);
    flex-shrink: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    overflow: hidden;

    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 20px;
      bottom: 30px;
      height: 40px;
      width: 40px;
      border-radius: 100%;
      background-color: var(--el-color-primary);
      box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 10;

      .btc-svg {
        color: #fff;
        font-size: 18px;
      }

      &:hover {
        background-color: var(--el-color-primary-light-3);
      }
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 100%;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: var(--el-bg-color);
    will-change: width;
  }

  &__header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    flex-shrink: 0;
    padding: 0 10px;

    .header-icon {
      position: absolute;
      left: 10px;
      height: 26px;
      width: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.2s ease-in-out;
      color: var(--el-text-color-regular);
      background-color: var(--el-fill-color-lighter);

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }

      &.is-fold {
        transform: rotate(180deg);
      }

      :deep(.btc-svg) {
        font-size: 16px;
        outline: none;
      }
    }

    .header-title {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-actions {
      position: absolute;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;

    &.has-header {
      height: calc(100% - 40px);
    }
  }

  // 展开状态
  &.is-expand {
    .btc-split-layout__right {
      width: calc(100% - var(--btc-split-layout-left-width, 300px));
      border-left: 1px solid var(--el-border-color-extra-light);
    }
  }

  // 折叠状态
  &.is-collapse {
    .btc-split-layout__left {
      width: 0;
      overflow: hidden;
    }

    .btc-split-layout__right {
      width: 100%;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .btc-split-layout {
    &__left {
      overflow: hidden;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 0;
      z-index: 20;
      will-change: width;
    }

    &__right {
      width: 100% !important;
    }

    &.is-expand {
      .btc-split-layout__left {
        width: 100%;
      }
    }
  }
}
</style>
