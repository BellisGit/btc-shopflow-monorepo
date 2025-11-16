# 18.5 - qiankun 生命周期钩子增强

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 17, 17.5

## 🎯 任务目标

完善 qiankun 生命周期钩子，实现加载动画、权限检查、性能监控等功能。

## 📋 执行步骤

### 1. 创建生命周期管理器

**src/utils/lifecycle-manager.ts**:
```typescript
import { LoadableApp } from 'qiankun';
import { ElLoading } from 'element-plus';
import { useUserStore } from '../store/user';
import { reportPerformance } from './performance';

// 加载状态管理
const loadingInstances = new Map<string, any>();
const performanceMarks = new Map<string, number>();

/**
 * 应用开始加载前
 */
export async function beforeLoad(app: LoadableApp<any>): Promise<void> {
  console.log(`[生命周期] ${app.name} - beforeLoad`);

  // 🔥 记录性能指标
  performanceMarks.set(`${app.name}-load-start`, Date.now());

  // 🔥 权限检查
  const userStore = useUserStore();
  const appConfig = getAppConfig(app.name);

  if (appConfig?.permissions) {
    const hasPermission = appConfig.permissions.some((p: string) =>
      userStore.permissions.includes(p)
    );

    if (!hasPermission) {
      throw new Error(`没有权限访问 ${app.name}`);
    }
  }

  // 🔥 显示加载动画
  const loading = ElLoading.service({
    lock: true,
    text: `正在加载 ${getAppDisplayName(app.name)}...`,
    background: 'rgba(0, 0, 0, 0.7)',
  });

  loadingInstances.set(app.name, loading);

  return Promise.resolve();
}

/**
 * 应用即将挂载前
 */
export async function beforeMount(app: LoadableApp<any>): Promise<void> {
  console.log(`[生命周期] ${app.name} - beforeMount`);

  // 🔥 隐藏加载动画
  const loading = loadingInstances.get(app.name);
  if (loading) {
    loading.close();
    loadingInstances.delete(app.name);
  }

  // 记录加载完成时间
  const startTime = performanceMarks.get(`${app.name}-load-start`);
  if (startTime) {
    const loadTime = Date.now() - startTime;
    console.log(`[性能] ${app.name} 加载耗时: ${loadTime}ms`);

    // 🔥 上报性能数据
    reportPerformance({
      appName: app.name,
      metric: 'load-time',
      value: loadTime,
      timestamp: Date.now(),
    });
  }

  return Promise.resolve();
}

/**
 * 应用挂载后
 */
export async function afterMount(app: LoadableApp<any>): Promise<void> {
  console.log(`[生命周期] ${app.name} - afterMount`);

  // 记录挂载完成时间
  const startTime = performanceMarks.get(`${app.name}-load-start`);
  if (startTime) {
    const totalTime = Date.now() - startTime;
    console.log(`[性能] ${app.name} 总耗时: ${totalTime}ms`);

    performanceMarks.delete(`${app.name}-load-start`);
  }

  // 🔥 触发自定义事件
  window.dispatchEvent(
    new CustomEvent('micro-app-mounted', {
      detail: { appName: app.name },
    })
  );

  return Promise.resolve();
}

/**
 * 应用卸载后
 */
export async function afterUnmount(app: LoadableApp<any>): Promise<void> {
  console.log(`[生命周期] ${app.name} - afterUnmount`);

  // 清理资源
  loadingInstances.delete(app.name);
  performanceMarks.delete(`${app.name}-load-start`);

  // 🔥 触发自定义事件
  window.dispatchEvent(
    new CustomEvent('micro-app-unmounted', {
      detail: { appName: app.name },
    })
  );

  // 🔥 可选：清理子应用缓存数据
  cleanupAppCache(app.name);

  return Promise.resolve();
}

// 工具函数
function getAppConfig(appName: string) {
  // 从配置文件获取应用配置
  return null;
}

function getAppDisplayName(appName: string): string {
  const displayNames: Record<string, string> = {
    'logistics-app': '物流应用',
    'production-app': '生产应用',
  };
  return displayNames[appName] || appName;
}

function cleanupAppCache(appName: string): void {
  // 清理子应用相关的缓存数据
  const cacheKeys = Object.keys(localStorage).filter(key =>
    key.startsWith(`${appName}-`)
  );

  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}
```

### 2. 实现性能监控

