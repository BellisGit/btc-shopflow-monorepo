# 20.5 - 全局错误处理和降级

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 17, 19.5

## 🎯 任务目标

实现微前端全局错误处理、子应用加载失败降级方案和错误监控。

## 📋 执行步骤

### 1. 配置 qiankun 全局错误处理

**src/micro-app.ts**:
```typescript
import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun';
import { ElMessage } from 'element-plus';
import { microApps } from './config/micro-apps';
import { reportError } from './utils/error-report';

export function setupMicroApps() {
  registerMicroApps(
    microApps.map(app => ({
      ...app,
      props: {
        // ... 其他配置
      },
    })),
    {
      beforeLoad: [
        async app => {
          console.log('[qiankun] 开始加载', app.name);
          // 🔥 显示加载状态
          showLoading(`正在加载${app.name}...`);
          return Promise.resolve();
        },
      ],
      beforeMount: [
        async app => {
          console.log('[qiankun] 即将挂载', app.name);
          hideLoading();
          return Promise.resolve();
        },
      ],
      afterMount: [
        async app => {
          console.log('[qiankun] 已挂载', app.name);
          return Promise.resolve();
        },
      ],
      afterUnmount: [
        async app => {
          console.log('[qiankun] 已卸载', app.name);
          return Promise.resolve();
        },
      ],
    }
  );

  // 🔥 全局错误捕获
  addGlobalUncaughtErrorHandler((event: Event | string) => {
    console.error('[qiankun] 全局错误:', event);

    let errorMessage = '子应用运行出错';

    if (event instanceof Error) {
      errorMessage = event.message;
    } else if (typeof event === 'string') {
      errorMessage = event;
    } else if (event instanceof Event) {
      errorMessage = event.type;
    }

    // 显示错误提示
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
    });

    // 🔥 上报错误
    reportError({
      type: 'qiankun-global-error',
      message: errorMessage,
      stack: event instanceof Error ? event.stack : '',
      timestamp: Date.now(),
    });
  });

  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: 'all',
    singular: false,
  });
}

// Loading 状态管理
let loadingInstance: any = null;

function showLoading(text: string) {
  // 使用 Element Plus Loading
  loadingInstance = ElLoading.service({
    lock: true,
    text,
    background: 'rgba(0, 0, 0, 0.7)',
  });
}

function hideLoading() {
  loadingInstance?.close();
}
```

### 2. 实现子应用加载失败降级

**src/utils/micro-app-error.ts**:
```typescript
import { ElMessageBox } from 'element-plus';

// 子应用加载失败记录
const failedApps = new Set<string>();

// 重试次数限制
const MAX_RETRY = 3;
const retryCount = new Map<string, number>();

/**
 * 处理子应用加载失败
 */
export async function handleAppLoadError(
  appName: string,
  error: Error
): Promise<void> {
  console.error(`[${appName}] 加载失败:`, error);

  // 记录失败
  failedApps.add(appName);

  // 获取重试次数
  const count = retryCount.get(appName) || 0;

  // 🔥 错误类型判断
  if (error.message.includes('timeout')) {
    // 超时错误
    if (count < MAX_RETRY) {
      retryCount.set(appName, count + 1);
      return retry(appName);
    } else {
      return showErrorFallback(appName, '加载超时，请检查网络');
    }
  } else if (error.message.includes('404')) {
    // 资源不存在
    return showErrorFallback(appName, '应用不存在，请联系管理员');
  } else if (error.message.includes('CORS')) {
    // 跨域错误
    return showErrorFallback(appName, '跨域错误，请检查配置');
  } else {
    // 其他错误
    return showErrorFallback(appName, '应用加载失败');
  }
}

/**
 * 重试加载
 */
async function retry(appName: string): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `${appName} 加载失败，是否重试？`,
      '提示',
      {
        confirmButtonText: '重试',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 刷新页面重新加载
    window.location.reload();
  } catch {
    // 用户取消，显示降级页面
    showErrorFallback(appName, '加载失败');
  }
}

/**
 * 显示降级页面
 */
function showErrorFallback(appName: string, message: string): void {
  const container = document.getElementById('subapp-container');
  if (!container) return;

  container.innerHTML = `
    <div class="app-error-fallback">
      <div class="error-icon">⚠️</div>
      <h2>应用加载失败</h2>
      <p>${message}</p>
      <div class="error-actions">
        <button class="btn-primary" onclick="location.reload()">
          刷新页面
        </button>
        <button class="btn-default" onclick="history.back()">
          返回
        </button>
      </div>
    </div>
  `;
}

/**
 * 检查应用是否加载失败
 */
export function isAppFailed(appName: string): boolean {
  return failedApps.has(appName);
}

/**
 * 清除失败记录
 */
export function clearFailedApps(): void {
  failedApps.clear();
  retryCount.clear();
}
```

