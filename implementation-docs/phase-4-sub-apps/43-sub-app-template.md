# 25 - 子应用模板

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 24

## 🎯 任务目标

创建子应用通用模板，支持 qiankun 生命周期。

## 📋 执行步骤

### 1. 创建模板结构

```bash
mkdir -p packages/sub-app-template/src
cd packages/sub-app-template
pnpm init
```

### 2. 安装依赖

```bash
pnpm add vue vue-router pinia
pnpm add -D @vitejs/plugin-vue vite vite-plugin-qiankun
```

### 3. 配置 public-path

**src/public-path.ts**:
```typescript
if ((window as any).__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

### 4. 实现生命周期

**src/main.ts**:
```typescript
import './public-path';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

let app: any = null;
let router: any = null;

function render(props: any = {}) {
  const { container } = props;

  router = createRouter({
    history: createWebHistory(props.routerBase || '/'),
    routes: [],
  });

  app = createApp(App);
  app.use(router);

  const containerEl = container
    ? container.querySelector('#app')
    : document.getElementById('app');

  app.mount(containerEl);
}

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期
export async function bootstrap() {
  console.log('[子应用] 启动');
}

export async function mount(props: any) {
  console.log('[子应用] 挂载', props);
  render(props);
}

export async function unmount() {
  console.log('[子应用] 卸载');
  app?.unmount();
  app = null;
  router = null;
}
```

### 5. 配置 Vite

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('sub-app', { useDevMode: true }),
  ],
  server: {
    port: 5001,
    cors: true,
  },
});
```

## ✅ 验收标准

### 检查 1: 独立运行

```bash
pnpm dev
# 访问 http://localhost:5001
# 预期: 应用正常显示
```

### 检查 2: 被主应用加载

```bash
# 主应用中注册该子应用
# 访问对应路由
# 预期: 子应用正常加载
```

## 📝 检查清单

- [ ] 目录结构创建
- [ ] 依赖安装
- [ ] public-path 配置
- [ ] 生命周期实现
- [ ] Vite 配置
- [ ] 独立运行正常
- [ ] 能被主应用加载

## 🔗 下一步

- [26 - 物流应用初始化](./26-logistics-init.md)

