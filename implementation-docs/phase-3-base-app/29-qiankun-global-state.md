# 17.5 - qiankun 全局状态通信

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 17, 19

## 🎯 任务目标

实现 qiankun 全局状态管理，实现主应用与子应用的状态同步。

## 📋 执行步骤

### 1. 创建全局状态工具

**src/utils/global-state.ts**:
```typescript
import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 定义全局状态类型
export interface GlobalState {
  user: {
    id: number;
    name: string;
    avatar?: string;
  } | null;
  token: string;
  permissions: string[];
  theme: {
    primaryColor: string;
    mode: 'light' | 'dark';
  };
}

// 初始化全局状态
const initialState: GlobalState = {
  user: null,
  token: localStorage.getItem('token') || '',
  permissions: [],
  theme: {
    primaryColor: '#409EFF',
    mode: 'light',
  },
};

// 初始化 qiankun 全局状态
const actions: MicroAppStateActions = initGlobalState(initialState);

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 全局状态变化:', state);
  console.log('[主应用] 上一个状态:', prev);

  // 同步到本地存储
  if (state.token) {
    localStorage.setItem('token', state.token);
  } else {
    localStorage.removeItem('token');
  }

  // 同步权限到本地存储
  if (state.permissions) {
    localStorage.setItem('permissions', JSON.stringify(state.permissions));
  }
});

// 导出状态操作方法
export const globalState = actions;

// 更新用户信息
export function updateUserInfo(user: GlobalState['user'], token: string) {
  actions.setGlobalState({
    user,
    token,
  });
}

// 更新权限
export function updatePermissions(permissions: string[]) {
  actions.setGlobalState({
    permissions,
  });
}

// 更新主题
export function updateTheme(theme: GlobalState['theme']) {
  actions.setGlobalState({
    theme,
  });
}

// 清空状态（退出登录）
export function clearGlobalState() {
  actions.setGlobalState({
    user: null,
    token: '',
    permissions: [],
  });
}
```

### 2. 在主应用注册微应用时传递全局状态

**src/micro-app.ts**:
```typescript
import { registerMicroApps, start } from 'qiankun';
import { microApps } from './config/micro-apps';
import { globalState } from './utils/global-state';

export function setupMicroApps() {
  registerMicroApps(
    microApps.map(app => ({
      ...app,
      props: {
        // 🔥 传递全局状态给子应用
        globalState: {
          onGlobalStateChange: globalState.onGlobalStateChange,
          setGlobalState: globalState.setGlobalState,
          getGlobalState: () => globalState.getGlobalState(),
        },
        // 传递其他配置
        routerBase: app.activeRule,
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

### 3. 在 Pinia Store 中同步全局状态

**src/store/user.ts**:
```typescript
import { defineStore } from 'pinia';
import { updateUserInfo, updatePermissions, clearGlobalState } from '../utils/global-state';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as any,
    token: localStorage.getItem('token') || '',
    permissions: [] as string[],
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasUser: (state) => !!state.userInfo,
  },

  actions: {
    // 登录成功后设置用户信息
    setUserInfo(user: any, token: string, permissions: string[] = []) {
      this.userInfo = user;
      this.token = token;
      this.permissions = permissions;

      // 🔥 同步到 qiankun 全局状态
      updateUserInfo(user, token);
      updatePermissions(permissions);

      // 本地存储
      localStorage.setItem('token', token);
      localStorage.setItem('permissions', JSON.stringify(permissions));
    },

    // 更新权限
    setPermissions(permissions: string[]) {
      this.permissions = permissions;

      // 🔥 同步到全局状态
      updatePermissions(permissions);

      localStorage.setItem('permissions', JSON.stringify(permissions));
    },

    // 退出登录
    logout() {
      this.userInfo = null;
      this.token = '';
      this.permissions = [];

      // 🔥 清空全局状态
      clearGlobalState();

      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
    },
  },
});
```

### 4. 在子应用中接收全局状态

**packages/logistics-app/src/main.ts**:
```typescript
import './public-path';
import { createApp, App as VueApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import AppComponent from './App.vue';
import routes from './router/routes';
import { useUserStore } from './store/user';

let app: VueApp | null = null;
let router: any = null;

function render(props: any = {}) {
  const { container, routerBase, globalState } = props;

  router = createRouter({
    history: createWebHistory(routerBase || '/logistics'),
    routes,
  });

  app = createApp(AppComponent);
  app.use(router);

  // 🔥 监听全局状态变化
  if (globalState) {
    // 获取初始状态
    const state = globalState.getGlobalState();
    console.log('[logistics-app] 初始全局状态:', state);

    // 同步到子应用 store
    if (state.user && state.token) {
      const userStore = useUserStore();
      userStore.setUserInfo(state.user, state.token, state.permissions);
    }

    // 监听状态变化
    globalState.onGlobalStateChange((newState: any, prev: any) => {
      console.log('[logistics-app] 全局状态变化:', newState);

      const userStore = useUserStore();

      // 用户信息更新
      if (newState.user !== prev.user || newState.token !== prev.token) {
        if (newState.user && newState.token) {
          userStore.setUserInfo(newState.user, newState.token, newState.permissions);
        } else {
          // 退出登录
          userStore.logout();
          router.push('/login');
        }
      }

      // 权限更新
      if (newState.permissions !== prev.permissions) {
        userStore.setPermissions(newState.permissions);
      }

      // 主题更新
      if (newState.theme !== prev.theme) {
        // 更新子应用主题
        document.documentElement.style.setProperty(
          '--el-color-primary',
          newState.theme.primaryColor
        );
      }
    });

    // 🔥 子应用也可以修改全局状态
    (window as any).__QIANKUN_GLOBAL_STATE__ = globalState;
  }

  const containerEl = container
    ? container.querySelector('#logistics-app-root')
    : document.getElementById('logistics-app-root');

  app.mount(containerEl);
}

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期
export async function bootstrap() {
  console.log('[logistics-app] 启动');
}

export async function mount(props: any) {
  console.log('[logistics-app] 挂载', props);
  render(props);
}

export async function unmount() {
  console.log('[logistics-app] 卸载');
  app?.unmount();
  app = null;
  router = null;
}

export async function update(props: any) {
  console.log('[logistics-app] 更新', props);
}
```

### 5. 子应用中修改全局状态

**packages/logistics-app/src/composables/use-global-state.ts**:
```typescript
import { onUnmounted } from 'vue';

export function useGlobalState() {
  const globalState = (window as any).__QIANKUN_GLOBAL_STATE__;

  // 设置全局状态
  const setGlobalState = (state: any) => {
    if (globalState) {
      globalState.setGlobalState(state);
    } else {
      console.warn('[logistics-app] 全局状态不可用');
    }
  };

  // 监听全局状态
  const onStateChange = (callback: (state: any, prev: any) => void) => {
    if (globalState) {
      globalState.onGlobalStateChange(callback);
    }
  };

  // 获取当前状态
  const getState = () => {
    if (globalState) {
      return globalState.getGlobalState();
    }
    return null;
  };

  // 组件卸载时取消监听
  onUnmounted(() => {
    if (globalState && globalState.offGlobalStateChange) {
      globalState.offGlobalStateChange();
    }
  });

  return {
    setGlobalState,
    onStateChange,
    getState,
  };
}
```

### 6. 使用示例

**子应用中使用全局状态**:
```vue
<template>
  <div>
    <div v-if="user">欢迎, {{ user.name }}</div>
    <el-button @click="handleUpdateTheme">切换主题</el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalState } from '@/composables/use-global-state';

