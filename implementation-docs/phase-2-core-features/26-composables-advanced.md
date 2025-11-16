# 15.5 - 高级 Composables

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 15

## 🎯 任务目标

实现高级 Composables，提供常用业务逻辑封装。

## 📋 执行步骤

### 1. useTable - 表格增强

**packages/shared-core/src/composables/use-table.ts**:
```typescript
import { ref, computed } from 'vue';

export function useTable<T = any>(options: {
  defaultPageSize?: number;
  multipleSelection?: boolean;
}) {
  const { defaultPageSize = 20, multipleSelection = false } = options;

  const tableData = ref<T[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(defaultPageSize);

  // 多选
  const selectedRows = ref<T[]>([]);

  const handleSelectionChange = (rows: T[]) => {
    selectedRows.value = rows;
  };

  // 计算属性
  const isEmpty = computed(() => tableData.value.length === 0);
  const hasSelected = computed(() => selectedRows.value.length > 0);

  // 分页变化
  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
  };

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    selectedRows,
    isEmpty,
    hasSelected,
    handleSelectionChange,
    handlePageChange,
    handleSizeChange,
  };
}
```

### 2. useForm - 表单增强

**packages/shared-core/src/composables/use-form.ts**:
```typescript
import { ref, unref } from 'vue';
import type { Ref, UnwrapRef } from 'vue';
import type { FormInstance } from 'element-plus';

export function useForm<T extends object>(initialValues: T | Ref<T>) {
  const formRef = ref<FormInstance>();
  const formData = ref(unref(initialValues)) as Ref<UnwrapRef<T>>;
  const loading = ref(false);

  // 验证表单
  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false;
    
    try {
      await formRef.value.validate();
      return true;
    } catch {
      return false;
    }
  };

  // 重置表单
  const resetFields = () => {
    formRef.value?.resetFields();
  };

  // 清空验证
  const clearValidate = (props?: string | string[]) => {
    formRef.value?.clearValidate(props);
  };

  // 设置字段值
  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    (formData.value as any)[field] = value;
  };

  // 批量设置
  const setFieldsValue = (values: Partial<T>) => {
    Object.assign(formData.value, values);
  };

  // 提交表单
  const submit = async (
    onSubmit: (data: UnwrapRef<T>) => Promise<void>
  ): Promise<boolean> => {
    if (!(await validate())) return false;

    loading.value = true;
    try {
      await onSubmit(formData.value);
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    formRef,
    formData,
    loading,
    validate,
    resetFields,
    clearValidate,
    setFieldValue,
    setFieldsValue,
    submit,
  };
}
```

### 3. useDialog - 弹窗管理

**packages/shared-core/src/composables/use-dialog.ts**:
```typescript
import { ref } from 'vue';

export function useDialog() {
  const visible = ref(false);
  const loading = ref(false);
  const data = ref<any>(null);

  const open = (initialData?: any) => {
    data.value = initialData ? { ...initialData } : null;
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
  };

  const confirm = async (onConfirm: (data: any) => Promise<void>) => {
    loading.value = true;
    
    try {
      await onConfirm(data.value);
      close();
      return true;
    } catch (error) {
      console.error('操作失败:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    visible,
    loading,
    data,
    open,
    close,
    confirm,
  };
}
```

### 4. useAsync - 异步操作

**packages/shared-core/src/composables/use-async.ts**:
```typescript
import { ref, shallowRef } from 'vue';

export function useAsync<T, Args extends any[] = any[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const data = shallowRef<T>();
  const error = shallowRef<Error>();
  const loading = ref(false);

  const execute = async (...args: Args) => {
    loading.value = true;
    error.value = undefined;

    try {
      data.value = await asyncFn(...args);
      return data.value;
    } catch (e) {
      error.value = e as Error;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    error,
    loading,
    execute,
  };
}
```

### 5. useDebounce - 防抖

**packages/shared-core/src/composables/use-debounce.ts**:
```typescript
import { ref, customRef, watch } from 'vue';

export function useDebounce<T>(value: T, delay: number = 300) {
  return customRef((track, trigger) => {
    let timeout: any;
    
    return {
      get() {
        track();
        return value;
      },
      set(newValue: T) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}

// 防抖函数
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timeout: any;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
```

### 6. 导出所有 Composables

**packages/shared-core/src/composables/index.ts**:
```typescript
export { useTable } from './use-table';
export { useForm } from './use-form';
export { useDialog } from './use-dialog';
export { useAsync } from './use-async';
export { useDebounce, useDebounceFn } from './use-debounce';
export { useDict } from './use-dict';
export { usePermission } from './use-permission';
export { useRequest } from './use-request';
```

**packages/shared-core/src/index.ts**:
```typescript
export * from './composables';
```

## ✅ 验收标准

### 检查 1: useTable

```vue
<script setup lang="ts">
const {
  tableData,
  loading,
  selectedRows,
  handleSelectionChange,
} = useTable({ multipleSelection: true });

// 批量删除
const handleBatchDelete = () => {
  console.log('删除:', selectedRows.value);
};
</script>
```

### 检查 2: useForm

```vue
<script setup lang="ts">
const { formRef, formData, submit } = useForm({
  name: '',
  email: '',
});

const handleSubmit = () => {
  submit(async (data) => {
    await api.save(data);
  });
};
</script>
```

### 检查 3: useAsync

```vue
<script setup lang="ts">
const { data, loading, execute } = useAsync(async (id: number) => {
  return await api.getDetail(id);
});

onMounted(() => {
  execute(123);
});
</script>
```

## 📝 检查清单

- [ ] useTable 实现
- [ ] useForm 实现
- [ ] useDialog 实现
- [ ] useAsync 实现
- [ ] useDebounce 实现
- [ ] 所有导出
- [ ] 类型定义完整
- [ ] 功能测试通过

## 🔗 下一步

- [16 - 主应用初始化](../phase-3-main-app/16-main-app-init.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