### 3. 创建降级页面样式

**src/styles/error-fallback.scss**:
```scss
.app-error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;

  .error-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #909399;
    margin-bottom: 30px;
  }

  .error-actions {
    display: flex;
    gap: 12px;

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;

      &.btn-primary {
        background: #409EFF;
        color: #fff;

        &:hover {
          background: #66b1ff;
        }
      }

      &.btn-default {
        background: #fff;
        color: #606266;
        border: 1px solid #dcdfe6;

        &:hover {
          background: #f5f7fa;
        }
      }
    }
  }
}
```

### 4. 在主应用注册错误处理

**src/main.ts**:
```typescript
import { createApp } from 'vue';
import { setupMicroApps } from './micro-app';
import { setupErrorHandler } from './utils/error-handler';
import App from './App.vue';
import router from './router';
import './styles/error-fallback.scss';

const app = createApp(App);

// 🔥 设置 Vue 全局错误处理
setupErrorHandler(app);

app.use(router);
app.mount('#app');

// 启动微前端
setupMicroApps();
```

### 5. 创建 Vue 错误处理器

**src/utils/error-handler.ts**:
```typescript
import { App } from 'vue';
import { ElMessage } from 'element-plus';
import { reportError } from './error-report';

/**
 * 设置全局错误处理
 */
export function setupErrorHandler(app: App): void {
  // 🔥 Vue 错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue Error]:', err);
    console.error('[Vue Error Info]:', info);

    ElMessage.error({
      message: '页面出现错误，请刷新重试',
      duration: 3000,
    });

    // 上报错误
    reportError({
      type: 'vue-error',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : '',
      info,
      timestamp: Date.now(),
    });
  };

  // 🔥 Vue 警告处理
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('[Vue Warn]:', msg);
    console.warn('[Vue Warn Trace]:', trace);
  };

  // 🔥 Promise 未捕获错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise]:', event.reason);

    ElMessage.error({
      message: '请求失败，请稍后重试',
      duration: 3000,
    });

    reportError({
      type: 'promise-rejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      timestamp: Date.now(),
    });
  });

  // 🔥 全局 JS 错误
  window.addEventListener('error', (event) => {
    // 资源加载错误
    if (event.target !== window) {
      console.error('[Resource Error]:', event.target);

      reportError({
        type: 'resource-error',
        message: `资源加载失败: ${(event.target as any).src || (event.target as any).href}`,
        timestamp: Date.now(),
      });
    } else {
      // JS 运行时错误
      console.error('[JS Error]:', event.error);

      reportError({
        type: 'js-error',
        message: event.message,
        stack: event.error?.stack || '',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
      });
    }
  });
}
```

### 6. 实现错误上报

