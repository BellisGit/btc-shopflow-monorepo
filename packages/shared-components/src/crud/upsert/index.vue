<template>
  <BtcDialog
    :model-value="upsertVisibleValue"
    @update:model-value="handleModelValueUpdate"
    :title="title"
    :width="width"
    :padding="dialogPadding"
    v-bind="dialogProps"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :disabled="isDisabled"
      v-bind="formProps"
      v-loading="loadingData"
      element-loading-text="加载中..."
    >
      <el-row :gutter="gutter">
        <el-col
          v-for="(item, index) in computedItems"
          :key="`${item.prop}-${index}`"
          :span="item.span || 24"
          v-show="!item._hidden"
        >
          <el-form-item
            :label="item._hideLabel ? '' : item.label"
            :prop="item.prop"
            :required="item.required"
            :rules="item.rules"
          >
            <slot :name="`item-${item.prop}`" :item="item" :form="formData" :mode="mode">
              <!-- 使用 renderComponent 渲染组件 - 直接渲染 VNode -->
              <template v-if="item.component">
                <component
                  :is="renderComponent(item, formData)"
                  :key="`${item.prop}-${index}`"
                />
              </template>

              <!-- 默认输入框 -->
              <!-- 使用显式的 modelValue 和 onUpdate:modelValue，避免 ref + 动态属性的解包问题 -->
              <el-input
                v-else
                :model-value="formData[item.prop]"
                @update:model-value="(val: any) => { formData[item.prop] = val; }"
                :placeholder="`请输入${item.label}`"
              />
            </slot>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <slot name="footer" :form="formData" :submit="handleSubmit" :mode="mode">
        <el-button @click="handleCancel" v-if="!isDisabled">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit" v-if="!isDisabled">
          {{ submitText }}
        </el-button>
        <el-button @click="handleCancel" v-else>关闭</el-button>
      </slot>
    </template>
  </BtcDialog>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, h, watch, computed, unref, toRef } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcDialog from '../../common/dialog/index.vue';
import type { UpsertProps } from './types';
import { useFormData, useFormInit, useFormSubmit, usePlugins } from './composables';

defineOptions({
  name: 'BtcUpsert',
});

const props = defineProps<UpsertProps>();

// 注入 CRUD 上下文
const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcUpsert] Must be used inside <BtcCrud>');
}

// 关键：直接使用 crud.upsertVisible，确保响应式追踪正确
// 使用 toRef 确保能够正确追踪 ref 对象内部的变化
// 这样即使值相同，Vue 也能检测到 ref 对象本身的变化
const upsertVisibleValue = computed({
  get: () => {
    const value = unref(crud.upsertVisible);
    // 生产环境日志
    if (import.meta.env.PROD) {
      console.log('[BtcUpsert] upsertVisibleValue getter', {
        value,
        isRef: crud.upsertVisible instanceof Object && 'value' in crud.upsertVisible,
        timestamp: new Date().toISOString(),
      });
    }
    return value;
  },
  set: (val: boolean) => {
    // 生产环境日志
    if (import.meta.env.PROD) {
      console.log('[BtcUpsert] upsertVisibleValue setter', {
        newValue: val,
        oldValue: unref(crud.upsertVisible),
        timestamp: new Date().toISOString(),
      });
    }
    if (crud.upsertVisible && typeof crud.upsertVisible === 'object' && 'value' in crud.upsertVisible) {
      crud.upsertVisible.value = val;
    }
  },
});

// 关键：处理 modelValue 更新，确保能够正确传递到 crud.upsertVisible
function handleModelValueUpdate(val: boolean) {
  // 生产环境日志
  if (import.meta.env.PROD) {
    console.log('[BtcUpsert] handleModelValueUpdate', {
      newValue: val,
      oldValue: unref(crud.upsertVisible),
      timestamp: new Date().toISOString(),
    });
  }

  // 更新 crud.upsertVisible
  if (crud.upsertVisible && typeof crud.upsertVisible === 'object' && 'value' in crud.upsertVisible) {
    crud.upsertVisible.value = val;
  }
}

// 生产环境日志：监听 upsertVisible 变化
if (import.meta.env.PROD) {
  watch(
    () => crud.upsertVisible,
    (newVal, oldVal) => {
      const newValue = newVal?.value ?? newVal;
      const oldValue = oldVal?.value ?? oldVal;
      console.log('[BtcUpsert] upsertVisible 变化', {
        oldValue,
        newValue,
        isRef: newVal instanceof Object && 'value' in newVal,
        refType: typeof newVal,
        timestamp: new Date().toISOString(),
      });
    },
    { immediate: true, deep: true }
  );
}

// 表单数据管理
const formDataContext = useFormData(props);
const {
  formRef,
  formData,
  loadingData,
  mode,
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
  getComponentProps,
  renderComponent,
} = formDataContext;

// 插件系统
const pluginContext = usePlugins(props);

// 表单初始化
const { initFormData, append } = useFormInit(props, crud, formDataContext, pluginContext);

// 表单提交
const { submitting, handleSubmit, handleCancel, handleClosed } = useFormSubmit(
  props,
  crud,
  formDataContext,
  pluginContext
);

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // 只有在弹窗打开且不是禁用状态时才处理 Enter 键
  const isVisible = upsertVisibleValue.value;
  if (isVisible && !isDisabled.value && event.key === 'Enter') {
    // 防止在文本输入框中触发（如 textarea）
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') {
      return;
    }

    // 防止在富文本编辑器中触发
    if (target.contentEditable === 'true') {
      return;
    }

    event.preventDefault();
    handleSubmit();
  }
};

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 暴露方法和属性
defineExpose({
  formRef,
  formData,
  mode, // 暴露模式
  open: initFormData, // 手动打开
  append, // 追加数据打开（对齐 cool-admin）
});
</script>

<style lang="scss" scoped>
// 紧凑的表单样式（参考 cool-admin cl-form）
:deep([class*="el-col-"].is-guttered) {
  min-height: 0;
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 18px; // 默认模式

    .el-form-item {
      margin-bottom: 18px; // 嵌套表单项
    }

    .el-input-number {
      &__decrease,
      &__increase {
        border: 0;
        background-color: transparent;
      }
    }

    &__label {
      .el-tooltip {
        i {
          margin-left: 5px;
        }
      }
    }

    &__content {
      min-width: 0px;

      & > div {
        width: 100%;
      }

      // 确保 el-input-number 占满宽度
      .el-input-number {
        width: 100%;
      }
    }
  }

  // label-top 模式（默认）
  &.el-form--label-top {
    .el-form-item {
      margin-bottom: 22px;
    }

    .el-form-item__label {
      margin: 0 0 4px 0;
      min-height: 22px;
    }

    .el-form-item__error {
      padding-top: 4px;
    }
  }

  // 非 label-top 模式的特殊处理
  &:not(.el-form--label-top) {
    .el-form-item {
      &.no-label {
        & > .el-form-item__label {
          padding: 0;
          display: none;
        }
      }
    }
  }
}
</style>