**src/utils/performance.ts**:
```typescript
interface PerformanceData {
  appName: string;
  metric: string;
  value: number;
  timestamp: number;
}

/**
 * 上报性能数据
 */
export function reportPerformance(data: PerformanceData): void {
  // 开发环境只打印
  if (import.meta.env.DEV) {
    console.log('[性能监控]:', data);
    return;
  }

  // 生产环境上报
  try {
    fetch('/api/performance/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(err => {
      console.error('性能上报失败:', err);
    });
  } catch (err) {
    console.error('性能上报异常:', err);
  }
}
```

### 3. 在主应用中使用生命周期钩子

**src/micro-app.ts**:
```typescript
import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun';
import { microApps } from './config/micro-apps';
import { globalState } from './utils/global-state';
import {
  beforeLoad,
  beforeMount,
  afterMount,
  afterUnmount,
} from './utils/lifecycle-manager';

export function setupMicroApps() {
  registerMicroApps(
    microApps.map(app => ({
      ...app,
      props: {
        globalState,
        routerBase: app.activeRule,
      },
    })),
    {
      // 🔥 使用增强的生命周期钩子
      beforeLoad: [beforeLoad],
      beforeMount: [beforeMount],
      afterMount: [afterMount],
      afterUnmount: [afterUnmount],
    }
  );

  // 全局错误处理
  addGlobalUncaughtErrorHandler((event) => {
    console.error('[qiankun] 全局错误:', event);
  });

  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: 'all',
    singular: false,
  });
}
```

### 4. 监听子应用事件

**src/composables/use-micro-app-events.ts**:
```typescript
import { onMounted, onUnmounted } from 'vue';

export function useMicroAppEvents() {
  const handleAppMounted = (event: CustomEvent) => {
    const { appName } = event.detail;
    console.log(`[主应用] 子应用 ${appName} 已挂载`);

    // 可以在这里做一些操作，比如更新菜单状态
  };

  const handleAppUnmounted = (event: CustomEvent) => {
    const { appName } = event.detail;
    console.log(`[主应用] 子应用 ${appName} 已卸载`);
  };

  onMounted(() => {
    window.addEventListener('micro-app-mounted', handleAppMounted as EventListener);
    window.addEventListener('micro-app-unmounted', handleAppUnmounted as EventListener);
  });

  onUnmounted(() => {
    window.removeEventListener('micro-app-mounted', handleAppMounted as EventListener);
    window.removeEventListener('micro-app-unmounted', handleAppUnmounted as EventListener);
  });

  return {
    // 可以导出一些方法
  };
}
```

## ✅ 验收标准

### 检查 1: 加载动画显示

```bash
# 1. 访问子应用
# 预期: 显示"正在加载物流应用..."的 Loading 动画

# 2. 加载完成后
# 预期: Loading 自动关闭
```

### 检查 2: 权限检查

```bash
# 1. 移除用户权限
userStore.permissions = []

# 2. 访问需要权限的子应用
# 预期: 提示"没有权限访问"并阻止加载
```

### 检查 3: 性能监控

```bash
# 1. 查看控制台日志
# 预期: 打印加载耗时和总耗时

# 2. 检查性能数据上报
# 预期: 数据已发送到 /api/performance/report
```

### 检查 4: 自定义事件

```bash
# 1. 在主应用监听事件
window.addEventListener('micro-app-mounted', (e) => {
  console.log('子应用挂载:', e.detail.appName)
})

# 2. 切换子应用
# 预期: 触发事件并打印日志
```

## 📝 检查清单

- [ ] 生命周期管理器创建
- [ ] beforeLoad 钩子实现
- [ ] beforeMount 钩子实现
- [ ] afterMount 钩子实现
- [ ] afterUnmount 钩子实现
- [ ] 加载动画显示和隐藏
- [ ] 权限检查
- [ ] 性能监控
- [ ] 自定义事件触发
- [ ] 资源清理

## 🚨 常见问题

**Q: 加载动画不显示？**
A: 检查 Element Plus Loading 是否正确引入

**Q: 权限检查不生效？**
A: 确保在 beforeLoad 中检查权限，并正确抛出错误

**Q: 性能数据不准确？**
A: 使用 Performance API 而不是 Date.now()，更精确

## 💡 最佳实践

1. **性能监控**
   - 记录加载时间
   - 记录首屏渲染时间
   - 分析性能瓶颈

2. **资源管理**
   - 及时清理缓存
   - 取消未完成的请求
   - 清理定时器和监听器

3. **用户体验**
   - 提供加载反馈
   - 优化加载动画
   - 合理的超时处理

## 🔗 下一步

- [08.5 - 虚拟模块注入](../../phase-2-core-features/08.5-vite-plugin-virtual-module.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时