**src/utils/error-report.ts**:
```typescript
interface ErrorInfo {
  type: string;
  message: string;
  stack?: string;
  timestamp: number;
  [key: string]: any;
}

/**
 * 上报错误到服务器
 */
export function reportError(error: ErrorInfo): void {
  // 开发环境只打印
  if (import.meta.env.DEV) {
    console.log('[Error Report]:', error);
    return;
  }

  // 生产环境上报
  try {
    // 添加环境信息
    const errorData = {
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      platform: navigator.platform,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };

    // 🔥 使用 sendBeacon 上报（页面卸载时也能发送）
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(errorData)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/error/report', blob);
    } else {
      // 降级方案：使用 fetch
      fetch('/api/error/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
        keepalive: true,
      }).catch(err => {
        console.error('错误上报失败:', err);
      });
    }
  } catch (err) {
    console.error('错误上报异常:', err);
  }
}
```

### 7. 子应用错误边界（可选）

**packages/logistics-app/src/components/ErrorBoundary.vue**:
```vue
<template>
  <div v-if="hasError" class="error-boundary">
    <h3>组件加载失败</h3>
    <p>{{ error?.message }}</p>
    <el-button @click="reload">重新加载</el-button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  hasError.value = true;
  error.value = err;
  console.error('[Error Boundary]:', err);

  // 阻止错误继续传播
  return false;
});

const reload = () => {
  hasError.value = false;
  error.value = null;
};
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  text-align: center;
  background: #fff3f3;
  border: 1px solid #f56c6c;
  border-radius: 4px;
}
</style>
```

## ✅ 验收标准

### 检查 1: qiankun 错误捕获

```bash
# 1. 故意配置错误的子应用 URL
entry: 'http://localhost:9999'

# 2. 尝试加载子应用
# 预期: 显示错误提示和降级页面

# 3. 检查控制台
# 预期: 打印错误日志并上报
```

### 检查 2: 子应用加载超时

```bash
# 1. 模拟网络慢速（Chrome DevTools Network throttling）
# 2. 加载子应用
# 预期: 显示加载状态，超时后提示重试

# 3. 点击重试
# 预期: 重新加载
```

### 检查 3: Vue 错误捕获

```bash
# 1. 在组件中抛出错误
throw new Error('Test error')

# 2. 预期: 显示错误提示，但不影响其他页面

# 3. 检查错误上报
# 预期: 错误信息已上报到服务器
```

### 检查 4: Promise 错误捕获

```bash
# 1. 发起一个失败的请求
fetch('/api/test').then(res => res.json())

# 2. 预期: 显示"请求失败"提示

# 3. 检查错误上报
# 预期: Promise rejection 已上报
```

## 📝 检查清单

- [ ] qiankun 全局错误处理配置
- [ ] 子应用加载失败降级
- [ ] 降级页面样式
- [ ] Vue 错误处理器
- [ ] Promise 错误捕获
- [ ] 资源加载错误捕获
- [ ] 错误上报功能
- [ ] Loading 状态管理
- [ ] 错误边界组件（可选）
- [ ] 错误日志打印正常
- [ ] 错误上报正常

## 🚨 常见问题

**Q: 错误上报失败？**
A: 检查后端接口 `/api/error/report` 是否可用，或使用第三方服务（如 Sentry）

**Q: 降级页面不显示？**
A: 确保 `#subapp-container` 存在，并检查 CSS 样式是否加载

**Q: Promise 错误无法捕获？**
A: 确保在最外层添加了 `unhandledrejection` 监听器

**Q: 错误处理影响性能？**
A: 使用 `sendBeacon` 异步上报，不会阻塞主线程

## 💡 最佳实践

1. **分级错误处理**
   - 严重错误：显示降级页面
   - 一般错误：提示用户
   - 轻微错误：只记录日志

2. **错误上报策略**
   - 相同错误去重
   - 限制上报频率
   - 采样上报

3. **降级方案**
   - 提供重试功能
   - 提供返回入口
   - 友好的错误提示

4. **监控告警**
   - 接入 Sentry 等监控服务
   - 设置错误率告警
   - 定期分析错误日志

## 🔗 下一步

- [18.5 - qiankun 生命周期钩子增强](./18.5-qiankun-lifecycle-hooks.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时
