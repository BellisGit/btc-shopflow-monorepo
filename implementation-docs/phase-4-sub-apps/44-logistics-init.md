# 26 - 物流应用初始化

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 25

## 🎯 任务目标

基于子应用模板创建物流应用基础结构。

## 📋 执行步骤

### 1. 复制模板

```bash
cp -r packages/sub-app-template packages/logistics-app
cd packages/logistics-app
```

### 2. 修改配置

**package.json**:
```json
{
  "name": "logistics-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

**vite.config.ts**:
```typescript
export default defineConfig({
  plugins: [
    vue(),
    qiankun('logistics-app', { useDevMode: true }),
  ],
  server: {
    port: 5001,
  },
});
```

### 3. 创建目录结构

```bash
mkdir -p src/modules/{procurement,warehouse}
```

### 4. 创建根组件

**src/App.vue**:
```vue
<template>
  <div id="logistics-app">
    <h2>物流管理系统</h2>
    <router-view />
  </div>
</template>
```

### 5. 配置路由

**src/router/index.ts**:
```typescript
export const routes = [
  {
    path: '/procurement',
    component: () => import('../modules/procurement/index.vue'),
  },
  {
    path: '/warehouse',
    component: () => import('../modules/warehouse/index.vue'),
  },
];
```

## ✅ 验收标准

### 检查：应用启动

```bash
pnpm dev
# 访问 http://localhost:5001
# 预期: 显示"物流管理系统"
```

## 📝 检查清单

- [ ] 模板复制
- [ ] 配置修改
- [ ] 目录结构创建
- [ ] 根组件创建
- [ ] 路由配置
- [ ] 应用启动成功

## 🔗 下一步

- [27 - 物流应用-动态路径配置](./27-logistics-public-path.md)

