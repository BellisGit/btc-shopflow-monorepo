import { ref, watch, computed, provide } from 'vue';
import type { DialogProps } from '../types';

/**
 * 对话框状态管理
 */
export function useDialog(props: DialogProps, emit: any) {
  // el-dialog ref
  const Dialog = ref();

  // 是否全屏
  const fullscreen = ref(false);

  // 是否可见
  const visible = ref(false);

  // 缓存数
  const cacheKey = ref(0);

  // 检测移动端（简单实现）
  const isMobile = computed(() => {
    return window.innerWidth < 768;
  });

  // 是否全屏（移动端强制全屏）
  const isFullscreen = computed(() => {
    return isMobile.value ? true : fullscreen.value;
  });

  // 监听绑定值
  // 关键：使用 deep: true 确保能够检测到 ref 对象内部的变化
  watch(
    () => props.modelValue,
    (val, oldVal) => {
      // 关键：处理 ref 对象的情况，确保获取的是值而不是 ref 对象
      // 如果 val 是一个 ref 对象（有 value 属性），则解包它
      const actualValue = val && typeof val === 'object' && 'value' in val ? val.value : val;
      const actualOldValue = oldVal && typeof oldVal === 'object' && 'value' in oldVal ? oldVal.value : oldVal;

      // 生产环境日志：记录 modelValue 变化
      if (import.meta.env.PROD) {
        console.log('[BtcDialog] modelValue 变化', {
          oldValue: actualOldValue,
          newValue: actualValue,
          rawValue: val,
          isRef: val && typeof val === 'object' && 'value' in val,
          visibleBefore: visible.value,
          timestamp: new Date().toISOString(),
        });
      }

      // 关键：始终更新 visible，确保 ElDialog 能够响应
      // 即使值相同，也更新 visible，因为 ElDialog 可能需要重新渲染
      const shouldUpdate = visible.value !== actualValue;
      visible.value = actualValue as boolean;

      // 如果值相同但为 true，强制触发一次更新，确保弹窗显示
      // 这解决了当 modelValue 从 true 变为 true 时，ElDialog 不更新的问题
      if (!shouldUpdate && actualValue === true) {
        // 通过修改 cacheKey 强制重新渲染
        if (!props.keepAlive) {
          cacheKey.value += 1;
        }
      }

      // 生产环境日志：记录 visible 设置后的状态
      if (import.meta.env.PROD) {
        console.log('[BtcDialog] visible 已更新', {
          visibleAfter: visible.value,
          modelValue: props.modelValue,
          actualValue,
          timestamp: new Date().toISOString(),
        });
      }

      // 生产环境调试：当 visible 变为 true 时，检查 Dialog ref 和 DOM
      if (import.meta.env.PROD && actualValue === true) {
        // 使用 nextTick 确保 DOM 已更新，并增加延迟确保 ElDialog 有足够时间渲染
        import('vue').then(({ nextTick }) => {
          nextTick(() => {
            // 增加延迟，确保 ElDialog 有足够时间渲染 overlay
            setTimeout(() => {
              const dialogEl = Dialog.value?.$el || Dialog.value;
              // 尝试多种选择器查找 overlay
              const overlayEl = document.querySelector('.el-overlay') ||
                               document.querySelector('[class*="el-overlay"]') ||
                               document.querySelector('.el-dialog__wrapper')?.parentElement;
              const dialogWrapper = document.querySelector('.el-dialog__wrapper');
              const allOverlays = document.querySelectorAll('.el-overlay');
              const allDialogWrappers = document.querySelectorAll('.el-dialog__wrapper');

              // 检查 Dialog 组件实例的内部状态
              const dialogInstance = Dialog.value;
              const dialogProps = dialogInstance?.$?.props || dialogInstance?.props || {};
              const dialogModelValue = dialogProps.modelValue;
              const dialogVisible = dialogInstance?.visible;
              const dialogExposed = dialogInstance?.exposed;

              // 检查 Dialog 组件是否有 overlay 相关的内部状态
              const dialogInternalState = {
                hasInstance: !!dialogInstance,
                instanceType: dialogInstance ? typeof dialogInstance : 'null',
                hasProps: !!dialogProps,
                modelValueInProps: dialogModelValue,
                visibleInInstance: dialogVisible,
                hasExposed: !!dialogExposed,
              };

              console.log('[BtcDialog] visible=true 时的 DOM 检查', {
                hasDialogRef: !!Dialog.value,
                dialogRefType: Dialog.value ? typeof Dialog.value : 'null',
                dialogRef: Dialog.value,
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
                allOverlaysCount: allOverlays.length,
                allDialogWrappersCount: allDialogWrappers.length,
                dialogInternalState,
                bodyChildren: Array.from(document.body.children).map(el => ({
                  tagName: el.tagName,
                  className: el.className,
                  id: el.id,
                  display: window.getComputedStyle(el).display,
                  visibility: window.getComputedStyle(el).visibility,
                })),
                timestamp: new Date().toISOString(),
              });
            }, 500); // 增加延迟到 500ms，确保 ElDialog 有足够时间渲染
          });
        });
      }

      // 关键：当 modelValue 变为 true 时，即使值相同也更新 cacheKey，强制重新渲染
      // 这解决了当 modelValue 从 true 变为 true 时，ElDialog 不更新的问题
      if (actualValue === true) {
        if (!props.keepAlive) {
          cacheKey.value += 1;
        }
        // 强制触发一次 visible 更新，确保 ElDialog 能够响应
        // 使用 nextTick 确保在下一个 tick 更新，避免与当前更新冲突
        import('vue').then(({ nextTick }) => {
          nextTick(() => {
            // 如果 visible 已经是 true，强制触发一次更新
            if (visible.value === true && Dialog.value) {
              // 通过修改 cacheKey 强制重新渲染
              if (!props.keepAlive) {
                cacheKey.value += 1;
              }
            }
          });
        });
      }
    },
    {
      immediate: true,
      // 关键：添加 deep: true 确保能够检测到 ref 对象内部的变化
      deep: true,
    }
  );

  // 监听 fullscreen 变化
  watch(
    () => props.fullscreen,
    (val) => {
      fullscreen.value = val || false;
    },
    {
      immediate: true,
    }
  );

  // fullscreen-change 回调
  watch(fullscreen, (val: boolean) => {
    emit('fullscreen-change', val);
  });

  // 提供
  provide('btc-dialog', {
    visible,
    fullscreen: isFullscreen,
  });

  // 打开
  function open() {
    visible.value = true;
  }

  // 关闭
  function close() {
    function done() {
      onClose();
    }

    if (props.beforeClose) {
      props.beforeClose();
    } else {
      done();
    }
  }

  // 关闭后
  function onClose() {
    emit('update:modelValue', false);
  }

  // 关闭后回调
  function onClosed() {
    emit('closed');
  }

  // 切换全屏
  function changeFullscreen(val?: boolean) {
    fullscreen.value = typeof val === 'boolean' ? val : !fullscreen.value;
  }

  // 双击全屏
  function dblClickFullscreen() {
    if (Array.isArray(props.controls) && props.controls.includes('fullscreen')) {
      changeFullscreen();
    }
  }

  return {
    // refs
    Dialog,
    visible,
    fullscreen,
    cacheKey,

    // computed
    isFullscreen,
    isMobile,

    // methods
    open,
    close,
    onClose,
    onClosed,
    changeFullscreen,
    dblClickFullscreen,
  };
}
