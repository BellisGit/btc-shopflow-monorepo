# 21 - 布局-侧边栏组件

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 20

## 🎯 任务目标

开发侧边栏组件，实现菜单导航功能。

## 📋 执行步骤

### 1. 创建菜单配置

**src/config/menus.ts**:
```typescript
export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}

export const menus: MenuItem[] = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'el-icon-house',
  },
  {
    path: '/system',
    title: '系统管理',
    icon: 'el-icon-setting',
    children: [
      { path: '/system/user', title: '用户管理' },
      { path: '/system/role', title: '角色管理' },
      { path: '/system/menu', title: '菜单管理' },
    ],
  },
  {
    path: '/logistics',
    title: '物流管理',
    icon: 'el-icon-box',
    children: [
      { path: '/logistics/procurement', title: '采购管理' },
      { path: '/logistics/warehouse', title: '仓储管理' },
    ],
  },
  {
    path: '/production',
    title: '生产管理',
    icon: 'el-icon-goods',
    children: [
      { path: '/production/plan', title: '生产计划' },
    ],
  },
];
```

### 2. 创建侧边栏组件

**src/layouts/components/Sidebar.vue**:
```vue
<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.menuCollapse"
      router
    >
      <template v-for="item in menus" :key="item.path">
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/store';
import { menus } from '@/config/menus';

const route = useRoute();
const appStore = useAppStore();

const activeMenu = computed(() => route.path);
</script>

<style scoped>
.sidebar {
  width: 200px;
  border-right: 1px solid #eee;
  transition: width 0.3s;
}

.sidebar:has(.el-menu--collapse) {
  width: 64px;
}
</style>
```

### 3. 集成到布局

**src/layouts/default.vue**:
```vue
<template>
  <div class="layout">
    <Header />
    <div class="container">
      <Sidebar />
      <div class="main">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
</script>

<style scoped>
.container {
  flex: 1;
  display: flex;
}

.main {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
```

## ✅ 验收标准

### 检查：菜单导航

```bash
# 访问 http://localhost:5000
# 预期: 左侧显示菜单
# 点击菜单项，路由切换正确
```

## 📝 检查清单

- [ ] 菜单配置创建
- [ ] 侧边栏组件创建
- [ ] 菜单渲染正确
- [ ] 路由跳转正常
- [ ] 折叠功能
- [ ] 集成到布局

## 🔗 下一步

- [22 - 登录认证](./22-auth-login.md)

