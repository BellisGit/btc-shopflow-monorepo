/**
 * BtcForm 渲染逻辑
 */
import { h, resolveComponent } from 'vue';
import {
  ElInput, ElInputNumber, ElSelect, ElOption, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSwitch, ElDatePicker, ElTimePicker,
  ElCascader, ElTreeSelect, ElColorPicker, ElRate, ElSlider, ElUpload, ElDivider
} from 'element-plus';

// 组件映射表
export const componentMap: Record<string, any> = {
  'el-input': ElInput,
  'el-input-number': ElInputNumber,
  'el-select': ElSelect,
  'el-option': ElOption,
  'el-radio': ElRadio,
  'el-radio-group': ElRadioGroup,
  'el-checkbox': ElCheckbox,
  'el-checkbox-group': ElCheckboxGroup,
  'el-switch': ElSwitch,
  'el-date-picker': ElDatePicker,
  'el-time-picker': ElTimePicker,
  'el-cascader': ElCascader,
  'el-tree-select': ElTreeSelect,
  'el-color-picker': ElColorPicker,
  'el-rate': ElRate,
  'el-slider': ElSlider,
  'el-upload': ElUpload,
  'el-divider': ElDivider
};

export function useFormRenderer() {
  // 渲染组件
  function renderComponent(item: any, form: any) {
    const componentName = item.component?.name;
    if (!componentName) return null;

    const Component = componentMap[componentName] || resolveComponent(componentName);
    const props = {
      ...item.component?.props,
      disabled: item.disabled,
    };

    // 处理特殊组件
    if (componentName === 'el-select') {
      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        ...props
      }, () => {
        return item.component?.options?.map((opt: any) =>
          h(ElOption, { label: opt.label, value: opt.value })
        );
      });
    }

    if (componentName === 'el-radio-group') {
      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        ...props
      }, () => {
        return item.component?.options?.map((opt: any) =>
          h(ElRadio, { value: opt.value }, () => opt.label)
        );
      });
    }

    if (componentName === 'el-checkbox-group') {
      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        ...props
      }, () => {
        return item.component?.options?.map((opt: any) =>
          h(ElCheckbox, { value: opt.value }, () => opt.label)
        );
      });
    }

    // 默认组件
    return h(Component, {
      modelValue: form[item.prop],
      'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
      ...props
    });
  }

  return {
    renderComponent
  };
}

