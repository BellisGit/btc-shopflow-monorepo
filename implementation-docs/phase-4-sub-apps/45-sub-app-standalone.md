# 26.5 - 子应用独立运行能力

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 26, 27

## 🎯 任务目标

配置子应用独立运行能力，支持在 qiankun 环境和独立环境下无缝切换。

## 📋 执行步骤

### 1. 完善 public-path 配置

**packages/logistics-app/src/public-path.ts**:
```typescript
// 🔥 判断是否在 qiankun 环境
if ((window as any).__POWERED_BY_QIANKUN__) {
  // qiankun 环境：使用动态 publicPath
  // @ts-ignore
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

### 2. 增强 main.ts - 支持独立运行

**packages/logistics-app/src/main.ts**:
```typescript
import './public-path'; // 必须在第一行

import { createApp, App as VueApp } from 'vue';
import { createRouter, createWebHistory, Router } from 'vue-router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import AppComponent from './App.vue';
import routes from './router/routes';

let app: VueApp | null = null;
let router: Router | null = null;
let pinia: any = null;

/**
 * 渲染函数
 */
function render(props: any = {}) {
  const { container, routerBase, globalState, parentService } = props;

  // 🔥 根据环境确定路由 base
  const base = routerBase || (import.meta.env.DEV ? '/' : '/logistics');

  // 创建路由
  router = createRouter({
    history: createWebHistory(base),
    routes,
  });

  // 创建 Pinia
  pinia = createPinia();

  // 创建应用
  app = createApp(AppComponent);

  app.use(router);
  app.use(pinia);
  app.use(ElementPlus);

  // 🔥 注入全局状态（如果有）
  if (globalState) {
    app.provide('globalState', globalState);

    // 监听全局状态变化
    globalState.onGlobalStateChange((state: any) => {
      console.log('[logistics-app] 全局状态变化:', state);
    });
  }

  // 🔥 注入父应用服务（如果有）
  if (parentService) {
    app.provide('parentService', parentService);
  }

  // 确定挂载容器
  const containerEl = container
    ? container.querySelector('#logistics-app-root')
    : document.getElementById('logistics-app-root');

  if (!containerEl) {
    console.error('[logistics-app] 找不到挂载容器');
    return;
  }

  app.mount(containerEl);
}

// 🔥 独立运行模式
if (!(window as any).__POWERED_BY_QIANKUN__) {
  console.log('[logistics-app] 独立运行模式');
  render();
}

// ==================== qiankun 生命周期 ====================

/**
 * bootstrap 只会在微应用初始化的时候调用一次
 */
export async function bootstrap() {
  console.log('[logistics-app] bootstrap');
}

/**
 * 应用每次进入都会调用 mount 方法
 */
export async function mount(props: any) {
  console.log('[logistics-app] mount', props);
  render(props);
}

/**
 * 应用每次切出/卸载会调用的方法
 */
export async function unmount() {
  console.log('[logistics-app] unmount');

  // 卸载应用
  app?.unmount();

  // 清理实例
  app = null;
  router = null;
  pinia = null;
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props: any) {
  console.log('[logistics-app] update', props);
}
```

### 3. 配置独立运行的环境变量

**packages/logistics-app/.env.development**:
```bash
# 开发环境 - 独立运行
VITE_APP_TITLE=物流管理系统
VITE_APP_BASE_API=http://localhost:8001
VITE_APP_MODE=standalone
```

**packages/logistics-app/.env.production**:
```bash
# 生产环境 - qiankun 模式
VITE_APP_TITLE=物流管理系统
VITE_APP_BASE_API=https://api.btc-shopflow.com.cn
VITE_APP_MODE=qiankun
```

**packages/logistics-app/.env.standalone**:
```bash
# 独立部署环境
VITE_APP_TITLE=物流管理系统
VITE_APP_BASE_API=https://logistics-api.btc-shopflow.com.cn
VITE_APP_MODE=standalone
```

### 4. 调整 Vite 配置

**packages/logistics-app/vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 🔥 判断是否独立运行
  const isStandalone = mode === 'standalone' || process.env.STANDALONE === 'true';

  return {
    plugins: [vue()],

    // 🔥 根据模式设置 base
    base: isStandalone ? '/' : '/logistics-app/',

    server: {
      port: 5001,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    build: {
      target: 'es2015',
      outDir: 'dist',

      // 🔥 qiankun 模式需要的配置
      lib: isStandalone
        ? undefined
        : {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'logistics-app',
            formats: ['umd'],
            fileName: 'logistics-app',
          },

      rollupOptions: {
        // 🔥 独立模式不需要外部化依赖
        external: isStandalone ? [] : ['vue', 'vue-router', 'pinia'],
        output: isStandalone
          ? undefined
          : {
              globals: {
                vue: 'Vue',
                'vue-router': 'VueRouter',
                pinia: 'Pinia',
              },
            },
      },
    },
  };
});
```

