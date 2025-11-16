# 27.5 - 模块配置文件

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 27

## 🎯 任务目标

建立模块配置规范，实现模块的插件化管理。

## 📋 执行步骤

### 1. 定义模块配置接口

**packages/shared-core/src/types/module.ts**:
```typescript
export interface ModuleConfig {
  name: string;
  title: string;
  icon?: string;
  sort?: number;
  enabled?: boolean;
  routes?: any[];
  permissions?: string[];
  dependencies?: string[];
}
```

### 2. 创建模块配置示例

**packages/logistics-app/src/modules/procurement/config.ts**:
```typescript
import type { ModuleConfig } from '@btc/shared-core';

export default {
  name: 'procurement',
  title: '采购管理',
  icon: 'el-icon-shopping-cart',
  sort: 1,
  enabled: true,

  // 模块路由
  routes: [
    {
      path: 'order',
      name: 'ProcurementOrder',
      component: () => import('./views/order/index.vue'),
      meta: {
        title: '采购订单',
        permission: 'procurement:order:view',
      },
    },
    {
      path: 'supplier',
      name: 'ProcurementSupplier',
      component: () => import('./views/supplier/index.vue'),
      meta: {
        title: '供应商管理',
        permission: 'procurement:supplier:view',
      },
    },
    {
      path: 'contract',
      name: 'ProcurementContract',
      component: () => import('./views/contract/index.vue'),
      meta: {
        title: '采购合同',
        permission: 'procurement:contract:view',
      },
    },
  ],

  // 模块权限
  permissions: [
    'procurement:order:view',
    'procurement:order:add',
    'procurement:order:edit',
    'procurement:order:delete',
    'procurement:supplier:view',
    'procurement:supplier:add',
    'procurement:contract:view',
  ],

  // 依赖的其他模块
  dependencies: [],
} as ModuleConfig;
```

### 3. 创建模块加载器

**packages/logistics-app/src/utils/module-loader.ts**:
```typescript
import type { ModuleConfig } from '@btc/shared-core';
import type { RouteRecordRaw } from 'vue-router';

class ModuleLoader {
  private modules: Map<string, ModuleConfig> = new Map();

  // 加载模块
  async loadModules() {
    // 自动扫描 modules 目录
    const moduleFiles = import.meta.glob('../modules/*/config.ts', {
      eager: true,
    });

    for (const path in moduleFiles) {
      const module = (moduleFiles[path] as any).default;
      
      if (module.enabled !== false) {
        this.modules.set(module.name, module);
      }
    }
  }

  // 获取所有路由
  getRoutes(): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = [];

    this.modules.forEach(module => {
      if (module.routes) {
        routes.push({
          path: `/${module.name}`,
          meta: {
            title: module.title,
            icon: module.icon,
          },
          children: module.routes,
        });
      }
    });

    return routes;
  }

  // 获取所有权限
  getPermissions(): string[] {
    const permissions: string[] = [];

    this.modules.forEach(module => {
      if (module.permissions) {
        permissions.push(...module.permissions);
      }
    });

    return permissions;
  }

  // 获取模块
  getModule(name: string): ModuleConfig | undefined {
    return this.modules.get(name);
  }

  // 获取所有模块
  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values()).sort((a, b) => 
      (a.sort || 0) - (b.sort || 0)
    );
  }
}

export const moduleLoader = new ModuleLoader();
```

### 4. 在路由中使用

**packages/logistics-app/src/router/index.ts**:
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { moduleLoader } from '../utils/module-loader';

// 加载模块
await moduleLoader.loadModules();

// 获取模块路由
const moduleRoutes = moduleLoader.getRoutes();

const routes = [
  {
    path: '/',
    component: () => import('../layouts/default.vue'),
    children: [
      ...moduleRoutes,
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/logistics'),
  routes,
});

export default router;
```

### 5. 动态菜单生成

**packages/logistics-app/src/composables/use-module-menu.ts**:
```typescript
import { computed } from 'vue';
import { moduleLoader } from '../utils/module-loader';

export function useModuleMenu() {
  const menus = computed(() => {
    return moduleLoader.getAllModules().map(module => ({
      path: `/${module.name}`,
      title: module.title,
      icon: module.icon,
      children: module.routes?.map(route => ({
        path: `/${module.name}/${route.path}`,
        title: route.meta?.title,
      })),
    }));
  });

  return {
    menus,
  };
}
```

## ✅ 验收标准

### 检查 1: 模块自动加载

```bash
# 启动应用
pnpm dev

# 控制台输出
# [ModuleLoader] 加载模块: procurement
# [ModuleLoader] 加载模块: warehouse

# 访问菜单
# 预期: 自动显示模块菜单
```

### 检查 2: 模块路由生成

```bash
# 访问 /logistics/procurement/order
# 预期: 路由正确匹配

# 访问 /logistics/warehouse/inventory
# 预期: 路由正确匹配
```

### 检查 3: 权限集成

```typescript
const permissions = moduleLoader.getPermissions();
console.log(permissions);
// 预期: 包含所有模块的权限
```

## 📝 检查清单

- [ ] 模块配置接口定义
- [ ] 模块配置文件创建
- [ ] 模块加载器实现
- [ ] 路由自动生成
- [ ] 菜单自动生成
- [ ] 权限自动收集
- [ ] 功能正常

## 🎯 模块配置最佳实践

### 1. 命名规范
```typescript
name: 'procurement',  // 模块标识：小写、连字符
title: '采购管理',     // 显示名称
```

### 2. 路由配置
```typescript
routes: [
  {
    path: 'order',        // 相对路径
    component: () => import('./views/order/index.vue'),
    meta: {
      title: '采购订单',
      permission: 'procurement:order:view',
    },
  },
],
```

### 3. 权限标识
```typescript
permissions: [
  'module:entity:action',
  'procurement:order:view',
  'procurement:order:add',
],
```

## 🔗 下一步

- [28 - 采购订单模块](./28-procurement-order.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

