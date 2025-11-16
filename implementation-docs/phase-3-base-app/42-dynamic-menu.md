# 24.6 - 动态菜单加载

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 24.5

## 🎯 任务目标

实现基于权限的动态菜单加载和路由生成。

## 📋 执行步骤

### 1. 创建菜单 Store

**src/store/menu.ts**:
```typescript
import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import router from '@/router';

interface MenuItem {
  id: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  children?: MenuItem[];
  meta?: any;
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as MenuItem[],
    routes: [] as RouteRecordRaw[],
    loaded: false,
  }),

  actions: {
    async loadMenus() {
      if (this.loaded) return;

      try {
        // 从后端获取菜单
        // const res = await service.menu.list();
        
        // Mock 数据
        const res = [
          {
            id: 1,
            name: '系统管理',
            path: '/system',
            icon: 'el-icon-setting',
            children: [
              {
                id: 11,
                name: '用户管理',
                path: '/system/user',
                component: 'system/user/index',
              },
              {
                id: 12,
                name: '角色管理',
                path: '/system/role',
                component: 'system/role/index',
              },
            ],
          },
        ];

        this.menus = res;
        this.routes = this.generateRoutes(res);
        this.addRoutes();
        this.loaded = true;
      } catch (error) {
        console.error('加载菜单失败', error);
      }
    },

    generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
      const routes: RouteRecordRaw[] = [];

      menus.forEach(menu => {
        if (menu.component) {
          routes.push({
            path: menu.path,
            name: menu.path,
            component: () => import(`@/views/${menu.component}.vue`),
            meta: {
              title: menu.name,
              icon: menu.icon,
              ...menu.meta,
            },
          });
        }

        if (menu.children) {
          routes.push(...this.generateRoutes(menu.children));
        }
      });

      return routes;
    },

    addRoutes() {
      this.routes.forEach(route => {
        router.addRoute(route);
      });
    },

    clearMenus() {
      this.menus = [];
      this.routes = [];
      this.loaded = false;
    },
  },
});
```

### 2. 在路由守卫中加载

**src/router/guard.ts**:
```typescript
import { useMenuStore } from '@/store/menu';
import { useUserStore } from '@/store/user';

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const menuStore = useMenuStore();

    if (userStore.token) {
      // 加载菜单
      if (!menuStore.loaded) {
        await menuStore.loadMenus();
        
        // 重定向到原目标路由
        next({ ...to, replace: true });
      } else {
        next();
      }
    } else {
      if (whiteList.includes(to.path)) {
        next();
      } else {
        next('/login');
      }
    }
  });
}
```

### 3. 动态侧边栏

**src/layouts/components/Sidebar.vue**:
```vue
<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      router
    >
      <template v-for="item in menuStore.menus" :key="item.id">
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </template>
          
          <el-menu-item
            v-for="child in item.children"
            :key="child.id"
            :index="child.path"
          >
            {{ child.name }}
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@/store/menu';

const route = useRoute();
const menuStore = useMenuStore();

const activeMenu = computed(() => route.path);
</script>
```

### 4. 菜单缓存

**localStorage 缓存**:
```typescript
// 保存菜单
localStorage.setItem('menus', JSON.stringify(menuStore.menus));

// 读取缓存
const cachedMenus = localStorage.getItem('menus');
if (cachedMenus) {
  menuStore.menus = JSON.parse(cachedMenus);
  menuStore.routes = menuStore.generateRoutes(menuStore.menus);
  menuStore.addRoutes();
  menuStore.loaded = true;
}
```

## ✅ 验收标准

### 检查：动态菜单

```bash
# 1. 登录后
# 预期: 自动加载菜单

# 2. 不同用户登录
# 预期: 显示不同的菜单

# 3. 刷新页面
# 预期: 菜单保持不变（缓存生效）
```

## 📝 检查清单

- [ ] 菜单 Store 创建
- [ ] 后端菜单接口
- [ ] 路由自动生成
- [ ] 动态添加路由
- [ ] 路由守卫集成
- [ ] 侧边栏动态渲染
- [ ] 菜单缓存
- [ ] 功能正常

## 🔗 下一步

- [25 - 子应用模板](../phase-4-sub-apps/25-sub-app-template.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

