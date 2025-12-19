/**
 * BtcForm 渲染逻辑
 * 完全参考 cool-admin 的实现方式
 */
import { h, resolveComponent, unref, defineComponent, computed } from 'vue';
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

// 组件定义缓存
const componentCache = new Map<string, any>();

export function useFormRenderer() {
  // 渲染组件 - 完全参考 cool-admin 的方式
  function renderComponent(item: any, form: any) {
    const componentName = item.component?.name;
    if (!componentName) return null;

    const Component = componentMap[componentName] || resolveComponent(componentName);

    // 使用 item.prop + componentName 作为缓存 key，确保组件定义稳定
    const cacheKey = `${item.prop || 'unknown'}_${componentName}`;

    // 如果缓存中没有，创建新的组件定义
    if (!componentCache.has(cacheKey)) {
      const componentDef = defineComponent({
        name: `FormItem_${cacheKey}`,
        setup() {
          // 在 setup 中捕获 form 和 item 的引用
          const formRef = form;
          const itemRef = item;
          const prop = itemRef.prop;

          // 使用 computed 来追踪 formRef.value，确保响应式追踪正确
          // 关键：computed 的 getter 会在渲染函数中被调用，Vue 会正确追踪依赖
          const scope = computed(() => {
            const value = unref(formRef);
            if (!value) {
              return {};
            }
            return value;
          });

          return () => {
            // 获取表单数据（form 是 ref，需要 unref）- 完全参考 cool-admin
            // 使用 computed 确保响应式追踪正确
            const currentScope = scope.value;

            // 确保 scope 存在
            if (!currentScope) {
              return null;
            }

            // 基础 props
            const props: any = {
              ...itemRef.component?.props,
              disabled: itemRef.disabled,
              // 支持 readonly 属性（从 component.props 中获取，如果没有则从 itemRef 顶层获取）
              readonly: itemRef.component?.props?.readonly ?? itemRef.readonly,
            };

            // 为组件设置 id，确保 label 的 for 属性能正确关联
            // Element Plus 的 el-form-item 会自动为 label 生成 for 属性，需要组件有对应的 id
            if (prop) {
              // 生成唯一的 id，使用 prop 作为基础，确保每个字段都有唯一的 id
              props.id = `form-item-${prop}`;
            }

            // 添加双向绑定（完全参考 cool-admin 的实现）
            // 关键：currentScope 是 formRef.value 的引用，直接使用它进行读写
            // 这样既能正确显示值，又能确保表单验证时能读取到正确的值
            if (currentScope && prop) {
              // 从 currentScope[prop] 读取值（currentScope 是 formRef.value 的引用）
              props.modelValue = currentScope[prop];
              props['onUpdate:modelValue'] = function (val: any) {
                // 直接修改 currentScope[prop]，就像 cool-admin 一样
                // currentScope 是 formRef.value 的引用，修改它会触发响应式更新
                currentScope[prop] = val;
              };
            }

            // 处理特殊组件
            if (componentName === 'el-select') {
              // 使用 Element Plus 2.10.5+ 的 options prop
              const currentOptions = Array.isArray(itemRef?.component?.options)
                ? itemRef.component.options
                : [];

              // 如果没有设置 placeholder，默认使用空字符串（而不是 "Select"）
              if (props.placeholder === undefined) {
                props.placeholder = '';
              }

              return h(Component, {
                ...props,
                options: currentOptions,
                props: itemRef?.component?.optionProps || {
                  value: 'value',
                  label: 'label',
                  disabled: 'disabled'
                }
              });
            }

            if (componentName === 'el-radio-group') {
              const currentOptions = itemRef?.component?.options || [];
              const slots = currentOptions.length > 0 ? {
                default: () => {
                  return currentOptions.map((opt: any) => {
                    const optValue = opt?.value ?? opt;
                    const optLabel = opt?.label ?? optValue;
                    return h(ElRadio, { key: optValue, value: optValue }, () => optLabel);
                  });
                }
              } : undefined;

              return h(Component, props, slots);
            }

            if (componentName === 'el-checkbox-group') {
              const currentOptions = itemRef?.component?.options || [];
              const slots = currentOptions.length > 0 ? {
                default: () => {
                  return currentOptions.map((opt: any) => {
                    const optValue = opt?.value ?? opt;
                    const optLabel = opt?.label ?? optValue;
                    return h(ElCheckbox, { key: optValue, value: optValue }, () => optLabel);
                  });
                }
              } : undefined;

              return h(Component, props, slots);
            }

            if (componentName === 'el-cascader') {
              const slots: any = {};
              if (itemRef.component?.slots) {
                Object.keys(itemRef.component.slots).forEach(slotName => {
                  slots[slotName] = itemRef.component.slots[slotName];
                });
              }

              const cascaderProps = props.cascaderProps || {
                checkStrictly: props.checkStrictly,
                emitPath: props.emitPath,
                multiple: props.multiple,
                showPrefix: props.showPrefix,
                showAllLevels: props.showAllLevels
              };

              return h(Component, {
                ...props,
                options: itemRef.component?.options || [],
                props: cascaderProps
              }, slots);
            }

            if (componentName === 'el-tree-select') {
              return h(Component, {
                ...props,
                data: itemRef.component?.options || []
              });
            }

            if (componentName === 'btc-cascader') {
              return h(Component, {
                ...props,
                options: itemRef.component?.options || []
              });
            }

            if (componentName === 'btc-upload') {
              let uploadService = props.uploadService;
              if (!uploadService && typeof window !== 'undefined') {
                uploadService = (window as any).__BTC_SERVICE__;
              }

              return h(Component, {
                ...props,
                prop: itemRef.prop,
                uploadService
              });
            }

            if (componentName === 'el-descriptions') {
              itemRef._hideLabel = true;
              const slots = {
                default: () => {
                  return h(ElDescriptionsItem, {
                    label: itemRef.label,
                    style: { width: '100%' },
                    labelStyle: { width: '25%', textAlign: 'center' },
                    contentStyle: { width: '75%', textAlign: 'center' },
                    labelClassName: 'descriptions-label-center',
                    contentClassName: 'descriptions-content-center',
                    'class': 'descriptions-content-center'
                  }, () => {
                    const currentScope = scope.value;
                    return currentScope?.[prop] || '';
                  });
                }
              };

              return h(Component, {
                ...props,
                style: { width: '100%' }
              }, slots);
            }

            // 日期选择器和时间选择器特殊处理 - 过滤掉 id 和 name 属性
            if (componentName === 'el-date-picker' || componentName === 'el-time-picker') {
              const { id, name, ...filteredProps } = props;
              return h(Component, filteredProps);
            }

            // 默认组件
            return h(Component, props);
          };
        }
      });

      componentCache.set(cacheKey, componentDef);
    }

    return componentCache.get(cacheKey);
  }

  return {
    renderComponent
  };
}
