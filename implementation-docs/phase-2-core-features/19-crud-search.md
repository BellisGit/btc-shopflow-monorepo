# 12.6 - CRUD 新增编辑组件

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 12.5

## 🎯 任务目标

开发 CrudUpsert 组件，统一处理新增和编辑逻辑。

## 📋 执行步骤

### 1. 创建组件

**packages/shared-components/src/crud/upsert/index.vue**:
```vue
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="config.width || '600px'"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="config.labelWidth || '100px'"
    >
      <el-form-item
        v-for="item in config.items"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
      >
        <!-- 输入框 -->
        <el-input
          v-if="item.component === 'el-input'"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />

        <!-- 选择器 -->
        <el-select
          v-else-if="item.component === 'el-select'"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        >
          <el-option
            v-for="opt in getOptions(item)"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="item.component === 'el-input-number'"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />

        <!-- 日期选择 -->
        <el-date-picker
          v-else-if="item.component === 'el-date-picker'"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />

        <!-- 开关 -->
        <el-switch
          v-else-if="item.component === 'el-switch'"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />

        <!-- 单选 -->
        <el-radio-group
          v-else-if="item.component === 'el-radio-group'"
          v-model="formData[item.prop]"
        >
          <el-radio
            v-for="opt in getOptions(item)"
            :key="opt.value"
            :label="opt.value"
          >
            {{ opt.label }}
          </el-radio>
        </el-radio-group>

        <!-- 多选 -->
        <el-checkbox-group
          v-else-if="item.component === 'el-checkbox-group'"
          v-model="formData[item.prop]"
        >
          <el-checkbox
            v-for="opt in getOptions(item)"
            :key="opt.value"
            :label="opt.value"
          >
            {{ opt.label }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 富文本 -->
        <div
          v-else-if="item.component === 'el-editor'"
          v-html="formData[item.prop]"
        ></div>

        <!-- 自定义组件 -->
        <component
          v-else
          :is="item.component"
          v-model="formData[item.prop]"
          v-bind="item.componentProps"
        />

        <!-- 提示信息 -->
        <div v-if="item.tip" class="form-item-tip">
          {{ item.tip }}
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useDict } from '@btc/shared-core';

interface UpsertConfig {
  width?: string;
  labelWidth?: string;
  items: FormItem[];
  onSubmit?: (isEdit: boolean, data: any, ctx: any) => Promise<void>;
}

interface FormItem {
  prop: string;
  label: string;
  component: string;
  componentProps?: any;
  rules?: any[];
  options?: Array<{ label: string; value: any }>;
  dict?: string;
  tip?: string;
  defaultValue?: any;
}

const props = defineProps<{
  modelValue: boolean;
  config: UpsertConfig;
  data?: any;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const title = computed(() => props.data ? '编辑' : '新增');
const isEdit = computed(() => !!props.data);

const formRef = ref<FormInstance>();
const formData = ref<any>({});
const loading = ref(false);

// 构建校验规则
const rules = computed<FormRules>(() => {
  const result: FormRules = {};
  props.config.items.forEach(item => {
    if (item.rules) {
      result[item.prop] = item.rules;
    }
  });
  return result;
});

// 获取选项（支持字典）
const getOptions = (item: FormItem) => {
  if (item.dict) {
    const { dictData } = useDict(item.dict);
    return dictData.value.map(d => ({ label: d.label, value: d.value }));
  }
  return item.options || [];
};

// 监听数据变化
watch(
  () => props.data,
  (data) => {
    if (data) {
      formData.value = { ...data };
    } else {
      // 新增时设置默认值
      const defaults: any = {};
      props.config.items.forEach(item => {
        if (item.defaultValue !== undefined) {
          defaults[item.prop] = item.defaultValue;
        }
      });
      formData.value = defaults;
    }
  },
  { immediate: true }
);

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate();
  loading.value = true;

  try {
    const ctx = {
      close: () => { visible.value = false; },
      refresh: () => { emit('success'); },
    };

    await props.config.onSubmit?.(isEdit.value, formData.value, ctx);

    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

// 关闭时重置表单
const handleClosed = () => {
  formRef.value?.resetFields();
  formData.value = {};
};
</script>

<style scoped>
.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
```

### 2. 导出组件

**packages/shared-components/src/index.ts**:
```typescript
import CrudUpsert from './crud/upsert/index.vue';
export { CrudUpsert };
```

### 3. 集成到 CrudTable

**packages/shared-components/src/crud/table/index.vue**:
```vue
<template>
  <div class="crud-table">
    <!-- 表格... -->

    <!-- 新增/编辑弹窗 -->
    <CrudUpsert
      v-model="upsertVisible"
      :config="config.upsert"
      :data="currentRow"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import CrudUpsert from '../upsert/index.vue';

const upsertVisible = ref(false);
const currentRow = ref<any>(null);

const handleAdd = () => {
  currentRow.value = null;
  upsertVisible.value = true;
};

const handleEdit = (row: any) => {
  currentRow.value = { ...row };
  upsertVisible.value = true;
};
</script>
```

## ✅ 验收标准

### 检查：完整的 CRUD 流程

```typescript
const crudConfig = {
  service: mockService,
  
  table: {
    columns: [/* ... */],
  },

  upsert: {
    width: '800px',
    items: [
      {
        prop: 'name',
        label: '名称',
        component: 'el-input',
        rules: [{ required: true, message: '请输入名称' }],
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-radio-group',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
        defaultValue: 1,
      },
      {
        prop: 'category',
        label: '分类',
        component: 'el-select',
        dict: 'category', // 使用字典
      },
    ],
    
    onSubmit: async (isEdit, data, { close, refresh }) => {
      await mockService[isEdit ? 'update' : 'add'](data);
      close();
      refresh();
    },
  },
};
```

## 📝 检查清单

- [ ] 组件创建
- [ ] 支持多种输入类型
- [ ] 表单校验
- [ ] 字典支持
- [ ] 新增/编辑逻辑
- [ ] 默认值支持
- [ ] 提示信息
- [ ] 集成到 CrudTable
- [ ] 完整流程测试

## 🔗 下一步

- [13 - 插件管理器](./13-plugin-manager.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