const { setGlobalState, getState } = useGlobalState();

const user = computed(() => {
  const state = getState();
  return state?.user;
});

const handleUpdateTheme = () => {
  const currentState = getState();
  const newMode = currentState.theme.mode === 'light' ? 'dark' : 'light';

  // 🔥 子应用修改全局状态，主应用和其他子应用都会收到通知
  setGlobalState({
    theme: {
      ...currentState.theme,
      mode: newMode,
    },
  });
};
</script>
```

## ✅ 验收标准

### 检查 1: 主应用登录后状态同步

```bash
# 1. 启动主应用和子应用
pnpm dev:all

# 2. 在主应用登录
# 3. 切换到子应用
# 预期: 子应用自动获取用户信息，无需重新登录

# 4. 在主应用退出
# 预期: 子应用自动退出到登录页
```

### 检查 2: 状态双向同步

```bash
# 1. 在子应用中修改主题
# 预期: 主应用和其他子应用主题同步更新

# 2. 检查控制台日志
# 预期: 所有应用都收到状态变化通知
```

### 检查 3: 状态持久化

```bash
# 1. 刷新页面
# 预期: 用户状态保持，token 仍然有效

# 2. 检查 localStorage
localStorage.getItem('token')
localStorage.getItem('permissions')
# 预期: 数据存在
```

## 📝 检查清单

- [ ] 全局状态工具创建
- [ ] initGlobalState 初始化
- [ ] 主应用传递 globalState 给子应用
- [ ] Pinia Store 同步全局状态
- [ ] 子应用监听状态变化
- [ ] 子应用可修改全局状态
- [ ] 状态持久化到 localStorage
- [ ] 登录状态同步正常
- [ ] 退出登录同步正常
- [ ] 主题切换同步正常

## 🚨 常见问题

**Q: 子应用获取不到 globalState？**
A: 检查主应用是否通过 props 正确传递，子应用 mount 生命周期是否接收 props

**Q: 状态更新不及时？**
A: 确保使用 `setGlobalState` 修改状态，直接修改无效

**Q: 页面刷新后状态丢失？**
A: 在 `onGlobalStateChange` 中同步到 localStorage，页面初始化时从 localStorage 恢复

**Q: 多个子应用同时修改状态冲突？**
A: 建议只让主应用修改关键状态（如用户信息），子应用只修改自己的配置

## 💡 最佳实践

1. **状态分层管理**
   - 全局共享状态：用户信息、权限、主题
   - 应用本地状态：使用 Pinia 管理
   - 临时状态：使用 Vue 响应式数据

2. **状态修改权限**
   - 主应用：负责用户、权限等核心状态
   - 子应用：只修改自己相关的配置

3. **性能优化**
   - 避免频繁修改全局状态
   - 使用防抖/节流处理高频操作

## 🔗 下一步

- [18.5 - qiankun 生命周期钩子增强](./18.5-qiankun-lifecycle-hooks.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时
