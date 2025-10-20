<template>
  <div class="btc-notification-wrapper">
    <el-notification
      :title="title"
      :message="message"
      :type="type"
      :duration="duration"
      :show-close="showClose"
      :position="position"
      :dangerously-use-html-string="dangerouslyUseHTMLString"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
// 组件名称
defineOptions({
  name: 'BtcNotificationComponent',
});

// Props 定义
interface Props {
  title?: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
  showClose?: boolean;
  position?: string;
  dangerouslyUseHTMLString?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  type: 'info',
  duration: 4500,
  showClose: true,
  position: 'top-right',
  dangerouslyUseHTMLString: false,
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
.btc-notification-wrapper {
  position: relative;
  display: inline-block;
}
</style>
