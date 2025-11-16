# 07.8 - 自动导入配置

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 07.7

## 🎯 任务目标

配置 unplugin-auto-import 实现 Vue API 和组件的自动导入。

## 📋 执行步骤

### 1. 安装插件

```bash
pnpm add -Dw unplugin-auto-import unplugin-vue-components
```

### 2. 配置 Auto Import

**vite.config.ts**:
```typescript
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 Vue API
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@btc/shared-core': ['useCrud', 'useDict', 'usePermission'],
        },
      ],
      
      resolvers: [ElementPlusResolver()],
      
      dts: 'src/auto-imports.d.ts',
      
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
      
      vueTemplate: true,
    }),

    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
      dirs: ['src/components'],
    }),
  ],
});
```

### 3. 配置 TypeScript

**tsconfig.json**:
```json
{
  "include": [
    "src/**/*",
    "src/auto-imports.d.ts",
    "src/components.d.ts"
  ]
}
```

### 4. 配置 ESLint

**.eslintrc.js**:
```javascript
module.exports = {
  extends: [
    './.eslintrc-auto-import.json',
  ],
};
```

### 5. 使用示例

**之前（需要手动导入）**:
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useCrud } from '@btc/shared-core';

const count = ref(0);
const router = useRouter();
// ...
</script>
```

**之后（自动导入）**:
```vue
<script setup lang="ts">
// 无需导入，直接使用
const count = ref(0);
const router = useRouter();
const { tableData, loadData } = useCrud({ /* ... */ });

onMounted(() => {
  ElMessage.success('加载成功');
});
</script>
```

### 6. 自定义 Composables 自动导入

**vite.config.ts** 补充:
```typescript
AutoImport({
  imports: [
    'vue',
    'vue-router',
    'pinia',
    {
      '@btc/shared-core': [
        'useCrud',
        'useDict',
        'usePermission',
        'useRequest',
      ],
      '@/composables/use-table': ['useTable'],
      '@/composables/use-form': ['useForm'],
    },
  ],
  // 自动扫描 composables 目录
  dirs: ['src/composables'],
});
```

## ✅ 验收标准

### 检查 1: API 自动导入

```vue
<script setup lang="ts">
// 无需导入，直接使用
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

onMounted(() => {
  console.log('mounted');
});
</script>
```

### 检查 2: 组件自动导入

```vue
<template>
  <!-- 无需导入 Element Plus 组件 -->
  <el-button type="primary">按钮</el-button>
  <el-input v-model="value" />
  
  <!-- 无需导入自定义组件 -->
  <CrudTable :config="config" />
</template>
```

### 检查 3: 类型提示

```bash
# 检查类型文件
ls src/auto-imports.d.ts
ls src/components.d.ts

# 预期: VSCode 有完整的类型提示
```

## 📝 检查清单

- [ ] 插件安装
- [ ] Auto Import 配置
- [ ] Components 配置
- [ ] TypeScript 配置
- [ ] ESLint 配置
- [ ] Vue API 自动导入
- [ ] Element Plus 自动导入
- [ ] 自定义组件自动导入
- [ ] 类型提示正常

## 🎯 配置建议

### 按需配置导入
```typescript
// 只导入常用 API，避免全局污染
imports: [
  {
    vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted'],
  },
],
```

### 自定义别名
```typescript
imports: [
  {
    '@btc/shared-core': [
      ['useCrud', 'useCRUD'], // 别名
    ],
  },
],
```

## 🔗 下一步

- [08 - EPS Vite 插件开发](../phase-2-core-features/08-vite-plugin-eps.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

