# 27 - 物流应用-动态路径配置

> **阶段**: Phase 4 | **时间**: 1小时 | **前置**: 26

## 🎯 任务目标

配置动态 publicPath，解决子应用资源加载问题。

## 📋 执行步骤

### 1. 验证 public-path.ts

确保文件存在且正确：

**src/public-path.ts**:
```typescript
if ((window as any).__POWERED_BY_QIANKUN__) {
  // @ts-ignore
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

### 2. 在 main.ts 首行引入

**src/main.ts**:
```typescript
import './public-path'; // 必须在第一行

import { createApp } from 'vue';
// ...
```

### 3. 配置 Vite base

**vite.config.ts**:
```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '/logistics-app/'
    : '/',
  // ...
});
```

## ✅ 验收标准

### 检查：资源加载

```bash
# 构建应用
pnpm build

# 检查产物
ls dist

# 在主应用中加载
# 预期: 静态资源正确加载，无404错误
```

## 📝 检查清单

- [ ] public-path 存在
- [ ] main.ts 正确引入
- [ ] Vite base 配置
- [ ] 资源加载正常

## 🔗 下一步

- [28 - 采购订单模块](./28-procurement-order.md)

