# 07 - 核心共享库基础

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 06

## 🎯 任务目标

创建核心共享库基础框架，后续用于 EPS、CRUD、插件系统开发。

## 📋 执行步骤

### 1. 初始化包

```bash
cd packages/shared-core
pnpm init
```

### 2. 安装依赖

```bash
pnpm add vue axios
pnpm add -D vite typescript
```

### 3. 配置 package.json

```json
{
  "name": "@btc/shared-core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc --declaration --emitDeclarationOnly",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

### 4. 创建目录结构

```bash
mkdir -p src/{btc,composables,directives,types}
mkdir -p src/btc/{service,crud,plugin}
touch src/index.ts
```

### 5. 创建 BTC 核心框架

**src/btc/index.ts**:
```typescript
import type { App } from 'vue';

export interface BtcOptions {
  // 后续添加配置
}

export function useCore() {
  return {
    // 后续添加 service, crud, plugin
  };
}

export function installBtc(app: App, options?: BtcOptions) {
  // 后续实现插件安装逻辑
  console.log('BTC Framework installed', options);
}
```

### 6. 创建类型定义

**src/types/common.ts**:
```typescript
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface PageParams {
  page: number;
  size: number;
  [key: string]: any;
}
```

**src/types/crud.ts**:
```typescript
export interface CrudColumn {
  prop: string;
  label: string;
  width?: number;
  formatter?: (row: any) => string;
  dict?: string;
}

export interface CrudConfig {
  service: any;
  table: {
    columns: CrudColumn[];
  };
  search?: {
    items: any[];
  };
  upsert?: {
    items: any[];
  };
}
```

### 7. 创建基础 Composable

**src/composables/use-request.ts**:
```typescript
import { ref } from 'vue';

export function useRequest<T = any>(requestFn: () => Promise<T>) {
  const loading = ref(false);
  const data = ref<T>();
  const error = ref<Error>();

  const execute = async () => {
    loading.value = true;
    try {
      data.value = await requestFn();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    data,
    error,
    execute,
  };
}
```

### 8. 汇总导出

**src/index.ts**:
```typescript
export * from './btc';
export * from './composables/use-request';
export * from './types/common';
export * from './types/crud';
```

### 9. 配置 Vite

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'axios'],
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios',
        },
      },
    },
  },
});
```

## ✅ 验收标准

### 检查 1: 构建成功

```bash
cd packages/shared-core
pnpm build

ls dist
# 预期: index.js, index.mjs, index.d.ts
```

### 检查 2: 类型可用

```typescript
import type { CrudConfig, PageResponse } from '@btc/shared-core';
import { useCore, useRequest } from '@btc/shared-core';

// 类型检查通过
const config: CrudConfig = {
  service: {},
  table: { columns: [] },
};
```

### 检查 3: M1 里程碑验收

```bash
# 在根目录运行
pnpm -r run build

# 预期: 所有包构建成功
# shared-utils ✓
# shared-components ✓
# shared-core ✓
```

## 📝 检查清单

- [ ] 包初始化完成
- [ ] 目录结构创建
- [ ] 核心框架创建
- [ ] 类型定义完整
- [ ] 基础 Composable
- [ ] Vite 配置正确
- [ ] 构建成功

## 🎉 里程碑 M1 完成

恭喜！完成阶段一，Monorepo 环境已就绪：
- ✅ pnpm workspaces 配置
- ✅ TypeScript 统一配置
- ✅ ESLint + Prettier 规范
- ✅ Git Hooks 自动化
- ✅ 三个共享库基础版

## 🔗 下一步

- [08 - EPS Vite 插件开发](../phase-2-core-features/08-vite-plugin-eps.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

