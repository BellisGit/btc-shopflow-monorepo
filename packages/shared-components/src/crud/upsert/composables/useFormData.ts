import { ref, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { FormItem, UpsertProps, UpsertMode } from '../types';

/**
 * 表单数据管理
 */
export function useFormData(props: UpsertProps) {
  const { t } = useI18n();

  // 表单实例
  const formRef = ref<FormInstance>();
  const formData = ref<Record<string, any>>({});
  const loadingData = ref(false);

  // 模式
  const mode = ref<UpsertMode>('add');

  // 是否禁用
  const isDisabled = computed(() => mode.value === 'info');

  /**
   * 计算表单项（支持函数返回）
   */
  const computedItems = computed(() => {
    if (!props.items) return [];

    const items = props.items.map((item: any) => {
      // 支持函数返回
      let resolved = typeof item === 'function' ? item() : item;

      // 再次检查（双层函数）
      if (typeof resolved === 'function') {
        resolved = resolved();
      }

      // 处理 hidden 属性
      if (resolved.hidden !== undefined) {
        if (typeof resolved.hidden === 'function') {
          resolved._hidden = resolved.hidden({ scope: formData.value, mode: mode.value });
        } else {
          resolved._hidden = resolved.hidden;
        }
      }

      return resolved;
    });

    return items;
  });

  /**
   * 获取组件 props
   */
  const getComponentProps = (item: FormItem) => {
    const baseProps = item.component?.props || {};

    // 如果已经有 placeholder，直接返回
    if (baseProps.placeholder !== undefined) {
      return baseProps;
    }

    // 为 el-input 和 el-input-number 自动添加 placeholder
    const componentName = item.component?.name;
    if (componentName === 'el-input' || componentName === 'el-input-number') {
      return {
        ...baseProps,
        placeholder: `请输入${item.label}`,
      };
    }

    return baseProps;
  };

  // 计算属性：提供默认值
  const width = computed(() => props.width || '800px');
  const dialogPadding = computed(() => props.padding || '10px 20px');
  const labelWidth = computed(() => props.labelWidth || '100px');
  const labelPosition = computed(() => props.labelPosition || 'top');
  const gutter = computed(() => props.gutter || 20);
  const cancelText = computed(() => props.cancelText || t('common.button.cancel'));
  const submitText = computed(() => props.submitText || t('common.button.confirm'));

  // 标题
  const title = computed(() => {
    if (mode.value === 'info') {
      return props.infoTitle || t('crud.dialog.info_title') || '详情';
    }
    if (mode.value === 'update') {
      return props.editTitle || t('crud.dialog.edit_title');
    }
    return props.addTitle || t('crud.dialog.add_title');
  });

  // 表单规则
  const formRules = computed<FormRules>(() => {
    const rules: FormRules = {};
    computedItems.value.forEach((item) => {
      if (item.rules) {
        rules[item.prop] = item.rules;
      } else if (item.required) {
        rules[item.prop] = [{ required: true, message: `${t('common.validation.required_prefix')}${item.label}` }];
      }
    });
    return rules;
  });

  return {
    // refs
    formRef,
    formData,
    loadingData,
    mode,

    // computed
    isDisabled,
    computedItems,
    formRules,
    width,
    dialogPadding,
    labelWidth,
    labelPosition,
    gutter,
    cancelText,
    submitText,
    title,

    // methods
    getComponentProps,
  };
}

