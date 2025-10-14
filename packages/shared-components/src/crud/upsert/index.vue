<template>
  <BtcDialog
    v-model="crud.upsertVisible.value"
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
            :label="item.label"
            :prop="item.prop"
            :required="item.required"
            :rules="item.rules"
          >
            <slot :name="`item-${item.prop}`" :item="item" :form="formData" :mode="mode">
              <!-- 自定义组件 -->
              <component
                v-if="item.component"
                :is="item.component.name"
                v-model="formData[item.prop]"
                v-bind="getComponentProps(item)"
              >
                <!-- el-select 选项 -->
                <template v-if="item.component.name === 'el-select' && item.component.options">
                  <el-option
                    v-for="option in item.component.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </template>

                <!-- el-radio-group 选项 -->
                <template v-else-if="item.component.name === 'el-radio-group' && item.component.options">
                  <el-radio
                    v-for="option in item.component.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </el-radio>
                </template>

                <!-- el-checkbox-group 选项 -->
                <template v-else-if="item.component.name === 'el-checkbox-group' && item.component.options">
                  <el-checkbox
                    v-for="option in item.component.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </el-checkbox>
                </template>
              </component>

              <!-- 默认输入框 -->
              <el-input
                v-else
                v-model="formData[item.prop]"
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
import { inject } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import { BtcDialog } from '../../index';
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
