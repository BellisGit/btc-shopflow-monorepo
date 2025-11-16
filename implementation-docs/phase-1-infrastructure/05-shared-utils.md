# 05 - 共享工具库搭建

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 04

## 🎯 任务目标

创建共享工具库，提供日期处理、格式化、校验等通用函数。

## 📋 执行步骤

### 1. 初始化包

```bash
cd packages/shared-utils
pnpm init
```

### 2. 配置 package.json

```json
{
  "name": "@btc/shared-utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc --emitDeclarationOnly",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "dayjs": "^1.11.10"
  }
}
```

### 3. 创建目录结构

```bash
mkdir -p src/{date,format,validate,storage}
touch src/index.ts
```

### 4. 实现日期工具

**src/date/index.ts**:
```typescript
import dayjs from 'dayjs';

export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function getDateRange(type: 'today' | 'week' | 'month'): [string, string] {
  const now = dayjs();
  
  switch (type) {
    case 'today':
      return [now.startOf('day').format(), now.endOf('day').format()];
    case 'week':
      return [now.startOf('week').format(), now.endOf('week').format()];
    case 'month':
      return [now.startOf('month').format(), now.endOf('month').format()];
  }
}
```

### 5. 实现格式化工具

**src/format/index.ts**:
```typescript
export function formatMoney(value: number, currency = '¥'): string {
  return `${currency}${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
```

### 6. 实现校验工具

**src/validate/index.ts**:
```typescript
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

export function isIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}
```

### 7. 汇总导出

**src/index.ts**:
```typescript
export * from './date';
export * from './format';
export * from './validate';
```

### 8. 配置 Vite

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedUtils',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
  },
});
```

## ✅ 验收标准

### 检查 1: 构建成功

```bash
cd packages/shared-utils
pnpm build

ls dist
# 预期: index.js, index.mjs, index.d.ts
```

### 检查 2: 功能测试

```typescript
import { formatDate, formatMoney, isEmail } from '@btc/shared-utils';

console.log(formatDate(new Date())); // 2025-10-09
console.log(formatMoney(12345.67)); // ¥12,345.67
console.log(isEmail('test@example.com')); // true
```

## 📝 检查清单

- [ ] 包初始化完成
- [ ] 目录结构创建
- [ ] 日期工具实现
- [ ] 格式化工具实现
- [ ] 校验工具实现
- [ ] Vite 配置正确
- [ ] 构建成功
- [ ] 类型定义生成

## 🔗 下一步

- [06 - 共享组件库基础](./06-shared-components-base.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

