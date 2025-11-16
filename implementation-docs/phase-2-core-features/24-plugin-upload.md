# 14 - 数据字典系统

> **阶段**: Phase 2 | **时间**: 2小时 | **前置**: 13

## 🎯 任务目标

实现数据字典系统，支持枚举值的翻译和显示。

## 📋 执行步骤

### 1. 实现 useDict

**packages/shared-core/src/composables/use-dict.ts**:
```typescript
import { ref } from 'vue';

interface DictItem {
  label: string;
  value: any;
  type?: string;
}

const dictCache = new Map<string, DictItem[]>();

export function useDict(dictKey: string) {
  const dictData = ref<DictItem[]>([]);
  const loading = ref(false);

  const load = async () => {
    if (dictCache.has(dictKey)) {
      dictData.value = dictCache.get(dictKey)!;
      return;
    }

    loading.value = true;
    try {
      // 实际项目中从 API 加载
      // const res = await service.dict.list({ type: dictKey });
      // dictData.value = res;
      dictData.value = [];
      dictCache.set(dictKey, dictData.value);
    } finally {
      loading.value = false;
    }
  };

  const translate = (value: any) => {
    const item = dictData.value.find(d => d.value === value);
    return item?.label || value;
  };

  const getType = (value: any) => {
    const item = dictData.value.find(d => d.value === value);
    return item?.type || 'info';
  };

  return {
    dictData,
    loading,
    load,
    translate,
    getType,
  };
}
```

### 2. 创建 DictTag 组件

**packages/shared-components/src/common/dict-tag/index.vue**:
```vue
<template>
  <el-tag :type="tagType">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDict } from '@btc/shared-core';

const props = defineProps<{
  dict: string;
  value: any;
}>();

const { dictData, load, translate, getType } = useDict(props.dict);

const label = computed(() => translate(props.value));
const tagType = computed(() => getType(props.value) as any);

onMounted(() => {
  load();
});
</script>
```

### 3. 导出

**packages/shared-core/src/index.ts**:
```typescript
export { useDict } from './composables/use-dict';
```

**packages/shared-components/src/index.ts**:
```typescript
import DictTag from './common/dict-tag/index.vue';
export { DictTag };
```

## ✅ 验收标准

### 检查：字典使用

```vue
<template>
  <DictTag dict="user_status" :value="1" />
</template>

<script setup lang="ts">
import { DictTag } from '@btc/shared-components';
</script>
```

## 📝 检查清单

- [ ] useDict 实现
- [ ] DictTag 组件
- [ ] 缓存机制
- [ ] 翻译功能
- [ ] 导出正确

## 🔗 下一步

- [15 - 权限指令系统](./15-permission-directive.md)

