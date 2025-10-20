<template>
  <div class="btc-message-wrapper">
    <el-message
      :type="type"
      :message="message"
      :duration="duration"
      :dangerously-use-html-string="dangerouslyUseHTMLString"
      :grouping="grouping"
      :repeat-num="repeatNum"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
// 组件名称
defineOptions({
  name: 'BtcMessageComponent',
});

// Props 定义
interface Props {
  type?: 'success' | 'warning' | 'info' | 'error';
  message: string;
  duration?: number;
  dangerouslyUseHTMLString?: boolean;
  grouping?: boolean;
  repeatNum?: number;
}

withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  dangerouslyUseHTMLString: false,
  grouping: false,
  repeatNum: 1,
});

// Emits 定义
const emit = defineEmits<{
  close: [];
}>();

// 处理关闭事件
const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.btc-message-wrapper {
  position: relative;
  display: inline-block;

  :deep(.el-badge__content) {
    position: absolute !important;
    top: -8px !important;
    right: -8px !important;
    transform: translate(50%, -50%) !important;
    width: 18px !important;
    height: 18px !important;
    padding: 0 !important;
    border-radius: 9px !important;
    font-size: 12px !important;
    line-height: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    border: none !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    min-width: 18px !important;
    min-height: 18px !important;
    transition: all 0.2s ease-in-out !important;
    opacity: 1 !important;
    z-index: 9999 !important;
    pointer-events: none !important;
  }
}

// 主题适配
:root {
  --btc-message-badge-success: #67c23a;
  --btc-message-badge-warning: #e6a23c;
  --btc-message-badge-info: #909399;
  --btc-message-badge-error: #f56c6c;
}

// 暗色主题适配
[data-theme='dark'] {
  .btc-message-wrapper {
    :deep(.el-badge__content) {
      border-color: #ffd700;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .btc-message-wrapper {
    :deep(.el-badge__content) {
      width: 16px !important;
      height: 16px !important;
      font-size: 11px !important;
      line-height: 16px !important;
      min-width: 16px !important;
    }
  }
}
</style>
