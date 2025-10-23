import { ref } from 'vue';
import { formHook } from '@btc/shared-utils';
import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';
import { BtcMessage } from '@btc/shared-components';

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
          try {
            // 调用 service.update 或 service.add
            const service = crud.service;
            if (service) {
              let result;
              if (mode.value === 'update') {
                result = await service.update(data);
                BtcMessage.success('更新成功');
              } else {
                result = await service.add(data);
                BtcMessage.success('新增成功');
              }

              // 提交成功后自动刷新
              // 等待数据刷新完成
              await crud.loadData();

              // 提交成功后关闭弹窗
              close();

              return result;
            }
          } catch (error: any) {
            BtcMessage.error(error.message || '操作失败');
            throw error;
          }
        };

        await props.onSubmit(submitData, { close, done, next });
      } else {
        // 默认行为
        const service = crud.service;
        if (service) {
          if (mode.value === 'update') {
            await service.update(submitData);
            BtcMessage.success('更新成功');
          } else {
            await service.add(submitData);
            BtcMessage.success('新增成功');
          }
        }

        // 自动刷新，等待完成后再关闭
        await crud.loadData();
        close();
      }
    } catch (_error) {
      console.error('Form validation or submission failed:', _error);
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
