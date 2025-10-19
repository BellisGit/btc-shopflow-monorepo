<script lang="ts">
import { defineComponent } from 'vue';
import type { DialogProps } from './types';
import { useDialog, useDialogRender } from './composables';

export default defineComponent({
  name: 'BtcDialog',

  props: {
    // 是否可见
    modelValue: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: '-'
    },
    // 高度
    height: [String, Number],
    // 宽度
    width: {
      type: [String, Number],
      default: '50%'
    },
    // 內间距
    padding: {
      type: String,
      default: '20px'
    },
    // 是否缓存
    keepAlive: Boolean,
    // 是否全屏
    fullscreen: Boolean,
    // 控制按钮
    controls: {
      type: Array,
      default: () => ['fullscreen', 'close']
    },
    // 隐藏头部元素
    hideHeader: Boolean,
    // 关闭前
    beforeClose: Function,
    // 是否需要滚动条
    scrollbar: {
      type: Boolean,
      default: true
    },
    // 背景透明
    transparent: Boolean
  },

  emits: ['update:modelValue', 'fullscreen-change', 'closed'],

  setup(props, { emit, expose, slots }) {
    // 对话框状态管理
    const dialogContext = useDialog(props as DialogProps, emit);

    const {
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen,
    } = dialogContext;

    // 渲染逻辑
    const { render } = useDialogRender(props as DialogProps, dialogContext, slots);

    // 暴露方法
    expose({
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen
    });

    return render;
  }
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss';
</style>
