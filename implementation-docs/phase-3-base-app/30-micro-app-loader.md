# 18 - 微应用加载器

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 17

## 🎯 任务目标

实现微应用注册器和加载逻辑，支持动态加载。

## 📋 执行步骤

### 1. 创建全局状态

**src/micro-app.ts** 补充:
```typescript
import { initGlobalState } from 'qiankun';

// 初始化全局状态
export const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: null,
  token: localStorage.getItem('token'),
  permissions: [],
});

// 监听全局状态
onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化', state, prev);
  
  if (state.token) {
    localStorage.setItem('token', state.token);
  }
});
```

### 2. 传递状态到子应用

**src/micro-app.ts**:
```typescript
registerMicroApps(
  microApps.map(app => ({
    ...app,
    props: {
      globalState: { onGlobalStateChange, setGlobalState },
      routerBase: app.activeRule,
      // 其他共享数据
    },
  })),
  // ...
);
```

### 3. 更新全局状态方法

**src/utils/global-state.ts**:
```typescript
import { setGlobalState } from '../micro-app';

export function updateUserInfo(user: any, token: string) {
  setGlobalState({
    user,
    token,
  });
}

export function updatePermissions(permissions: string[]) {
  setGlobalState({
    permissions,
  });
}
```

## ✅ 验收标准

### 检查：全局状态

```typescript
import { updateUserInfo } from './utils/global-state';

// 设置用户信息
updateUserInfo(
  { id: 1, name: '张三' },
  'token-xxx'
);

// 预期: localStorage 中有 token
// 预期: 子应用能接收到状态
```

## 📝 检查清单

- [ ] 全局状态初始化
- [ ] 状态监听配置
- [ ] 状态更新方法
- [ ] 传递给子应用
- [ ] localStorage 同步

## 🔗 下一步

- [19 - 全局状态管理](./19-global-state.md)

