/**
 * BtcForm 渲染逻辑
 */
import { h, resolveComponent } from 'vue';
import {
  ElInput, ElInputNumber, ElSelect, ElOption, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSwitch, ElDatePicker, ElTimePicker,
  ElCascader, ElTreeSelect, ElColorPicker, ElRate, ElSlider, ElUpload, ElDivider,
  ElDescriptions, ElDescriptionsItem
} from 'element-plus';
import BtcCascader from '../../../components/btc-cascader/index.vue';

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
  'el-divider': ElDivider,
  'el-descriptions': ElDescriptions,
  'el-descriptions-item': ElDescriptionsItem,
  'btc-cascader': BtcCascader
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

    if (componentName === 'el-cascader') {
      // 处理 slots
      const slots: any = {};
      if (item.component?.slots) {
        Object.keys(item.component.slots).forEach(slotName => {
          slots[slotName] = item.component.slots[slotName];
        });
      }

      // 提取 cascader 特有的 props
      const cascaderProps = props.cascaderProps || {
        checkStrictly: props.checkStrictly,
        emitPath: props.emitPath,
        multiple: props.multiple,
        showPrefix: props.showPrefix,
        showAllLevels: props.showAllLevels
      };

      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        options: item.component?.options || [],
        props: cascaderProps,
        ...props
      }, slots);
    }

    if (componentName === 'el-tree-select') {
      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        data: item.component?.options || [],
        ...props
      });
    }

    if (componentName === 'btc-cascader') {
      // 处理 btc-cascader 的特殊逻辑
      return h(Component, {
        modelValue: form[item.prop],
        'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
        options: item.component?.options || [],
        ...props
      });
    }

    if (componentName === 'el-descriptions') {
      // 处理 el-descriptions 的特殊逻辑
      // 标记这个组件不需要外层的 label
      item._hideLabel = true;

      return h(Component, {
        ...props,
        style: { width: '100%' }
      }, () => {
        return h(ElDescriptionsItem, {
          label: item.label,
          style: { width: '100%' },
          labelStyle: { width: '25%', textAlign: 'center' },
          contentStyle: { width: '75%', textAlign: 'center' },
          labelClassName: 'descriptions-label-center',
          contentClassName: 'descriptions-content-center',
          'class': 'descriptions-content-center'
        }, () => form[item.prop] || '');
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

