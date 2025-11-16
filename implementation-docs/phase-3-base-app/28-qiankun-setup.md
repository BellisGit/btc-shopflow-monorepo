# 17 - qiankun 基础配置

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 16

## 🎯 任务目标

集成 qiankun 微前端框架到主应用。

## 📋 执行步骤

### 1. 安装 qiankun

```bash
cd packages/main-app
pnpm add qiankun
```

### 2. 创建微应用配置

**src/config/micro-apps.ts**:
```typescript
export interface MicroApp {
  name: string;
  entry: string;
  container: string;
  activeRule: string;
}

const isDev = import.meta.env.DEV;

export const microApps: MicroApp[] = [
  {
    name: 'logistics-app',
    entry: isDev ? 'http://localhost:5001' : 'https://logistics.btc-shopflow.com.cn',
    container: '#subapp-container',
    activeRule: '/logistics',
  },
  {
    name: 'production-app',
    entry: isDev ? 'http://localhost:5002' : 'https://production.btc-shopflow.com.cn',
    container: '#subapp-container',
    activeRule: '/production',
  },
];
```

### 3. 初始化 qiankun

**src/micro-app.ts**:
```typescript
import { registerMicroApps, start } from 'qiankun';
import { microApps } from './config/micro-apps';

export function setupMicroApps() {
  registerMicroApps(
    microApps.map(app => ({
      ...app,
      props: {
        // 传递给子应用的数据
      },
    })),
    {
      beforeLoad: [
        app => {
          console.log('[qiankun] 开始加载', app.name);
          return Promise.resolve();
        },
      ],
      beforeMount: [
        app => {
          console.log('[qiankun] 即将挂载', app.name);
          return Promise.resolve();
        },
      ],
      afterUnmount: [
        app => {
          console.log('[qiankun] 已卸载', app.name);
          return Promise.resolve();
        },
      ],
    }
  );

  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: 'all',
  });
}
```

### 4. 集成到主应用

**src/main.ts**:
```typescript
import { createApp } from 'vue';
import { setupMicroApps } from './micro-app';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
app.mount('#app');

// 启动微前端
setupMicroApps();
```

### 5. 添加子应用容器

**src/App.vue**:
```vue
<template>
  <div id="app">
    <router-view v-if="!isSubApp" />
    <div id="subapp-container" v-show="isSubApp"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isSubApp = computed(() => {
  return route.path.startsWith('/logistics') ||
         route.path.startsWith('/production');
});
</script>
```

## ✅ 验收标准

### 检查 1: qiankun 启动

```bash
pnpm dev

# 控制台输出
# [qiankun] qiankun started
```

### 检查 2: 子应用容器存在

```bash
# 访问 http://localhost:5000
# 检查 DOM
document.getElementById('subapp-container')
// 预期: 存在
```

## 📝 检查清单

- [ ] qiankun 安装成功
- [ ] 微应用配置创建
- [ ] qiankun 初始化
- [ ] 子应用容器添加
- [ ] 生命周期钩子配置
- [ ] 启动成功

## 🔗 下一步

- [18 - 微应用加载器](./18-micro-app-loader.md)

