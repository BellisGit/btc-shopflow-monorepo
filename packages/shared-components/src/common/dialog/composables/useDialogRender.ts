import { h } from 'vue';
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
    return h(
      ElDialog,
      {
        ref: Dialog,
        class: ['btc-dialog', { 'is-transparent': props.transparent }],
        width: props.width,
        beforeClose: props.beforeClose as any,
        showClose: false,
        appendToBody: true,
        fullscreen: isFullscreen.value,
        modelValue: visible.value,
        'onUpdate:modelValue': (val: boolean) => {
          visible.value = val;
        },
        onClose: onClose,
        onClosed: onClosed
      },
      {
        header: renderHeader,
        default: () => {
          const height = isFullscreen.value ? '100%' : props.height;
          const style = {
            padding: props.padding || '20px',
            height
          };

          function content() {
            return h('div', {
              class: ['btc-dialog__content', 'btc-dialog__default'],
              style,
              key: cacheKey.value
            }, slots.default?.());
          }

          if (props.scrollbar !== false) {
            style.height = 'auto';
            return h(ElScrollbar, { height }, () => content());
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
  }

  return {
    render,
  };
}

