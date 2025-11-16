# 30 - 生产应用初始化

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 29

## 🎯 任务目标

创建生产子应用基础结构。

## 📋 执行步骤

### 1. 复制物流应用作为模板

```bash
cp -r packages/logistics-app packages/production-app
cd packages/production-app
```

### 2. 修改配置

**package.json**:
```json
{
  "name": "production-app"
}
```

**vite.config.ts**:
```typescript
export default defineConfig({
  plugins: [
    qiankun('production-app', { useDevMode: true }),
  ],
  server: {
    port: 5002,
  },
});
```

### 3. 创建模块目录

```bash
rm -rf src/modules/*
mkdir -p src/modules/production-plan
```

### 4. 修改根组件

**src/App.vue**:
```vue
<template>
  <div id="production-app">
    <h2>生产管理系统</h2>
    <router-view />
  </div>
</template>
```

## ✅ 验收标准

### 检查：应用启动

```bash
pnpm dev
# 访问 http://localhost:5002
# 预期: 显示"生产管理系统"
```

## 📝 检查清单

- [ ] 应用复制
- [ ] 配置修改
- [ ] 目录清理
- [ ] 根组件修改
- [ ] 启动成功

## 🔗 下一步

- [31 - 生产计划模块](./31-production-plan.md)

