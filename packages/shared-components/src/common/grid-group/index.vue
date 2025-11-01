<template>
  <div class="btc-grid-group">
    <!-- 顶栏区域 -->
    <div class="btc-grid-group__header">
      <div v-if="$slots.headerLeft" class="btc-grid-group__header-left">
        <slot name="headerLeft" />
      </div>
      <div v-if="$slots.headerMiddle" class="btc-grid-group__header-middle">
        <slot name="headerMiddle" />
      </div>
      <div v-if="$slots.headerRight" class="btc-grid-group__header-right">
        <slot name="headerRight" />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="btc-grid-group__body">
      <div v-if="$slots.bodyLeft" class="btc-grid-group__body-left">
        <slot name="bodyLeft" />
      </div>
      <div v-if="$slots.bodyMiddle" class="btc-grid-group__body-middle">
        <slot name="bodyMiddle" />
      </div>
      <div v-if="$slots.bodyRight" class="btc-grid-group__body-right">
        <slot name="bodyRight" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BtcGridGroupProps {
  leftWidth?: string;    // 左侧区域宽度，默认 '20%'
  rightWidth?: string;   // 右侧区域宽度，默认 '25%'
}

const props = withDefaults(defineProps<BtcGridGroupProps>(), {
  leftWidth: '20%',
  rightWidth: '25%'
});
</script>

<style lang="scss" scoped>
.btc-grid-group {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0; // 确保flex子元素能够正确收缩
  min-width: 0; // 确保flex子元素能够正确收缩

  &__header {
    flex-shrink: 0;
    padding: 8px 0;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    min-height: 0; // 确保flex子元素能够正确收缩
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__header-left {
    flex: 0 0 v-bind(leftWidth);
    display: flex;
    align-items: center;
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__body-left {
    flex: 0 0 v-bind(leftWidth);
    display: flex;
    flex-direction: column;
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__header-middle {
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 16px;
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__body-middle {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0; // 确保flex子元素能够正确收缩
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__header-right {
    flex: 0 0 v-bind(rightWidth);
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 12px;
    min-width: 0; // 确保flex子元素能够正确收缩
  }

  &__body-right {
    flex: 0 0 v-bind(rightWidth);
    display: flex;
    flex-direction: column;
    min-width: 0; // 确保flex子元素能够正确收缩
  }
}
</style>
