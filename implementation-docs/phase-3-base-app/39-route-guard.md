# 23 - 路由守卫

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 22

## 🎯 任务目标

实现路由守卫，拦截未登录访问。

## 📋 执行步骤

### 1. 创建路由守卫

**src/router/guard.ts**:
```typescript
import type { Router } from 'vue-router';
import { useUserStore } from '@/store';

const whiteList = ['/login'];

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    if (userStore.token) {
      // 已登录
      if (to.path === '/login') {
        next('/dashboard');
      } else {
        next();
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        next();
      } else {
        next('/login');
      }
    }
  });
}
```

### 2. 应用守卫

**src/router/index.ts**:
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { setupRouterGuard } from './guard';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuard(router);

export default router;
```

## ✅ 验收标准

### 检查 1: 未登录拦截

```bash
# 清除 localStorage 中的 token
# 访问 http://localhost:5000/dashboard
# 预期: 自动跳转到 /login
```

### 检查 2: 已登录跳转

```bash
# 登录后访问 /login
# 预期: 自动跳转到 /dashboard
```

## 📝 检查清单

- [ ] 路由守卫创建
- [ ] 登录状态判断
- [ ] 未登录拦截
- [ ] 白名单配置
- [ ] 守卫应用
- [ ] 功能正常

## 🔗 下一步

- [24 - 系统管理-用户模块](./24-system-user-crud.md)

