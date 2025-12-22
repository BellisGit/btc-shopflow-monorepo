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
    transparent: Boolean,
    // 是否居中
    alignCenter: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:modelValue', 'fullscreen-change', 'closed'],

  setup(props, { emit, expose, slots }) {
    // 生产环境日志：记录 setup 初始化
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] setup 开始', {
        modelValue: props.modelValue,
        timestamp: new Date().toISOString(),
      });
    }

    // 对话框状态管理
    const dialogContext = useDialog(props as unknown as DialogProps, emit);

    const {
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen,
    } = dialogContext;

    // 生产环境日志：记录 dialogContext 创建
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] dialogContext 创建', {
        hasVisible: !!visible,
        visibleType: typeof visible,
        visibleValue: visible?.value,
        timestamp: new Date().toISOString(),
      });
    }

    // 渲染逻辑（在 setup 中创建，但 render 函数内部会访问 visible.value）
    const { render } = useDialogRender(props as unknown as DialogProps, dialogContext, slots);

    // 暴露方法
    expose({
      Dialog,
      visible,
      isFullscreen,
      open,
      close,
      changeFullscreen
    });

    // 生产环境日志：记录 render 函数创建
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] render 函数创建', {
        hasRender: typeof render === 'function',
        timestamp: new Date().toISOString(),
      });
    }

    // 关键：直接返回一个函数，确保能够响应式地追踪 visible 的变化
    // 在函数内部访问 visible.value，确保 Vue 能够追踪到这个依赖
    // 当 visible.value 变化时，Vue 会重新执行这个 render 函数
    // 注意：render 函数内部也会访问 visible.value，这确保了双重追踪
    const renderFn = () => {
      // 访问 visible.value 以确保响应式追踪（这是关键！）
      // 即使 render() 内部也会访问 visible.value，但在这里显式访问可以确保追踪
      const currentVisible = visible.value;

      // 生产环境日志：记录 render 函数执行
      if (import.meta.env.PROD) {
        console.log('[BtcDialog] setup 返回的 render 函数执行', {
          visible: currentVisible,
          visibleRef: visible,
          isRef: visible && typeof visible === 'object' && 'value' in visible,
          timestamp: new Date().toISOString(),
        });
      }

      // 调用 render 函数，它内部也会访问 visible.value
      const vnode = render();

      // 生产环境日志：记录 render 返回的 VNode
      if (import.meta.env.PROD) {
        console.log('[BtcDialog] render 返回 VNode', {
          hasVNode: !!vnode,
          vnodeType: vnode?.type,
          vnodeProps: vnode?.props,
          timestamp: new Date().toISOString(),
        });
      }

      return vnode;
    };

    // 生产环境日志：记录 setup 完成
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] setup 完成，返回 render 函数', {
        hasRenderFn: typeof renderFn === 'function',
        timestamp: new Date().toISOString(),
      });
    }

    return renderFn;
  }
});
</script>

<style lang="scss">
@use './styles/index.scss';
</style>
