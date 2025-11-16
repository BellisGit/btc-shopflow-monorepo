# 24 - 系统管理-用户模块

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 23

## 🎯 任务目标

使用 CRUD 配置化开发第一个业务模块：用户管理。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/views/system/user/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    // Mock 服务
    page: async (params: any) => ({
      list: [
        { id: 1, username: 'admin', name: '管理员', phone: '13800138000', status: 1 },
        { id: 2, username: 'user', name: '普通用户', phone: '13800138001', status: 1 },
      ],
      total: 2,
    }),
    add: async (data: any) => ({ id: 3 }),
    update: async (data: any) => ({}),
    delete: async (params: any) => ({}),
  },

  table: {
    columns: [
      { prop: 'id', label: 'ID', width: 80 },
      { prop: 'username', label: '用户名', width: 150 },
      { prop: 'name', label: '姓名', width: 150 },
      { prop: 'phone', label: '手机号', width: 150 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => row.status === 1 ? '启用' : '禁用',
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/views/system/user/index.vue**:
```vue
<template>
  <div class="user-management">
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

### 3. 添加路由

**src/router/index.ts**:
```typescript
const routes = [
  // ...
  {
    path: '/system',
    component: () => import('../layouts/default.vue'),
    children: [
      {
        path: 'user',
        component: () => import('../views/system/user/index.vue'),
      },
    ],
  },
];
```

## ✅ 验收标准

### 检查：用户管理页面

```bash
# 访问 http://localhost:5000/system/user
# 预期:
- 显示用户列表
- 有新增按钮
- 有编辑/删除按钮
- 有分页组件
```

## 📝 检查清单

- [ ] CRUD 配置创建
- [ ] 页面创建
- [ ] 路由添加
- [ ] 表格显示正常
- [ ] 操作按钮显示
- [ ] 功能完整

## 🎉 里程碑 M3 完成

恭喜！完成阶段三，主应用已上线：
- ✅ qiankun 微前端集成
- ✅ 全局状态管理
- ✅ 布局系统完成
- ✅ 登录认证系统
- ✅ 路由守卫
- ✅ 第一个 CRUD 模块

## 🔗 下一步

- [25 - 子应用模板](../phase-4-sub-apps/25-sub-app-template.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

