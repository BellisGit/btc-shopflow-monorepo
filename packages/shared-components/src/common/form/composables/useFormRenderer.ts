/**
 * BtcForm 渲染逻辑
 */
import { h, resolveComponent, unref, defineComponent } from 'vue';
import {
  ElInput, ElInputNumber, ElSelect, ElOption, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSwitch, ElDatePicker, ElTimePicker,
  ElCascader, ElTreeSelect, ElColorPicker, ElRate, ElSlider, ElUpload, ElDivider,
  ElDescriptions, ElDescriptionsItem
} from 'element-plus';
import BtcCascader from '@btc-components/navigation/btc-cascader/index.vue';
import BtcUpload from '@btc-components/form/btc-upload/index.vue';

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
  'btc-cascader': BtcCascader,
  'btc-upload': BtcUpload
};

export function useFormRenderer() {
  // 渲染组件 - 返回函数组件而不是 VNode，确保插槽在正确的渲染上下文中被调用
  function renderComponent(item: any, form: any) {
    const componentName = item.component?.name;
    if (!componentName) return null;

    const Component = componentMap[componentName] || resolveComponent(componentName);
    const props = {
      ...item.component?.props,
      disabled: item.disabled,
    };

    // 处理特殊组件 - 返回函数组件
    if (componentName === 'el-select') {
      // 使用 defineComponent 定义组件，确保插槽在正确的渲染上下文中被调用
      const itemRef = item;
      const formRef = form;
      const propName = item.prop;
      
      return defineComponent({
        setup() {
          return () => {
            // 在渲染时重新获取所有值，确保响应式追踪
            const currentItem = unref(itemRef);
            const currentForm = unref(formRef);
            const currentOptions = currentItem?.component?.options || [];
            
            const slots = currentOptions.length > 0 ? {
              default: () => {
                return currentOptions.map((opt: any) => {
                  const optValue = unref(opt?.value) ?? opt?.value;
                  const optLabel = unref(opt?.label) ?? opt?.label;
                  return h(ElOption, { key: optValue, label: optLabel, value: optValue });
                });
              }
            } : undefined;
            
            return h(Component, {
              modelValue: currentForm?.[propName],
              'onUpdate:modelValue': (val: any) => { 
                const formValue = unref(formRef);
                if (formValue) {
                  formValue[propName] = val;
                }
              },
              ...props
            }, slots);
          };
        }
      });
    }

    if (componentName === 'el-radio-group') {
      // 使用 defineComponent 定义组件
      const itemRef = item;
      const formRef = form;
      const propName = item.prop;
      
      return defineComponent({
        setup() {
          return () => {
            const currentItem = unref(itemRef);
            const currentForm = unref(formRef);
            const currentOptions = currentItem?.component?.options || [];
            
            const slots = currentOptions.length > 0 ? {
              default: () => {
                return currentOptions.map((opt: any) => {
                  const optValue = unref(opt?.value) ?? opt?.value;
                  const optLabel = unref(opt?.label) ?? opt?.label;
                  return h(ElRadio, { key: optValue, value: optValue }, () => optLabel);
                });
              }
            } : undefined;
            
            return h(Component, {
              modelValue: currentForm?.[propName],
              'onUpdate:modelValue': (val: any) => { 
                const formValue = unref(formRef);
                if (formValue) {
                  formValue[propName] = val;
                }
              },
              ...props
            }, slots);
          };
        }
      });
    }

    if (componentName === 'el-checkbox-group') {
      // 使用 defineComponent 定义组件
      const itemRef = item;
      const formRef = form;
      const propName = item.prop;
      
      return defineComponent({
        setup() {
          return () => {
            const currentItem = unref(itemRef);
            const currentForm = unref(formRef);
            const currentOptions = currentItem?.component?.options || [];
            
            const slots = currentOptions.length > 0 ? {
              default: () => {
                return currentOptions.map((opt: any) => {
                  const optValue = unref(opt?.value) ?? opt?.value;
                  const optLabel = unref(opt?.label) ?? opt?.label;
                  return h(ElCheckbox, { key: optValue, value: optValue }, () => optLabel);
                });
              }
            } : undefined;
            
            return h(Component, {
              modelValue: currentForm?.[propName],
              'onUpdate:modelValue': (val: any) => { 
                const formValue = unref(formRef);
                if (formValue) {
                  formValue[propName] = val;
                }
              },
              ...props
            }, slots);
          };
        }
      });
    }

    if (componentName === 'el-cascader') {
      // 返回函数组件
      return () => {
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
      };
    }

    if (componentName === 'el-tree-select') {
      // 返回函数组件
      return () => {
        return h(Component, {
          modelValue: form[item.prop],
          'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
          data: item.component?.options || [],
          ...props
        });
      };
    }

    if (componentName === 'btc-cascader') {
      // 返回函数组件
      return () => {
        return h(Component, {
          modelValue: form[item.prop],
          'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
          options: item.component?.options || [],
          ...props
        });
      };
    }

    if (componentName === 'btc-upload') {
      // 返回函数组件
      return () => {
        // 处理 btc-upload 的特殊逻辑
        // 尝试从组件实例获取 service（如果通过 provide 提供）
        let uploadService = props.uploadService;
        if (!uploadService && typeof window !== 'undefined') {
          // 尝试从全局获取 service
          uploadService = (window as any).__BTC_SERVICE__;
        }

        return h(Component, {
          modelValue: form[item.prop],
          'onUpdate:modelValue': (val: any) => { form[item.prop] = val; },
          prop: item.prop,
          uploadService,
          ...props
        });
      };
    }

    if (componentName === 'el-descriptions') {
      // 处理 el-descriptions 的特殊逻辑
      // 标记这个组件不需要外层的 label
      item._hideLabel = true;

      // 返回函数组件，确保插槽在渲染函数内部被调用
      return () => {
        const slots = {
          default: () => {
            return h(ElDescriptionsItem, {
              label: item.label,
              style: { width: '100%' },
              labelStyle: { width: '25%', textAlign: 'center' },
              contentStyle: { width: '75%', textAlign: 'center' },
              labelClassName: 'descriptions-label-center',
              contentClassName: 'descriptions-content-center',
              'class': 'descriptions-content-center'
            }, () => form[item.prop] || '');
          }
        };

        return h(Component, {
          ...props,
          style: { width: '100%' }
        }, slots);
      };
    }

    // 日期选择器和时间选择器特殊处理 - 完全过滤掉 id 和 name 属性（Element Plus 期望 id 是数组类型）
    if (componentName === 'el-date-picker' || componentName === 'el-time-picker') {
      const formRef = form;
      const propName = item.prop;
      return () => {
        const currentForm = unref(formRef);
        // 完全过滤掉 id 和 name 属性（避免 Element Plus 内部组件类型错误）
        const { id, name, ...filteredProps } = props;
        return h(Component, {
          modelValue: currentForm?.[propName],
          'onUpdate:modelValue': (val: any) => { 
            const formValue = unref(formRef);
            if (formValue) {
              formValue[propName] = val;
            }
          },
          ...filteredProps
        });
      };
    }

    // 默认组件 - 返回函数组件
    const formRef = form;
    const propName = item.prop;
    return () => {
      const currentForm = unref(formRef);
      return h(Component, {
        modelValue: currentForm?.[propName],
        'onUpdate:modelValue': (val: any) => { 
          const formValue = unref(formRef);
          if (formValue) {
            formValue[propName] = val;
          }
        },
        ...props
      });
    };
  }

  return {
    renderComponent
  };
}

