# 19 - 全局状态管理

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 18

## 🎯 任务目标

使用 Pinia 管理主应用全局状态。

## 📋 执行步骤

### 1. 安装 Pinia

```bash
cd packages/main-app
pnpm add pinia
```

### 2. 创建用户 Store

**src/store/user.ts**:
```typescript
import { defineStore } from 'pinia';
import { updateUserInfo as updateGlobalState } from '../utils/global-state';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as any,
    token: localStorage.getItem('token') || '',
    permissions: [] as string[],
  }),

  actions: {
    setUserInfo(user: any, token: string) {
      this.userInfo = user;
      this.token = token;
      localStorage.setItem('token', token);
      
      // 同步到全局状态（qiankun）
      updateGlobalState(user, token);
    },

    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },

    logout() {
      this.userInfo = null;
      this.token = '';
      this.permissions = [];
      localStorage.removeItem('token');
    },
  },
});
```

### 3. 创建应用 Store

**src/store/app.ts**:
```typescript
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    menuCollapse: false,
    theme: 'light' as 'light' | 'dark',
  }),

  actions: {
    toggleMenu() {
      this.menuCollapse = !this.menuCollapse;
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
    },
  },
});
```

### 4. 导出 Store

**src/store/index.ts**:
```typescript
export { useUserStore } from './user';
export { useAppStore } from './app';
```

### 5. 挂载到应用

**src/main.ts**:
```typescript
import { createPinia } from 'pinia';

const pinia = createPinia();
app.use(pinia);
```

## ✅ 验收标准

### 检查：Store 使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/store';

const userStore = useUserStore();

userStore.setUserInfo(
  { id: 1, name: '张三' },
  'token-xxx'
);

console.log(userStore.userInfo); // 用户信息
console.log(userStore.token); // token
</script>
```

## 📝 检查清单

- [ ] Pinia 安装
- [ ] 用户 Store 创建
- [ ] 应用 Store 创建
- [ ] Store 导出
- [ ] 挂载到应用
- [ ] 状态管理正常

## 🔗 下一步

- [20 - 布局-头部组件](./20-layout-header.md)

