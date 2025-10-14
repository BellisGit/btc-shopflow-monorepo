import { ref } from 'vue';
import { formHook } from '@btc/shared-utils';
import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';

/**
 * 表单提交逻辑
 */
export function useFormSubmit(
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
    triggerPluginOnSubmit,
    triggerPluginOnClose,
    clearPlugins,
  } = pluginContext;

  // 提交状态
  const submitting = ref(false);

  // 关闭动作
  let closeAction: 'close' | 'save' = 'close';

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return;

    try {
      await formRef.value.validate();
      submitting.value = true;
      closeAction = 'save';

      const close = () => {
        crud.upsertVisible.value = false;
      };

      const done = () => {
        submitting.value = false;
      };

      // 克隆数据
      let submitData = { ...formData.value };

      // 处理 hook（提交转换）
      computedItems.value.forEach((item: any) => {
        if (item.hook && item.prop) {
          formHook.submit({
            ...item,
            value: submitData[item.prop],
            form: submitData
          });
        }
      });

      // 触发插件 onSubmit
      submitData = await triggerPluginOnSubmit(submitData);

      // 调用 onSubmit 钩子
      if (props.onSubmit) {
        const next = async (data: any) => {
          // 调用 service.update 或 service.add
          const service = crud.service;
          if (service) {
            let result;
            if (mode.value === 'update') {
              result = await service.update(data);
            } else {
              result = await service.add(data);
            }

            // ✅ 提交成功后自动刷新（对标 cool-admin）
            crud.loadData();

            return result;
          }
        };

        await props.onSubmit(submitData, { close, done, next });
      } else {
        // 默认行为
        const service = crud.service;
        if (service) {
          if (mode.value === 'update') {
            await service.update(submitData);
          } else {
            await service.add(submitData);
          }
        }

        // ✅ 自动刷新
        crud.loadData();
        close();
      }
    } catch (error) {
      console.error('Form validation or submission failed:', error);
    } finally {
      submitting.value = false;
    }
  };

  /**
   * 取消/关闭
   */
  const handleCancel = () => {
    closeAction = 'close';

    // 调用 onClose 钩子
    if (props.onClose) {
      props.onClose(closeAction, () => {
        // 触发插件 onClose
        triggerPluginOnClose(() => {
          crud.closeDialog();
        });
      });
    } else {
      // 触发插件 onClose
      triggerPluginOnClose(() => {
        crud.closeDialog();
      });
    }
  };

  /**
   * 关闭后
   */
  const handleClosed = () => {
    formRef.value?.resetFields();
    formData.value = {};
    loadingData.value = false;
    closeAction = 'close';
    clearPlugins();
    props.onClosed?.();
  };

  return {
    submitting,
    handleSubmit,
    handleCancel,
    handleClosed,
  };
}

