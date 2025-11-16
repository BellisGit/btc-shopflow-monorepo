# 38.6 - 埋点统计

> **阶段**: Phase 5 | **时间**: 3小时 | **前置**: 38.5

## 🎯 任务目标

实现用户行为埋点和数据统计功能。

## 📋 执行步骤

### 1. 创建埋点 SDK

**packages/shared-core/src/analytics/index.ts**:
```typescript
interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

class Analytics {
  private enabled: boolean = false;
  private queue: EventData[] = [];

  init(options: { enabled?: boolean; endpoint?: string } = {}) {
    this.enabled = options.enabled ?? false;
  }

  // 页面浏览
  pageView(path: string, title?: string) {
    this.track({
      category: 'PageView',
      action: 'view',
      label: path,
      title,
    });
  }

  // 点击事件
  click(element: string, label?: string) {
    this.track({
      category: 'Click',
      action: 'click',
      label: element,
    });
  }

  // 自定义事件
  track(data: EventData) {
    if (!this.enabled) return;

    const event = {
      ...data,
      timestamp: Date.now(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    this.queue.push(event);

    // 批量上报
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  // 立即上报
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('埋点上报失败', error);
    }
  }

  private getUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

export const analytics = new Analytics();
```

### 2. 初始化埋点

**src/main.ts**:
```typescript
import { analytics } from '@btc/shared-core';

analytics.init({
  enabled: import.meta.env.PROD,
  endpoint: '/api/analytics/events',
});

// 页面离开时上报
window.addEventListener('beforeunload', () => {
  analytics.flush();
});
```

### 3. 路由埋点

**src/router/index.ts**:
```typescript
import { analytics } from '@btc/shared-core';

router.afterEach((to) => {
  analytics.pageView(to.path, to.meta?.title as string);
});
```

### 4. 指令式埋点

**创建埋点指令**:
```typescript
// src/directives/track.ts
import type { Directive } from 'vue';
import { analytics } from '@btc/shared-core';

export const vTrack: Directive = {
  mounted(el, binding) {
    const { value } = binding;
    
    el.addEventListener('click', () => {
      analytics.click(value.element, value.label);
    });
  },
};
```

**使用**:
```vue
<template>
  <el-button v-track="{ element: 'export-btn', label: '导出按钮' }">
    导出
  </el-button>
</template>
```

### 5. Composable 埋点

```typescript
// src/composables/use-analytics.ts
import { analytics } from '@btc/shared-core';

export function useAnalytics() {
  const trackClick = (element: string, label?: string) => {
    analytics.click(element, label);
  };

  const trackEvent = (category: string, action: string, data?: any) => {
    analytics.track({ category, action, ...data });
  };

  return {
    trackClick,
    trackEvent,
  };
}
```

**使用**:
```vue
<script setup lang="ts">
const { trackClick, trackEvent } = useAnalytics();

const handleExport = () => {
  trackEvent('Export', 'user-list', { format: 'excel' });
  // 导出逻辑
};
</script>
```

### 6. 业务埋点示例

**登录埋点**:
```typescript
const handleLogin = async () => {
  try {
    await login(form.value);
    analytics.track({
      category: 'Auth',
      action: 'login',
      label: 'success',
    });
  } catch (error) {
    analytics.track({
      category: 'Auth',
      action: 'login',
      label: 'failed',
      error: error.message,
    });
  }
};
```

**CRUD 操作埋点**:
```typescript
const handleAdd = async () => {
  analytics.track({
    category: 'CRUD',
    action: 'create',
    module: 'user',
  });
};

const handleDelete = async (id: number) => {
  analytics.track({
    category: 'CRUD',
    action: 'delete',
    module: 'user',
    id,
  });
};
```

## ✅ 验收标准

### 检查：埋点上报

```bash
# 打开 DevTools Network
# 执行操作（点击、跳转、CRUD）
# 预期: 看到 /api/analytics/events 请求
```

### 检查：数据格式

```json
{
  "events": [
    {
      "category": "PageView",
      "action": "view",
      "label": "/system/user",
      "timestamp": 1704878400000,
      "userId": "user-123",
      "sessionId": "session-xxx"
    }
  ]
}
```

## 📝 检查清单

- [ ] Analytics SDK 创建
- [ ] 初始化配置
- [ ] 路由埋点
- [ ] 指令式埋点
- [ ] Composable 埋点
- [ ] 批量上报
- [ ] 数据脱敏
- [ ] 功能正常

## 🎯 埋点建议

### 核心埋点
- 页面访问（PV/UV）
- 按钮点击
- 表单提交
- 错误发生
- 性能指标

### 数据收集
- 用户ID
- 会话ID
- 时间戳
- 页面路径
- 操作类型

## 🔗 下一步

- [39 - CLI 创建子应用](../phase-6-tooling/39-cli-create-app.md)

