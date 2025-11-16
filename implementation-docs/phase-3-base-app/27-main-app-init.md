# 16 - 主应用初始化

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 01-15

## 🎯 任务目标

创建主应用主应用，配置 Vue 3 + Vite 开发环境。

## 📋 执行步骤

### 1. 创建应用目录

```bash
cd packages
mkdir main-app
cd main-app
pnpm init
```

### 2. 安装依赖

```bash
pnpm add vue vue-router pinia
pnpm add -D @vitejs/plugin-vue vite
pnpm add @btc/shared-utils@workspace:*
pnpm add @btc/shared-components@workspace:*
pnpm add @btc/shared-core@workspace:*
```

### 3. 创建目录结构

```bash
mkdir -p src/{views,router,store,layouts,components,config,utils}
mkdir -p public
```

### 4. 创建入口文件

**src/main.ts**:
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
```

**src/App.vue**:
```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}
</style>
```

### 5. 创建基础路由

**src/router/index.ts**:
```typescript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    component: () => import('../views/login/index.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

### 6. 创建临时页面

**src/views/dashboard/index.vue**:
```vue
<template>
  <div class="dashboard">
    <h1>主应用已启动</h1>
    <p>Qiankun 微前端主应用</p>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 40px;
  text-align: center;
}
</style>
```

### 7. 配置 Vite

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '/@': path.resolve(__dirname, 'src'),
    },
  },
  
  server: {
    port: 5000,
    host: true,
  },
});
```

### 8. 创建 HTML 模板

**index.html**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BTC 管理系统</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 9. 配置 package.json

```json
{
  "name": "main-app",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

## ✅ 验收标准

### 检查 1: 应用启动

```bash
cd packages/main-app
pnpm dev

# 访问 http://localhost:5000
# 预期: 显示 "主应用已启动"
```

### 检查 2: 路由切换

```bash
# 访问 http://localhost:5000/dashboard
# 预期: 正常显示
```

### 检查 3: 共享库引用

**src/views/dashboard/index.vue**:
```typescript
import { formatDate } from '@btc/shared-utils';

console.log(formatDate(new Date()));
// 预期: 无报错，能正常使用
```

## 📝 检查清单

- [ ] 应用目录结构创建
- [ ] 依赖安装成功
- [ ] 主文件创建（main.ts, App.vue）
- [ ] 路由配置完成
- [ ] Vite 配置正确
- [ ] 应用能成功启动
- [ ] 路由跳转正常
- [ ] 共享库能引用

## 🚨 常见问题

**Q: 端口被占用？**  
A: 修改 vite.config.ts 中的 port 配置

**Q: 别名路径不生效？**  
A: 检查 tsconfig.json 和 vite.config.ts 中的 alias 配置

## 🔗 下一步

- [17 - qiankun 基础配置](./17-qiankun-setup.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

