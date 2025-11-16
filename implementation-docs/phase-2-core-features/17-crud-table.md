# 12 - CRUD 表单组件

> **阶段**: Phase 2 | **时间**: 4小时 | **前置**: 11

## 🎯 任务目标

开发 CrudForm 表单组件，实现新增和编辑功能。

## 📋 执行步骤

### 1. 创建组件

**packages/shared-components/src/crud/form/index.vue**:
```vue
<template>
  <el-dialog v-model="visible" :title="title" width="600px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item
        v-for="item in items"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
      >
        <component
          :is="item.component"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormInstance } from 'element-plus';

interface FormItem {
  prop: string;
  label: string;
  component: string;
  componentProps?: any;
  rules?: any[];
}

const props = defineProps<{
  modelValue: boolean;
  items: FormItem[];
  data?: any;
  onSubmit?: (data: any) => Promise<void>;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const title = computed(() => props.data ? '编辑' : '新增');
const formRef = ref<FormInstance>();
const formData = ref<any>({});
const loading = ref(false);

const rules = computed(() => {
  const result: any = {};
  props.items.forEach(item => {
    if (item.rules) {
      result[item.prop] = item.rules;
    }
  });
  return result;
});

watch(() => props.data, (val) => {
  formData.value = val ? { ...val } : {};
}, { immediate: true });

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate();
  loading.value = true;

  try {
    await props.onSubmit?.(formData.value);
    emit('success');
    visible.value = false;
  } finally {
    loading.value = false;
  }
};
</script>
```

### 2. 导出组件

**packages/shared-components/src/index.ts**:
```typescript
import CrudForm from './crud/form/index.vue';
export { CrudForm };
```

## ✅ 验收标准

### 检查：表单使用

```vue
<template>
  <CrudForm
    v-model="visible"
    :items="formItems"
    :data="currentRow"
    @success="loadData"
  />
</template>

<script setup lang="ts">
const formItems = [
  {
    prop: 'name',
    label: '姓名',
    component: 'el-input',
    rules: [{ required: true, message: '请输入姓名' }],
  },
];
</script>
```

## 📝 检查清单

- [ ] 组件创建
- [ ] 表单渲染
- [ ] 动态组件
- [ ] 表单校验
- [ ] 提交逻辑
- [ ] 导出正确

## 🔗 下一步

- [13 - 插件管理器](./13-plugin-manager.md)