### 5. 添加独立运行入口 HTML

**packages/logistics-app/index.html**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>物流管理系统</title>
  </head>
  <body>
    <!-- 🔥 独立运行的根元素 -->
    <div id="logistics-app-root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 6. 调整路由配置

**packages/logistics-app/src/router/routes.ts**:
```typescript
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/procurement',
  },
  {
    path: '/procurement',
    component: () => import('../layouts/default.vue'),
    children: [
      {
        path: 'order',
        name: 'ProcurementOrder',
        component: () => import('../modules/procurement/views/order/index.vue'),
        meta: { title: '采购订单' },
      },
      {
        path: 'supplier',
        name: 'ProcurementSupplier',
        component: () => import('../modules/procurement/views/supplier/index.vue'),
        meta: { title: '供应商管理' },
      },
    ],
  },
  {
    path: '/warehouse',
    component: () => import('../layouts/default.vue'),
    children: [
      {
        path: 'inventory',
        name: 'WarehouseInventory',
        component: () => import('../modules/warehouse/views/inventory/index.vue'),
        meta: { title: '库存管理' },
      },
    ],
  },
];

export default routes;
```

### 7. 创建独立运行布局

**packages/logistics-app/src/layouts/default.vue**:
```vue
<template>
  <div class="logistics-layout">
    <!-- 🔥 独立运行模式显示完整布局 -->
    <div v-if="isStandalone" class="layout-header">
      <h1>物流管理系统</h1>
      <div class="user-info">
        <span>{{ userInfo?.name || '游客' }}</span>
      </div>
    </div>

    <!-- 🔥 qiankun 模式只显示内容区域 -->
    <div class="layout-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

// 判断是否独立运行
const isStandalone = computed(() => {
  return !(window as any).__POWERED_BY_QIANKUN__;
});

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
</script>

<style scoped>
.logistics-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background: #001529;
  color: #fff;
}

.layout-header h1 {
  margin: 0;
  font-size: 20px;
}

.layout-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
```

### 8. 添加 package.json 脚本

**packages/logistics-app/package.json**:
```json
{
  "name": "logistics-app",
  "scripts": {
    "dev": "vite",
    "dev:standalone": "vite --mode standalone",
    "build": "vite build",
    "build:standalone": "vite build --mode standalone",
    "preview": "vite preview"
  }
}
```

## ✅ 验收标准

### 检查 1: 独立运行模式

```bash
# 启动独立模式
cd packages/logistics-app
pnpm dev:standalone

# 访问 http://localhost:5001
# 预期: 应用正常运行，显示完整布局和头部
```

### 检查 2: qiankun 模式

```bash
# 启动主应用
pnpm dev:base

# 访问子应用路由 http://localhost:5000/logistics
# 预期: 子应用嵌入主应用，不显示子应用头部
```

### 检查 3: 路由正常

```bash
# 独立模式
访问: http://localhost:5001/procurement/order
预期: 正常访问

# qiankun 模式
访问: http://localhost:5000/logistics/procurement/order
预期: 正常访问
```

### 检查 4: 构建独立部署包

```bash
pnpm build:standalone

# 检查产物
ls dist/
# 预期: 标准的 SPA 构建产物（非 UMD）
```

## 📝 检查清单

- [ ] public-path 配置
- [ ] main.ts 支持独立运行
- [ ] 环境变量配置
- [ ] Vite 配置调整
- [ ] 入口 HTML 创建
- [ ] 路由配置调整
- [ ] 独立运行布局
- [ ] package.json 脚本
- [ ] 独立模式正常运行
- [ ] qiankun 模式正常运行

## 🚨 常见问题

**Q: 独立运行时样式丢失？**
A: 确保在 main.ts 中导入了 Element Plus 样式

**Q: 路由 404？**
A: 检查 router base 配置，独立模式应为 `/`

**Q: qiankun 模式下显示了头部？**
A: 检查 `isStandalone` 判断逻辑

**Q: 构建产物不对？**
A: 检查 vite.config.ts 中的 build.lib 配置

## 💡 最佳实践

1. **环境区分**
   - 开发环境：独立运行
   - 生产环境：qiankun 模式
   - 独立部署：standalone 模式

2. **布局处理**
   - qiankun 模式：精简布局
   - 独立模式：完整布局

3. **路由配置**
   - 使用相对路径
   - 避免硬编码 base

4. **资源加载**
   - 使用 publicPath
   - 确保资源可访问

## 🔗 下一步

- [27.5 - 主子应用 props 传递](./27.5-sub-app-props.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时
