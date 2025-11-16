# 38.5 - 错误监控（Sentry）

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 38

## 🎯 任务目标

集成 Sentry 实现前端错误监控和上报。

## 📋 执行步骤

### 1. 安装 Sentry

```bash
cd packages/main-app
pnpm add @sentry/vue
```

### 2. 初始化 Sentry

**src/utils/sentry.ts**:
```typescript
import * as Sentry from '@sentry/vue';
import type { App } from 'vue';
import type { Router } from 'vue-router';

export function setupSentry(app: App, router: Router) {
  if (import.meta.env.PROD) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
        new Sentry.Replay(),
      ],

      // 性能监控采样率
      tracesSampleRate: 1.0,
      
      // Session Replay 采样率
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // 环境
      environment: import.meta.env.MODE,

      // 版本
      release: `btc-shopflow-app@${import.meta.env.VITE_APP_VERSION}`,

      // 忽略的错误
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],

      // 数据脱敏
      beforeSend(event, hint) {
        // 移除敏感信息
        if (event.request) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
}
```

### 3. 集成到应用

**src/main.ts**:
```typescript
import { setupSentry } from './utils/sentry';

const app = createApp(App);
const router = createRouter({ /* ... */ });

// 初始化 Sentry
setupSentry(app, router);

app.use(router);
app.mount('#app');
```

### 4. 添加用户上下文

```typescript
import * as Sentry from '@sentry/vue';
import { useUserStore } from '@/store';

// 登录后设置用户信息
const userStore = useUserStore();

Sentry.setUser({
  id: userStore.userInfo.id,
  username: userStore.userInfo.username,
  email: userStore.userInfo.email,
});

// 退出时清除
Sentry.setUser(null);
```

### 5. 手动上报

```typescript
import * as Sentry from '@sentry/vue';

// 捕获异常
try {
  // 业务代码
} catch (error) {
  Sentry.captureException(error);
}

// 捕获消息
Sentry.captureMessage('Something went wrong', 'error');

// 添加面包屑
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

### 6. 环境变量配置

**.env.production**:
```bash
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_APP_VERSION=1.0.0
```

## ✅ 验收标准

### 检查 1: 错误上报

```typescript
// 触发一个错误
throw new Error('Test error for Sentry');

// 访问 Sentry 控制台
// 预期: 能看到错误记录
```

### 检查 2: 性能监控

```bash
# 访问应用，执行操作
# 在 Sentry Performance 中查看
# 预期: 能看到性能追踪数据
```

### 检查 3: Session Replay

```bash
# 触发错误
# 在 Sentry 中查看 Session Replay
# 预期: 能看到用户操作回放
```

## 📝 检查清单

- [ ] Sentry 安装
- [ ] SDK 初始化
- [ ] 路由集成
- [ ] 用户上下文
- [ ] 手动上报
- [ ] 环境变量配置
- [ ] 错误上报成功
- [ ] 性能监控生效
- [ ] Session Replay 可用

## 🎯 Sentry 配置建议

### 采样率配置
```typescript
// 开发环境：不上报
// 测试环境：100% 上报
// 生产环境：根据流量调整

tracesSampleRate: import.meta.env.DEV ? 0 : 0.1,
replaysSessionSampleRate: import.meta.env.DEV ? 0 : 0.01,
```

### 错误过滤
```typescript
ignoreErrors: [
  // 浏览器扩展错误
  /^chrome-extension/,
  /^moz-extension/,
  // 网络错误
  'Network Error',
  'NetworkError',
  // 第三方脚本错误
  /script error/i,
],
```

## 🔗 下一步

- [39 - CLI 创建子应用](../phase-6-tooling/39-cli-create-app.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

