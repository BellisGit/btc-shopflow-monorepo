import { h, getCurrentInstance, resolveComponent } from 'vue';
import { Close, FullScreen, Minus } from '@element-plus/icons-vue';
import { ElDialog, ElIcon, ElScrollbar } from 'element-plus';
import type { DialogProps } from '../types';

/**
 * 对话框渲染逻辑
 */
export function useDialogRender(props: DialogProps, dialogContext: any, slots: any) {
  const {
    Dialog,
    visible,
    isFullscreen,
    isMobile,
    cacheKey,
    onClose,
    onClosed,
    close,
    changeFullscreen,
    dblClickFullscreen,
  } = dialogContext;

  // 生产环境日志：记录 useDialogRender 初始化
  if (import.meta.env.PROD) {
    console.log('[BtcDialog] useDialogRender 初始化', {
      hasVisible: !!visible,
      visibleType: typeof visible,
      timestamp: new Date().toISOString(),
    });
  }

  // 渲染头部
  function renderHeader() {
    if (props.hideHeader) {
      return null;
    }

    return h('div', {
      class: 'btc-dialog__header',
      onDblclick: dblClickFullscreen
    }, [
      h('span', { class: 'btc-dialog__title' }, props.title),
      h('div', { class: 'btc-dialog__controls' },
        (props.controls || ['fullscreen', 'close']).map((e: any) => {
          switch (e) {
            // 全屏按钮（移动端不显示）
            case 'fullscreen':
              if (isMobile.value) {
                return null; // 移动端隐藏全屏按钮
              }

              if (isFullscreen.value) {
                return h('button', {
                  type: 'button',
                  class: 'control-btn minimize',
                  onClick: () => changeFullscreen(false)
                }, [
                  h(ElIcon, null, () => h(Minus))
                ]);
              } else {
                return h('button', {
                  type: 'button',
                  class: 'control-btn maximize',
                  onClick: () => changeFullscreen(true)
                }, [
                  h(ElIcon, null, () => h(FullScreen))
                ]);
              }

            // 关闭按钮
            case 'close':
              return h('button', {
                type: 'button',
                class: 'control-btn close',
                onClick: close
              }, [
                h(ElIcon, null, () => h(Close))
              ]);

            // 自定义按钮
            default:
              return h(e);
          }
        })
      )
    ]);
  }

  // 渲染主函数
  function render() {
    const height = isFullscreen.value ? '100%' : props.height;
    // 关键：在 render 函数中直接访问 visible.value，确保 Vue 能够追踪依赖
    // 不要在函数外部缓存值，保持响应式

    // 生产环境日志：记录 render 函数调用
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] render() 被调用', {
        visible: visible.value,
        isFullscreen: isFullscreen.value,
        height,
        width: props.width,
        timestamp: new Date().toISOString(),
      });
    }

    // 关键：确保 modelValue 是响应式的
    // 在 render 函数中直接读取 visible.value，确保 Vue 能够追踪依赖
    // 每次 render 函数执行时，都会重新读取 visible.value，确保 ElDialog 接收到最新的值
    const dialogProps = {
      ref: Dialog,
      class: ['btc-dialog', {
        'is-transparent': props.transparent,
        'has-height': !!height
      }],
      width: props.width,
      style: height ? { height } : undefined,
      alignCenter: props.alignCenter !== false, // 默认 true，使对话框水平垂直居中
      beforeClose: props.beforeClose as any,
      showClose: false,
      appendToBody: true,
      fullscreen: isFullscreen.value,
      // 关键：直接使用 visible.value，确保每次渲染时都读取最新值
      // Vue 的响应式系统会追踪到 visible.value 的读取，当 visible.value 变化时会重新执行 render
      modelValue: visible.value,
      // 关键：确保 onUpdate:modelValue 正确传递
      'onUpdate:modelValue': (val: boolean) => {
        // 生产环境日志：记录 modelValue 更新
        if (import.meta.env.PROD) {
          console.log('[BtcDialog] ElDialog onUpdate:modelValue 被调用', {
            newValue: val,
            oldVisible: visible.value,
            timestamp: new Date().toISOString(),
          });
        }
        visible.value = val;

        // 生产环境调试：当 modelValue 变为 true 时，检查 DOM
        if (import.meta.env.PROD && val === true) {
          import('vue').then(({ nextTick }) => {
            nextTick(() => {
              setTimeout(() => {
                const dialogEl = Dialog.value?.$el || Dialog.value;
                const overlayEl = document.querySelector('.el-overlay');
                const dialogWrapper = document.querySelector('.el-dialog__wrapper');
                const btcDialog = document.querySelector('.btc-dialog');

                // 检查 ElDialog 组件实例的内部状态
                const dialogInstance = Dialog.value;
                const dialogProps = dialogInstance?.$?.props || dialogInstance?.props || {};
                const dialogModelValue = dialogProps.modelValue;
                const dialogVisible = dialogInstance?.visible;
                const dialogExposed = dialogInstance?.exposed;

                console.log('[BtcDialog] ElDialog modelValue=true 时的 DOM 检查', {
                  hasDialogRef: !!Dialog.value,
                  dialogRefType: Dialog.value ? typeof Dialog.value : 'null',
                  dialogInstance: dialogInstance,
                  dialogProps: dialogProps,
                  dialogModelValue: dialogModelValue,
                  dialogVisible: dialogVisible,
                  dialogExposed: dialogExposed,
                  hasDialogEl: !!dialogEl,
                  dialogEl: dialogEl,
                  hasOverlayEl: !!overlayEl,
                  overlayEl: overlayEl,
                  overlayDisplay: overlayEl ? window.getComputedStyle(overlayEl as Element).display : 'N/A',
                  overlayVisibility: overlayEl ? window.getComputedStyle(overlayEl as Element).visibility : 'N/A',
                  overlayZIndex: overlayEl ? window.getComputedStyle(overlayEl as Element).zIndex : 'N/A',
                  overlayOpacity: overlayEl ? window.getComputedStyle(overlayEl as Element).opacity : 'N/A',
                  hasDialogWrapper: !!dialogWrapper,
                  dialogWrapperDisplay: dialogWrapper ? window.getComputedStyle(dialogWrapper as Element).display : 'N/A',
                  hasBtcDialog: !!btcDialog,
                  btcDialogDisplay: btcDialog ? window.getComputedStyle(btcDialog as Element).display : 'N/A',
                  timestamp: new Date().toISOString(),
                });
              }, 200); // 增加延迟到 200ms
            });
          });
        }
      },
      onClose: onClose,
      onClosed: onClosed
    };

    // 生产环境日志：记录传递给 ElDialog 的 props
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] 传递给 ElDialog 的 props', {
        modelValue: dialogProps.modelValue,
        width: dialogProps.width,
        fullscreen: dialogProps.fullscreen,
        appendToBody: dialogProps.appendToBody,
        timestamp: new Date().toISOString(),
      });
    }

    // 关键：尝试多种方式解析 ElDialog 组件，确保在生产环境下也能正确工作
    // 1. 首先尝试使用 resolveComponent（适用于全局注册的组件）
    // 2. 如果失败，尝试从应用实例获取
    // 3. 最后回退到直接导入的 ElDialog
    const instance = getCurrentInstance();
    let DialogComponent: any = ElDialog;

    // 尝试使用 resolveComponent 解析 ElDialog（适用于全局注册的组件）
    try {
      const resolved = resolveComponent('ElDialog');
      if (resolved && resolved !== 'ElDialog') {
        // resolveComponent 返回的不是字符串，说明组件被正确解析
        DialogComponent = resolved;
      }
    } catch (e) {
      // resolveComponent 失败，继续使用其他方法
    }

    // 尝试从应用实例中解析 ElDialog（如果 Element Plus 已全局注册）
    if (instance?.appContext?.app) {
      const app = instance.appContext.app;
      // 检查 Element Plus 是否已注册
      if (app._context?.components?.ElDialog) {
        DialogComponent = app._context.components.ElDialog;
      }
    }

    // 生产环境调试：检查 ElDialog 组件是否正确
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] ElDialog 组件检查', {
        hasElDialog: !!ElDialog,
        elDialogType: typeof ElDialog,
        elDialogName: ElDialog?.name || ElDialog?.__name || 'unknown',
        dialogComponentType: typeof DialogComponent,
        dialogComponentName: DialogComponent?.name || DialogComponent?.__name || 'unknown',
        isFunction: typeof DialogComponent === 'function',
        isObject: typeof DialogComponent === 'object',
        isString: typeof DialogComponent === 'string',
        hasInstance: !!instance,
        hasAppContext: !!instance?.appContext,
        hasApp: !!instance?.appContext?.app,
        resolvedComponent: DialogComponent,
        timestamp: new Date().toISOString(),
      });
    }

    const vnode = h(
      DialogComponent,
      dialogProps,
      {
        header: renderHeader,
        default: () => {
          const contentHeight = isFullscreen.value ? '100%' : (props.scrollbar !== false ? props.height : '100%');
          const style = {
            padding: props.padding || '20px',
            height: props.scrollbar !== false ? 'auto' : contentHeight
          };

          function content() {
            return h('div', {
              class: ['btc-dialog__content', 'btc-dialog__default'],
              style,
              key: cacheKey.value
            }, slots.default?.());
          }

          if (props.scrollbar !== false) {
            return h(ElScrollbar, { height: contentHeight }, () => content());
          } else {
            return content();
          }
        },
        footer: () => {
          const d = slots.footer?.();

          if (d && d.length > 0) {
            return h('div', { class: 'btc-dialog__footer' }, d);
          }

          return null;
        }
      }
    );

    // 生产环境日志：记录创建的 VNode
    if (import.meta.env.PROD) {
      console.log('[BtcDialog] useDialogRender 创建 VNode', {
        hasVNode: !!vnode,
        vnodeType: vnode?.type,
        vnodeProps: vnode?.props,
        modelValueInProps: vnode?.props?.modelValue,
        hasOnUpdateModelValue: typeof vnode?.props?.['onUpdate:modelValue'] === 'function',
        dialogComponentType: DialogComponent,
        isElDialog: DialogComponent === ElDialog,
        timestamp: new Date().toISOString(),
      });
    }

    return vnode;
  }

  return {
    render,
  };
}

