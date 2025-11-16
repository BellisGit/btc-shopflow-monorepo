# 06 - 共享组件库基础

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 05

## 🎯 任务目标

创建共享组件库基础框架，后续用于 CRUD 组件开发。

## 📋 执行步骤

### 1. 初始化包

```bash
cd packages/shared-components
pnpm init
```

### 2. 安装依赖

```bash
pnpm add vue
pnpm add -D @vitejs/plugin-vue vite typescript
```

### 3. 配置 package.json

```json
{
  "name": "@btc/shared-components",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && vue-tsc --declaration --emitDeclarationOnly",
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

### 4. 创建目录结构

```bash
mkdir -p src/{crud,common}
touch src/index.ts
```

### 5. 创建基础组件示例

**src/common/button/index.vue**:
```vue
<template>
  <button class="btc-button" :class="typeClass" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger';
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const typeClass = computed(() => props.type ? `btc-button--${props.type}` : '');

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<style scoped>
.btc-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btc-button--primary {
  background: #409eff;
  color: white;
}
</style>
```

### 6. 导出组件

**src/index.ts**:
```typescript
import BtcButton from './common/button/index.vue';

export { BtcButton };

// 后续会添加 CRUD 组件
// export { CrudTable } from './crud/table';
// export { CrudForm } from './crud/form';
```

### 7. 配置 Vite

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
```

### 8. 配置 TypeScript

**tsconfig.json**:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "jsx": "preserve"
  },
  "include": ["src/**/*"]
}
```

## ✅ 验收标准

### 检查 1: 构建成功

```bash
cd packages/shared-components
pnpm build

ls dist
# 预期: index.js, index.mjs, index.d.ts
```

### 检查 2: 组件可用

```vue
<template>
  <BtcButton type="primary" @click="handleClick">
    测试按钮
  </BtcButton>
</template>

<script setup>
import { BtcButton } from '@btc/shared-components';

const handleClick = () => {
  console.log('clicked');
};
</script>
```

## 📝 检查清单

- [ ] 包初始化完成
- [ ] Vue 依赖安装
- [ ] 目录结构创建
- [ ] 示例组件创建
- [ ] Vite 配置正确
- [ ] 构建成功
- [ ] 组件可引用

## 🔗 下一步

- [07 - 核心共享库基础](./07-shared-core-base.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

