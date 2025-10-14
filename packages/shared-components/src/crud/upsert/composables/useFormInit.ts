import { watch, nextTick } from 'vue';
import { formHook } from '@btc/shared-utils';
import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';

/**
 * 表单初始化逻辑
 */
export function useFormInit(
  props: UpsertProps,
  crud: UseCrudReturn<any>,
  formDataContext: any,
  pluginContext: any
) {
  const {
    formRef,
    formData,
    mode,
    loadingData,
    computedItems,
  } = formDataContext;

  const {
    registerPlugins,
    triggerPluginOnOpen,
  } = pluginContext;

  /**
   * 绑定表单数据（form-hook）
   */
  const bindFormData = () => {
    computedItems.value.forEach((item: any) => {
      if (item.hook && item.prop) {
        formHook.bind({
          ...item,
          value: formData.value[item.prop],
          form: formData.value
        });
      }
    });
  };

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    // 确定模式
    if (crud.currentRow.value) {
      // 有数据，判断是编辑还是详情
      mode.value = crud.upsertMode?.value || 'update';
    } else {
      mode.value = 'add';
    }

    const data: Record<string, any> = {};

    // 注册插件
    registerPlugins();

    // 调用 onOpen 钩子（此时还没有数据）
    props.onOpen?.();

    // 触发插件 onOpen
    await triggerPluginOnOpen();

    if (mode.value === 'add') {
      // 新增模式：使用默认值
      computedItems.value.forEach((item: any) => {
        if (item.value !== undefined) {
          data[item.prop] = item.value;
        }
      });

      formData.value = data;

      // 调用 onOpened
      nextTick(() => {
        props.onOpened?.(formData.value);
      });
    } else {
      // 编辑/详情模式：获取详情数据

      // sync=false（默认）：先加载数据再打开弹窗
      // sync=true：先打开弹窗再加载数据
      const shouldSync = props.sync === true;

      const loadAndBind = async () => {
        loadingData.value = true;

        if (props.onInfo) {
          // 使用自定义 onInfo
          const next = async (params?: any) => {
            // 调用 service.info
            const service = crud.service;
            if (service && service.info) {
              return await service.info(params || crud.currentRow.value);
            }
            return crud.currentRow.value;
          };

          const done = (responseData: any) => {
            Object.assign(data, responseData);
            formData.value = data;

            // 绑定 hook
            bindFormData();

            loadingData.value = false;

            // 调用 onOpened
            nextTick(() => {
              props.onOpened?.(formData.value);
            });
          };

          await props.onInfo(crud.currentRow.value, { next, done });
        } else {
          // 默认行为：直接使用 currentRow
          Object.assign(data, crud.currentRow.value);
          formData.value = data;

          // 绑定 hook
          bindFormData();

          loadingData.value = false;

          // 调用 onOpened
          nextTick(() => {
            props.onOpened?.(formData.value);
          });
        }
      };

      if (!shouldSync) {
        // 默认：先加载数据（弹窗还未显示）
        await loadAndBind();
      } else {
        // sync=true：先显示弹窗，再加载数据
        nextTick(async () => {
          await loadAndBind();
        });
      }
    }
  };

  /**
   * 监听弹窗显示
   */
  watch(() => crud.upsertVisible.value, (visible) => {
    if (visible) {
      initFormData();
      nextTick(() => {
        formRef.value?.clearValidate();
      });
    }
  });

  /**
   * 追加数据打开表单（新增模式 + 预填数据）
   */
  const append = async (data: any) => {
    // 设置为新增模式
    mode.value = 'add';

    // 注册插件
    registerPlugins();

    // 调用 onOpen 钩子
    props.onOpen?.();

    // 触发插件 onOpen
    await triggerPluginOnOpen();

    // 使用默认值
    const formDataTemp: Record<string, any> = {};
    computedItems.value.forEach((item: any) => {
      if (item.value !== undefined) {
        formDataTemp[item.prop] = item.value;
      }
    });

    // 合并传入的数据（覆盖默认值）
    Object.assign(formDataTemp, data);
    formData.value = formDataTemp;

    // 调用 onOpened
    nextTick(() => {
      props.onOpened?.(formData.value);
    });
  };

  return {
    initFormData,
    bindFormData,
    append,
  };
}

