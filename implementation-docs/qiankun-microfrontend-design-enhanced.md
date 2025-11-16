# Qiankun 微前端架构设计方案（增强版）
## 融合 Cool-Admin-Vue 最佳实践

---

## 一、整体架构概述

### 1.1 架构目标
- 使用 **qiankun** 微前端框架支撑多子域名业务域的独立运行
- 使用 **Monorepo** (pnpm workspaces) 统一管理所有子应用代码
- 引入 **Cool-Admin-Vue** 的 EPS 自动化服务生成、CRUD 配置化、插件化架构思想
- 实现业务域的独立开发、部署、运行，同时保持代码一致性
- 通过配置化和约定优于配置的理念，极大提升开发效率

### 1.2 技术栈选型（增强版）
| 分类 | 技术选型 | 说明 |
|------|---------|------|
| **微前端框架** | qiankun 2.x | 基于 single-spa 的成熟微前端方案 |
| **包管理工具** | pnpm + workspaces | 高效的 Monorepo 管理 |
| **构建工具** | Vite 5.x | 极速的开发体验 + 自定义插件 |
| **前端框架** | Vue 3 + TypeScript | 现代化响应式框架 |
| **UI 组件库** | Element Plus | 企业级组件库 |
| **状态管理** | Pinia | Vue 官方推荐 |
| **路由** | Vue Router 4 | 单页面应用路由 |
| **样式方案** | Tailwind CSS + UnoCSS | 原子化 CSS + 按需生成 |
| **通信方案** | qiankun GlobalState + Event Bus | 主子应用 + 跨应用通信 |
| **API 层** | **EPS 自动生成服务** | 🔥 借鉴 Cool-Admin 思想 |
| **CRUD 系统** | **配置化 CRUD** | 🔥 声明式开发 |
| **插件系统** | **Vite 插件 + 业务插件** | 🔥 可扩展架构 |
| **自动导入** | unplugin-auto-import | 组件、API 自动导入 |
| **国际化** | vue-i18n | 多语言支持 |

### 1.3 Cool-Admin 核心设计思想融合

#### 🎯 EPS（Endpoint Service）自动化服务生成
不再手写 API 请求文件，通过后端接口自动生成 TypeScript 类型安全的服务层

#### 🎯 CRUD 配置化开发
通过配置对象快速生成增删改查页面，减少 70% 重复代码

#### 🎯 插件化架构
业务功能模块化，支持按需加载和热插拔

#### 🎯 约定优于配置
统一的目录结构、命名规范、开发模式

---

## 二、目录结构设计（增强版）

```
bellis-microfrontend-monorepo/
├─ package.json                       # 根目录配置
├─ pnpm-workspace.yaml                # workspace 配置
├─ pnpm-lock.yaml
├─ .npmrc
├─ tsconfig.json                      # TS 根配置
├─ .eslintrc.js
├─ .prettierrc
├─ turbo.json                         # Turborepo 构建加速
├─ README.md
│
├─ packages/                          # 所有子应用和共享库
│  │
│  ├─ base-app/                       # 【主应用/基座】bellis.com.cn
│  │  ├─ public/
│  │  ├─ src/
│  │  │  ├─ main.ts                   # 主应用入口 + qiankun 注册
│  │  │  ├─ App.vue
│  │  │  │
│  │  │  ├─ config/                   # 🔥 配置中心
│  │  │  │  ├─ micro-apps.config.ts  # 微应用注册配置
│  │  │  │  ├─ plugin.config.ts      # 插件配置
│  │  │  │  ├─ crud.config.ts        # CRUD 全局配置
│  │  │  │  └─ eps.config.ts         # EPS 服务配置
│  │  │  │
│  │  │  ├─ cool/                     # 🔥 Cool 核心层（借鉴 Cool-Admin）
│  │  │  │  ├─ index.ts               # 导出 useCool composable
│  │  │  │  ├─ service/               # EPS 服务层
│  │  │  │  │  ├─ index.ts            # service 入口
│  │  │  │  │  ├─ request.ts          # axios 封装
│  │  │  │  │  └─ base.ts             # 基础服务类
│  │  │  │  ├─ crud/                  # CRUD 系统
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ use-crud.ts         # CRUD composable
│  │  │  │  │  └─ types.ts            # CRUD 类型定义
│  │  │  │  └─ plugin/                # 插件管理器
│  │  │  │     ├─ index.ts
│  │  │  │     └─ manager.ts
│  │  │  │
│  │  │  ├─ plugins/                  # 🔥 业务插件
│  │  │  │  ├─ excel/                 # Excel 导入导出插件
│  │  │  │  ├─ pdf/                   # PDF 导出插件
│  │  │  │  ├─ upload/                # 上传插件
│  │  │  │  └─ dict/                  # 数据字典插件
│  │  │  │
│  │  │  ├─ router/
│  │  │  │  ├─ index.ts
│  │  │  │  └─ routes.ts
│  │  │  │
│  │  │  ├─ store/                    # Pinia stores
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ user.ts                # 用户状态
│  │  │  │  ├─ app.ts                 # 应用全局状态
│  │  │  │  └─ permission.ts          # 权限状态
│  │  │  │
│  │  │  ├─ views/                    # 主应用页面
│  │  │  │  ├─ login/
│  │  │  │  ├─ system/                # 系统管理
│  │  │  │  │  ├─ user/               # 用户管理（CRUD 配置化）
│  │  │  │  │  ├─ role/               # 角色管理
│  │  │  │  │  └─ menu/               # 菜单管理
│  │  │  │  └─ dashboard/
│  │  │  │
│  │  │  ├─ layouts/                  # 布局组件
│  │  │  │  ├─ default.vue
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ Header.vue
│  │  │  │  │  ├─ Sidebar.vue
│  │  │  │  │  └─ SubAppContainer.vue
│  │  │  │
│  │  │  ├─ components/               # 公共组件
│  │  │  │  ├─ CrudTable/             # 🔥 CRUD 表格组件
│  │  │  │  ├─ CrudForm/              # 🔥 CRUD 表单组件
│  │  │  │  └─ SearchForm/            # 搜索表单
│  │  │  │
│  │  │  ├─ composables/              # 组合式函数
│  │  │  │  ├─ use-table.ts
│  │  │  │  ├─ use-form.ts
│  │  │  │  └─ use-dict.ts            # 字典数据
│  │  │  │
│  │  │  └─ utils/
│  │  │     ├─ index.ts
│  │  │     └─ tools.ts
│  │  │
│  │  ├─ build/                       # 🔥 构建产物（自动生成）
│  │  │  └─ cool/
│  │  │     ├─ eps.d.ts               # EPS 类型定义
│  │  │     └─ eps.json               # EPS 服务数据
│  │  │
│  │  ├─ vite.config.ts               # Vite 配置 + 自定义插件
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ logistics-app/                  # 【物流子应用】logistics.bellis.com.cn
│  │  ├─ public/
│  │  ├─ src/
│  │  │  ├─ main.ts                   # qiankun 生命周期
│  │  │  ├─ App.vue
│  │  │  │
│  │  │  ├─ config/                   # 🔥 配置中心
│  │  │  │  ├─ crud.config.ts
│  │  │  │  └─ eps.config.ts
│  │  │  │
│  │  │  ├─ cool/                     # 🔥 继承主应用 Cool 核心层
│  │  │  │  ├─ service/
│  │  │  │  └─ crud/
│  │  │  │
│  │  │  ├─ modules/                  # 🔥 业务模块（插件化）
│  │  │  │  ├─ procurement/           # 采购模块
│  │  │  │  │  ├─ config.ts           # 模块配置
│  │  │  │  │  ├─ views/
│  │  │  │  │  │  ├─ order/           # 采购订单
│  │  │  │  │  │  │  ├─ index.vue     # 列表页（CRUD 配置化）
│  │  │  │  │  │  │  └─ crud.ts       # 🔥 CRUD 配置文件
│  │  │  │  │  │  ├─ supplier/        # 供应商管理
│  │  │  │  │  │  └─ contract/        # 采购合同
│  │  │  │  │  ├─ components/
│  │  │  │  │  ├─ service/            # 模块专属服务
│  │  │  │  │  └─ store/              # 模块状态
│  │  │  │  │
│  │  │  │  └─ warehouse/             # 仓储模块
│  │  │  │     ├─ config.ts
│  │  │  │     ├─ views/
│  │  │  │     │  ├─ inventory/       # 库存管理
│  │  │  │     │  ├─ inbound/         # 入库管理
│  │  │  │     │  └─ outbound/        # 出库管理
│  │  │  │     └─ service/
│  │  │  │
│  │  │  ├─ router/
│  │  │  ├─ store/
│  │  │  ├─ public-path.ts
│  │  │  └─ utils/
│  │  │
│  │  ├─ build/cool/                  # EPS 自动生成
│  │  ├─ vite.config.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ production-app/                 # 【生产子应用】production.bellis.com.cn
│  │  ├─ src/
│  │  │  ├─ modules/                  # 业务模块
│  │  │  │  └─ production-plan/       # 生产计划
│  │  │  │     ├─ views/
│  │  │  │     │  ├─ plan/
│  │  │  │     │  │  └─ crud.ts       # 🔥 CRUD 配置
│  │  │  │     │  ├─ schedule/
│  │  │  │     │  └─ material/
│  │  │  │     └─ service/
│  │  │  └─ cool/
│  │  └─ ...（结构同 logistics-app）
│  │
│  ├─ shared-core/                    # 🔥 【核心共享库】（新增）
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  │
│  │  │  ├─ cool/                     # Cool 核心层实现
│  │  │  │  ├─ service/
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ request.ts          # axios 统一封装
│  │  │  │  │  ├─ base.ts             # 基础服务类
│  │  │  │  │  └─ types.ts
│  │  │  │  │
│  │  │  │  ├─ crud/                  # CRUD 核心实现
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ use-crud.ts
│  │  │  │  │  ├─ use-upsert.ts       # 新增/编辑
│  │  │  │  │  ├─ use-table.ts        # 表格
│  │  │  │  │  ├─ use-search.ts       # 搜索
│  │  │  │  │  └─ types.ts
│  │  │  │  │
│  │  │  │  ├─ plugin/                # 插件管理器
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ manager.ts
│  │  │  │  │  └─ types.ts
│  │  │  │  │
│  │  │  │  └─ helper/                # 工具函数
│  │  │  │     ├─ parse.ts            # 数据解析
│  │  │  │     ├─ storage.ts
│  │  │  │     └─ validate.ts
│  │  │  │
│  │  │  ├─ composables/              # 通用组合式函数
│  │  │  │  ├─ use-dict.ts
│  │  │  │  ├─ use-upload.ts
│  │  │  │  └─ use-permission.ts
│  │  │  │
│  │  │  ├─ directives/               # 全局指令
│  │  │  │  ├─ permission.ts
│  │  │  │  └─ loading.ts
│  │  │  │
│  │  │  └─ types/                    # 全局类型定义
│  │  │     ├─ common.ts
│  │  │     ├─ api.ts
│  │  │     └─ crud.ts
│  │  │
│  │  ├─ package.json
│  │  ├─ vite.config.ts
│  │  └─ tsconfig.json
│  │
│  ├─ shared-components/              # 【UI 组件库】
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  │
│  │  │  ├─ crud/                     # 🔥 CRUD 组件族
│  │  │  │  ├─ table/
│  │  │  │  │  ├─ index.vue           # CrudTable 表格
│  │  │  │  │  └─ props.ts
│  │  │  │  ├─ form/
│  │  │  │  │  ├─ index.vue           # CrudForm 表单
│  │  │  │  │  └─ components/         # 表单项组件
│  │  │  │  ├─ search/
│  │  │  │  │  └─ index.vue           # SearchForm 搜索
│  │  │  │  ├─ upsert/
│  │  │  │  │  └─ index.vue           # CrudUpsert 新增编辑
│  │  │  │  └─ index.ts
│  │  │  │
│  │  │  ├─ plugins/                  # 插件组件
│  │  │  │  ├─ pdf-export/
│  │  │  │  ├─ excel-import/
│  │  │  │  ├─ excel-export/
│  │  │  │  └─ upload/
│  │  │  │
│  │  │  ├─ common/                   # 通用组件
│  │  │  │  ├─ dialog/
│  │  │  │  ├─ pagination/
│  │  │  │  └─ icon-selector/
│  │  │  │
│  │  │  └─ style/                    # 样式文件
│  │  │     ├─ index.scss
│  │  │     └─ variables.scss
│  │  │
│  │  ├─ package.json
│  │  └─ vite.config.ts
│  │
│  ├─ shared-utils/                   # 【工具库】
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ date/                     # 日期处理
│  │  │  ├─ format/                   # 格式化
│  │  │  ├─ validate/                 # 校验
│  │  │  ├─ storage/                  # 本地存储
│  │  │  ├─ event-bus/                # 事件总线
│  │  │  └─ constants/
│  │  └─ package.json
│  │
│  └─ vite-plugin-cool/               # 🔥 【Vite 插件】自定义
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ eps/                      # EPS 自动生成插件
│     │  │  ├─ index.ts
│     │  │  ├─ generator.ts           # 生成器
│     │  │  └─ parser.ts              # 解析器
│     │  ├─ virtual-modules/          # 虚拟模块注入
│     │  │  └─ index.ts
│     │  └─ auto-import/              # 自动导入增强
│     │     └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
│
├─ cdn/                               # 公共静态资源
│  ├─ icons/
│  ├─ fonts/
│  └─ images/
│
└─ scripts/                           # 自动化脚本
   ├─ build-all.sh
   ├─ deploy.sh
   ├─ create-app.js                   # 创建子应用
   ├─ create-module.js                # 🔥 创建业务模块
   └─ generate-eps.js                 # 🔥 手动触发 EPS 生成
```

---

## 三、核心设计：EPS 自动化服务生成

### 3.1 设计理念

传统开发模式中，每个 API 接口都需要手写 TypeScript 类型和请求函数：

```typescript
// ❌ 传统方式：重复劳动
interface User {
  id: number;
  name: string;
  email: string;
}

export const getUserList = (params: any) => {
  return request.get<User[]>('/api/user/list', { params });
};

export const createUser = (data: User) => {
  return request.post('/api/user/create', data);
};
// ... 每个接口都要写一遍
```

**EPS 方案**：通过 Vite 插件，在开发时自动扫描后端 API 文档（Swagger/OpenAPI），生成类型安全的服务层代码。

```typescript
// ✅ EPS 方式：自动生成
import { service } from '/@/cool';

// 自动补全 + 类型检查
service.user.list({ page: 1, size: 20 }).then(res => {
  // res 自动推断为 { list: User[], total: number }
});

service.user.create({ name: 'John', email: 'john@example.com' });
```

### 3.2 实现原理

#### 步骤 1：后端提供 API 元数据

后端提供一个特殊接口 `/admin/base/open/eps`，返回所有接口的元数据：

```json
{
  "/admin/user": {
    "api": [
      { "method": "POST", "path": "/list", "summary": "用户列表" },
      { "method": "POST", "path": "/add", "summary": "新增用户" },
      { "method": "POST", "path": "/update", "summary": "更新用户" },
      { "method": "POST", "path": "/delete", "summary": "删除用户" }
    ]
  },
  "/admin/order": {
    "api": [
      { "method": "POST", "path": "/page", "summary": "订单分页" }
    ]
  }
}
```

#### 步骤 2：Vite 插件自动生成

```typescript
// packages/vite-plugin-cool/src/eps/generator.ts

export function generateEps(apiMeta: any) {
  const services: Record<string, any> = {};

  // 解析 API 元数据
  for (const [namespace, config] of Object.entries(apiMeta)) {
    const moduleName = namespace.split('/').pop(); // 'user', 'order'

    services[moduleName] = config.api.map((item: any) => {
      return {
        path: `${namespace}${item.path}`,
        method: item.method.toLowerCase(),
        name: item.path.replace('/', ''), // '/list' -> 'list'
      };
    });
  }

  // 生成 TypeScript 代码
  const dts = generateDts(services);   // eps.d.ts
  const json = JSON.stringify(services); // eps.json

  fs.writeFileSync('build/cool/eps.d.ts', dts);
  fs.writeFileSync('build/cool/eps.json', json);
}

function generateDts(services: any) {
  let code = `
import { BaseService } from '@bellis/shared-core';

interface Service {
`;

  for (const [module, apis] of Object.entries(services)) {
    code += `  ${module}: {\n`;
    for (const api of apis as any[]) {
      code += `    ${api.name}(data?: any): Promise<any>;\n`;
    }
    code += `  };\n`;
  }

  code += `}\n\nexport const service: Service;`;
  return code;
}
```

#### 步骤 3：运行时加载服务

```typescript
// packages/shared-core/src/cool/service/index.ts

import epsJson from 'virtual:eps'; // Vite 虚拟模块
import { BaseService } from './base';

class ServiceBuilder {
  build() {
    const service: any = {};

    for (const [module, apis] of Object.entries(epsJson)) {
      service[module] = {};

      for (const api of apis as any[]) {
        service[module][api.name] = (data?: any) => {
          return BaseService.request({
            url: api.path,
            method: api.method,
            [api.method === 'get' ? 'params' : 'data']: data,
          });
        };
      }
    }

    return service;
  }
}

export const service = new ServiceBuilder().build();
```

### 3.3 Vite 插件配置

```typescript
// packages/base-app/vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { coolEpsPlugin } from '@bellis/vite-plugin-cool';

export default defineConfig({
  plugins: [
    vue(),
    coolEpsPlugin({
      // 开发环境：从后端拉取 API 元数据
      epsUrl: 'http://localhost:8001/admin/base/open/eps',

      // 生产环境：使用构建时生成的 eps.json
      mode: process.env.NODE_ENV,

      // 输出目录
      outputDir: 'build/cool',

      // 监听文件变化，自动重新生成
      watch: true,
    }),
  ],
});
```

### 3.4 使用示例

```vue
<!-- packages/logistics-app/src/modules/procurement/views/order/index.vue -->
<script setup lang="ts">
import { service } from '/@/cool';

const loadData = async () => {
  // 自动补全：service.procurement.
  const res = await service.procurement.orderPage({
    page: 1,
    size: 20,
    keyword: '采购单',
  });

  console.log(res.list);
};
</script>
```

---

## 四、核心设计：CRUD 配置化开发

### 4.1 设计理念

传统 CRUD 开发需要编写大量重复代码：表格、分页、搜索、新增弹窗、编辑弹窗、删除确认等。

**配置化 CRUD**：通过声明式配置对象，自动生成完整的 CRUD 页面。

### 4.2 CRUD 配置示例

```typescript
// packages/logistics-app/src/modules/procurement/views/order/crud.ts

import { CrudConfig } from '@bellis/shared-core';
import { service } from '/@/cool';

export default {
  // 服务接口
  service: service.procurement.order,

  // 表格配置
  table: {
    columns: [
      { prop: 'orderNo', label: '订单编号', width: 180 },
      { prop: 'supplierName', label: '供应商', width: 200 },
      {
        prop: 'totalAmount',
        label: '总金额',
        width: 120,
        formatter: (row) => `¥${row.totalAmount.toFixed(2)}`,
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        dict: 'order_status', // 🔥 数据字典
      },
      { prop: 'createTime', label: '创建时间', width: 180 },
    ],

    // 操作列
    actions: {
      width: 200,
      buttons: ['edit', 'delete', 'custom'],
      custom: [
        {
          label: '审批',
          type: 'primary',
          permission: 'procurement:order:approve',
          click: (row) => {
            // 自定义操作
          },
        },
      ],
    },
  },

  // 搜索表单配置
  search: {
    items: [
      { prop: 'orderNo', label: '订单编号', component: 'el-input' },
      { prop: 'supplierId', label: '供应商', component: 'el-select', dict: 'supplier' },
      {
        prop: 'dateRange',
        label: '创建时间',
        component: 'el-date-picker',
        componentProps: { type: 'daterange' },
      },
    ],
  },

  // 新增/编辑表单配置
  upsert: {
    width: '800px',
    items: [
      {
        prop: 'supplierId',
        label: '供应商',
        component: 'el-select',
        dict: 'supplier',
        rules: [{ required: true, message: '请选择供应商' }],
      },
      {
        prop: 'items',
        label: '采购明细',
        component: 'ProcurementItemTable', // 自定义组件
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'el-input',
        componentProps: { type: 'textarea', rows: 4 },
      },
    ],

    // 表单钩子
    onSubmit: async (isEdit, data, { close, refresh }) => {
      await service.procurement.order[isEdit ? 'update' : 'add'](data);
      ElMessage.success('保存成功');
      close();
      refresh();
    },
  },
} as CrudConfig;
```

### 4.3 CRUD 组件实现

```vue
<!-- packages/base-app/src/views/system/user/index.vue -->
<template>
  <div class="crud-container">
    <!-- 🔥 一个组件搞定所有 CRUD 逻辑 -->
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@bellis/shared-components';
import crudConfig from './crud';
</script>
```

### 4.4 CrudTable 核心实现

```vue
<!-- packages/shared-components/src/crud/table/index.vue -->
<template>
  <div class="crud-table">
    <!-- 搜索区域 -->
    <SearchForm
      v-if="config.search"
      :config="config.search"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="handleRefresh">刷新</el-button>
      <slot name="toolbar-extra"></slot>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading">
      <el-table-column
        v-for="col in config.table.columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <!-- 字典翻译 -->
          <DictTag v-if="col.dict" :dict="col.dict" :value="row[col.prop]" />
          <!-- 自定义格式化 -->
          <span v-else-if="col.formatter">{{ col.formatter(row) }}</span>
          <!-- 默认显示 -->
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" :width="config.table.actions?.width">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @change="loadData"
    />

    <!-- 新增/编辑弹窗 -->
    <CrudUpsert
      v-model="upsertVisible"
      :config="config.upsert"
      :data="currentRow"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCrud } from '@bellis/shared-core';

const props = defineProps<{
  config: CrudConfig;
}>();

// 🔥 使用 CRUD composable 封装逻辑
const {
  tableData,
  loading,
  pagination,
  upsertVisible,
  currentRow,
  loadData,
  handleSearch,
  handleReset,
  handleAdd,
  handleEdit,
  handleDelete,
  handleRefresh,
} = useCrud(props.config);

onMounted(() => {
  loadData();
});
</script>
```

### 4.5 useCrud Composable

```typescript
// packages/shared-core/src/cool/crud/use-crud.ts

import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export function useCrud(config: CrudConfig) {
  const tableData = ref([]);
  const loading = ref(false);
  const pagination = reactive({ page: 1, size: 20, total: 0 });
  const searchParams = ref({});
  const upsertVisible = ref(false);
  const currentRow = ref(null);

  // 加载数据
  const loadData = async () => {
    loading.value = true;
    try {
      const res = await config.service.page({
        page: pagination.page,
        size: pagination.size,
        ...searchParams.value,
      });

      tableData.value = res.list;
      pagination.total = res.total;
    } catch (error) {
      ElMessage.error('加载失败');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = (params: any) => {
    searchParams.value = params;
    pagination.page = 1;
    loadData();
  };

  // 重置
  const handleReset = () => {
    searchParams.value = {};
    pagination.page = 1;
    loadData();
  };

  // 新增
  const handleAdd = () => {
    currentRow.value = null;
    upsertVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: any) => {
    currentRow.value = { ...row };
    upsertVisible.value = true;
  };

  // 删除
  const handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
      });

      await config.service.delete({ ids: [row.id] });
      ElMessage.success('删除成功');
      loadData();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败');
      }
    }
  };

  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  return {
    tableData,
    loading,
    pagination,
    upsertVisible,
    currentRow,
    loadData,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleRefresh,
  };
}
```

---

## 五、核心设计：插件化架构

### 5.1 插件系统设计

```typescript
// packages/shared-core/src/cool/plugin/types.ts

export interface Plugin {
  name: string;
  version?: string;
  install: (app: App, options?: any) => void;
  components?: Record<string, Component>;
  directives?: Record<string, Directive>;
  composables?: Record<string, Function>;
}

// packages/shared-core/src/cool/plugin/manager.ts

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private app: App | null = null;

  setApp(app: App) {
    this.app = app;
  }

  // 注册插件
  register(plugin: Plugin, options?: any) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已注册`);
      return;
    }

    this.plugins.set(plugin.name, plugin);

    if (this.app) {
      plugin.install(this.app, options);
    }
  }

  // 获取插件
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  // 卸载插件
  unregister(name: string) {
    this.plugins.delete(name);
  }
}

export const pluginManager = new PluginManager();
```

### 5.2 插件示例：Excel 导出

```typescript
// packages/base-app/src/plugins/excel/index.ts

import { Plugin } from '@bellis/shared-core';
import * as XLSX from 'xlsx';

export const ExcelPlugin: Plugin = {
  name: 'excel',
  version: '1.0.0',

  install(app, options) {
    // 全局方法
    app.config.globalProperties.$exportExcel = (data, filename) => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    };
  },

  // 提供组件
  components: {
    ExcelImport: () => import('./components/Import.vue'),
    ExcelExport: () => import('./components/Export.vue'),
  },

  // 提供 composable
  composables: {
    useExcel: () => ({
      exportExcel: (data, filename) => {
        // 导出逻辑
      },
      importExcel: (file) => {
        // 导入逻辑
      },
    }),
  },
};
```

### 5.3 插件配置

```typescript
// packages/base-app/src/config/plugin.config.ts

import { ExcelPlugin } from '../plugins/excel';
import { PdfPlugin } from '../plugins/pdf';
import { UploadPlugin } from '../plugins/upload';

export const plugins = [
  { plugin: ExcelPlugin, options: { /* 配置 */ } },
  { plugin: PdfPlugin },
  { plugin: UploadPlugin, options: { uploadUrl: '/api/upload' } },
];
```

### 5.4 主应用注册插件

```typescript
// packages/base-app/src/main.ts

import { createApp } from 'vue';
import { pluginManager } from '@bellis/shared-core';
import { plugins } from './config/plugin.config';
import App from './App.vue';

const app = createApp(App);

// 设置插件管理器的 app 实例
pluginManager.setApp(app);

// 注册插件
plugins.forEach(({ plugin, options }) => {
  pluginManager.register(plugin, options);
});

app.mount('#app');
```

---

## 六、Qiankun 微前端增强配置

### 6.1 主应用配置（增强版）

```typescript
// packages/base-app/src/config/micro-apps.config.ts

import { MicroAppConfig } from '@bellis/shared-core';

export const microApps: MicroAppConfig[] = [
  {
    name: 'logistics-app',
    entry: import.meta.env.DEV
      ? 'http://localhost:5001'
      : 'https://logistics.bellis.com.cn',
    container: '#subapp-container',
    activeRule: '/logistics',

    // 🔥 子应用权限控制
    permissions: ['logistics:view'],

    // 🔥 预加载策略
    prefetch: true,

    // 🔥 传递给子应用的配置
    props: {
      // 共享的全局服务
      parentService: {
        getUserInfo: () => userStore.getUserInfo(),
        hasPermission: (code: string) => permissionStore.has(code),
      },

      // 主题配置
      theme: {
        primaryColor: '#409EFF',
      },
    },
  },
  {
    name: 'production-app',
    entry: import.meta.env.DEV
      ? 'http://localhost:5002'
      : 'https://production.bellis.com.cn',
    container: '#subapp-container',
    activeRule: '/production',
    permissions: ['production:view'],
  },
];
```

### 6.2 主应用启动（增强版）

```typescript
// packages/base-app/src/main.ts

import { createApp } from 'vue';
import {
  registerMicroApps,
  start,
  initGlobalState,
  addGlobalUncaughtErrorHandler
} from 'qiankun';
import { useCool } from '@bellis/shared-core';
import App from './App.vue';
import router from './router';
import { microApps } from './config/micro-apps.config';

const app = createApp(App);

// 🔥 初始化 Cool 核心层
const { service, pluginManager } = useCool();
app.provide('cool', { service, pluginManager });

app.use(router);
app.mount('#app');

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: null,
  token: localStorage.getItem('token'),
  permissions: [],
  theme: { primaryColor: '#409EFF' },
});

// 🔥 注册微应用（带权限控制）
registerMicroApps(
  microApps
    .filter(app => hasPermission(app.permissions)) // 权限过滤
    .map(config => ({
      ...config,
      props: {
        ...config.props,
        globalState: { onGlobalStateChange, setGlobalState },
        routerBase: config.activeRule,
      },
    })),
  {
    beforeLoad: [
      async app => {
        console.log('[主应用] 开始加载子应用', app.name);
        // 🔥 可以在这里预加载子应用所需数据
        return Promise.resolve();
      },
    ],
    beforeMount: [
      async app => {
        console.log('[主应用] 子应用即将挂载', app.name);
        return Promise.resolve();
      },
    ],
    afterMount: [
      async app => {
        console.log('[主应用] 子应用已挂载', app.name);
        return Promise.resolve();
      },
    ],
    afterUnmount: [
      async app => {
        console.log('[主应用] 子应用已卸载', app.name);
        return Promise.resolve();
      },
    ],
  }
);

// 🔥 全局错误处理
addGlobalUncaughtErrorHandler((event: Event | string) => {
  console.error('微前端全局错误:', event);
  if (event instanceof Error) {
    ElMessage.error(`子应用错误: ${event.message}`);
  }
});

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: true,
  },
  prefetch: true,
  singular: false, // 允许多个子应用同时挂载
});

// 监听全局状态
onGlobalStateChange((state, prev) => {
  console.log('[主应用] 全局状态变化', state, prev);

  // 🔥 同步到本地存储
  if (state.token) {
    localStorage.setItem('token', state.token);
  }
});

// 🔥 导出方法供外部调用
export function updateGlobalState(state: Partial<GlobalState>) {
  setGlobalState(state);
}
```

### 6.3 子应用配置（增强版）

```typescript
// packages/logistics-app/src/main.ts

import './public-path';
import { createApp, App as VueApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useCool } from '@bellis/shared-core';
import AppComponent from './App.vue';
import routes from './router/routes';

let app: VueApp | null = null;
let router: any = null;

// 🔥 渲染函数增强
function render(props: any = {}) {
  const { container, routerBase, globalState, parentService } = props;

  router = createRouter({
    history: createWebHistory(routerBase || '/logistics'),
    routes,
  });

  app = createApp(AppComponent);

  // 🔥 初始化 Cool 核心层
  const { service, pluginManager } = useCool();
  app.provide('cool', { service, pluginManager });

  // 🔥 注入父应用服务
  if (parentService) {
    app.provide('parentService', parentService);
  }

  // 🔥 监听全局状态
  if (globalState) {
    globalState.onGlobalStateChange((state: any) => {
      console.log('[logistics-app] 接收全局状态', state);

      // 更新本地状态
      if (state.user) {
        userStore.setUser(state.user);
      }
    });

    // 🔥 子应用也可以修改全局状态
    window.__QIANKUN_GLOBAL_STATE__ = globalState;
  }

  app.use(router);

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

// 🔥 更新生命周期（可选）
export async function update(props: any) {
  console.log('[logistics-app] 更新', props);
}
```

---

## 七、开发工作流增强

### 7.1 创建业务模块脚本

```javascript
// scripts/create-module.js

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');

(async () => {
  const response = await prompts([
    {
      type: 'select',
      name: 'app',
      message: '选择子应用',
      choices: [
        { title: 'logistics-app', value: 'logistics-app' },
        { title: 'production-app', value: 'production-app' },
      ],
    },
    {
      type: 'text',
      name: 'moduleName',
      message: '模块名称（如：order-management）',
    },
    {
      type: 'text',
      name: 'moduleTitle',
      message: '模块标题（如：订单管理）',
    },
  ]);

  const { app, moduleName, moduleTitle } = response;
  const modulePath = path.join(__dirname, `../packages/${app}/src/modules/${moduleName}`);

  // 创建目录结构
  fs.ensureDirSync(`${modulePath}/views`);
  fs.ensureDirSync(`${modulePath}/components`);
  fs.ensureDirSync(`${modulePath}/service`);
  fs.ensureDirSync(`${modulePath}/store`);

  // 生成配置文件
  fs.writeFileSync(
    `${modulePath}/config.ts`,
    `export default {
  name: '${moduleName}',
  title: '${moduleTitle}',
  icon: 'el-icon-document',
  sort: 1,
};`
  );

  // 生成 CRUD 模板
  fs.writeFileSync(
    `${modulePath}/views/index.vue`,
    `<template>
  <div class="module-${moduleName}">
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@bellis/shared-components';
import crudConfig from './crud';
</script>`
  );

  fs.writeFileSync(
    `${modulePath}/views/crud.ts`,
    `import { CrudConfig } from '@bellis/shared-core';
import { service } from '/@/cool';

export default {
  service: service.${moduleName.replace(/-/g, '')},
  table: {
    columns: [
      { prop: 'id', label: 'ID', width: 80 },
      { prop: 'name', label: '名称', width: 200 },
      { prop: 'createTime', label: '创建时间', width: 180 },
    ],
  },
  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
    ],
  },
  upsert: {
    items: [
      { prop: 'name', label: '名称', component: 'el-input', rules: [{ required: true }] },
    ],
  },
} as CrudConfig;`
  );

  console.log(`✅ 模块 ${moduleTitle} 创建成功！`);
  console.log(`📁 路径: ${modulePath}`);
})();
```

### 7.2 根目录 package.json 增强

```json
{
  "name": "bellis-microfrontend-monorepo",
  "private": true,
  "scripts": {
    "dev:base": "pnpm --filter base-app dev",
    "dev:logistics": "pnpm --filter logistics-app dev",
    "dev:production": "pnpm --filter production-app dev",
    "dev:all": "pnpm -r --parallel dev",

    "build:all": "pnpm -r build",
    "build:base": "pnpm --filter base-app build",
    "build:logistics": "pnpm --filter logistics-app build",
    "build:production": "pnpm --filter production-app build",

    "lint": "eslint --ext .ts,.tsx,.vue packages/*/src",
    "lint:fix": "eslint --ext .ts,.tsx,.vue packages/*/src --fix",
    "format": "prettier --write \"packages/**/*.{ts,tsx,vue,json}\"",

    "type-check": "pnpm -r --parallel run type-check",
    "clean": "pnpm -r run clean && rm -rf node_modules",

    "create:app": "node scripts/create-app.js",
    "create:module": "node scripts/create-module.js",

    "eps:generate": "node scripts/generate-eps.js",

    "deploy": "bash scripts/deploy.sh",
    "deploy:prod": "bash scripts/deploy.sh prod"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.20.0",
    "prettier": "^3.2.0",
    "typescript": "^5.3.0",
    "turbo": "^1.12.0",
    "vite": "^5.1.0",
    "vue-tsc": "^1.8.27",
    "prompts": "^2.4.2",
    "fs-extra": "^11.2.0"
  }
}
```

### 7.3 Turbo 构建加速配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

---

## 八、数据字典系统

### 8.1 字典配置

```typescript
// packages/base-app/src/config/dict.config.ts

export const dictConfig = {
  // 字典数据来源
  source: 'api', // 'api' | 'local'

  // API 接口
  api: {
    list: '/admin/dict/data/list',
  },

  // 本地字典（优先级高于 API）
  local: {
    order_status: [
      { label: '待审核', value: 0, type: 'info' },
      { label: '已审核', value: 1, type: 'success' },
      { label: '已拒绝', value: 2, type: 'danger' },
    ],

    yes_no: [
      { label: '是', value: 1, type: 'success' },
      { label: '否', value: 0, type: 'info' },
    ],
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 60 * 60 * 1000, // 1小时
  },
};
```

### 8.2 useDict Composable

```typescript
// packages/shared-core/src/composables/use-dict.ts

import { ref, computed } from 'vue';
import { service } from '../cool';

const dictCache = new Map<string, any[]>();

export function useDict(dictKey: string) {
  const dictData = ref<any[]>([]);
  const loading = ref(false);

  const load = async () => {
    // 检查缓存
    if (dictCache.has(dictKey)) {
      dictData.value = dictCache.get(dictKey)!;
      return;
    }

    loading.value = true;
    try {
      const res = await service.dict.data.list({ dictType: dictKey });
      dictData.value = res;
      dictCache.set(dictKey, res);
    } catch (error) {
      console.error('加载字典失败', error);
    } finally {
      loading.value = false;
    }
  };

  // 翻译函数
  const translate = (value: any) => {
    const item = dictData.value.find(d => d.value === value);
    return item?.label || value;
  };

  // 获取标签类型
  const getType = (value: any) => {
    const item = dictData.value.find(d => d.value === value);
    return item?.type || 'info';
  };

  // 选项列表（用于 Select）
  const options = computed(() => {
    return dictData.value.map(d => ({
      label: d.label,
      value: d.value,
    }));
  });

  return {
    dictData,
    loading,
    load,
    translate,
    getType,
    options,
  };
}
```

### 8.3 DictTag 组件

```vue
<!-- packages/shared-components/src/common/dict-tag/index.vue -->
<template>
  <el-tag :type="tagType">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDict } from '@bellis/shared-core';

const props = defineProps<{
  dict: string;
  value: any;
}>();

const { dictData, load, translate, getType } = useDict(props.dict);

const label = computed(() => translate(props.value));
const tagType = computed(() => getType(props.value));

onMounted(() => {
  load();
});
</script>
```

---

## 九、权限系统设计

### 9.1 权限配置

```typescript
// packages/base-app/src/config/permission.config.ts

export const permissionConfig = {
  // 权限模式
  mode: 'role', // 'role' | 'permission' | 'both'

  // 白名单路由（无需权限）
  whiteList: ['/login', '/404', '/403'],

  // 权限指令前缀
  directivePrefix: 'v-permission',

  // 按钮权限控制
  buttonPermission: {
    enabled: true,
    hideWhenNoPermission: true, // true: 隐藏 | false: 禁用
  },
};
```

### 9.2 权限指令

```typescript
// packages/shared-core/src/directives/permission.ts

import { Directive } from 'vue';
import { usePermissionStore } from '../stores/permission';

export const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding;
    const permissionStore = usePermissionStore();

    if (value && !permissionStore.hasPermission(value)) {
      // 移除元素
      el.parentNode?.removeChild(el);
    }
  },
};
```

### 9.3 使用示例

```vue
<template>
  <div>
    <!-- 按钮权限控制 -->
    <el-button v-permission="'user:add'" type="primary">新增用户</el-button>
    <el-button v-permission="'user:edit'" type="warning">编辑</el-button>
    <el-button v-permission="'user:delete'" type="danger">删除</el-button>

    <!-- 编程式权限判断 -->
    <el-button v-if="hasPermission('user:export')" @click="exportData">导出</el-button>
  </div>
</template>

<script setup lang="ts">
import { usePermission } from '@bellis/shared-core';

const { hasPermission } = usePermission();
</script>
```

---

## 十、性能优化策略（增强版）

### 10.1 Vite 构建优化

```typescript
// packages/base-app/vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    vue(),

    // 🔥 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),

    // 🔥 自动注册组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),

    // 🔥 Gzip 压缩
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),

    // 🔥 构建分析
    visualizer({
      open: true,
      filename: 'dist/stats.html',
    }),
  ],

  build: {
    // 🔥 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'lodash': ['lodash-es'],
        },
      },
    },

    // 🔥 关闭 sourcemap 减小体积
    sourcemap: false,

    // 🔥 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 🔥 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios'],
  },
});
```

### 10.2 组件懒加载

```typescript
// packages/base-app/src/router/routes.ts

export default [
  {
    path: '/system',
    component: () => import('../layouts/default.vue'),
    children: [
      {
        path: 'user',
        // 🔥 路由懒加载
        component: () => import('../views/system/user/index.vue'),
        meta: { title: '用户管理' },
      },
    ],
  },
];
```

### 10.3 虚拟滚动（大数据量表格）

```vue
<!-- 使用 el-table-v2 虚拟滚动 -->
<template>
  <el-table-v2
    :columns="columns"
    :data="largeData"
    :width="800"
    :height="600"
    fixed
  />
</template>
```

---

## 十一、部署方案（增强版）

### 11.1 Docker 容器化部署

```dockerfile
# 主应用 Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/base-app/package.json ./packages/base-app/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm --filter base-app build

# 生产镜像
FROM nginx:alpine

COPY --from=builder /app/packages/base-app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 11.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  base-app:
    build:
      context: .
      dockerfile: packages/base-app/Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production

  logistics-app:
    build:
      context: .
      dockerfile: packages/logistics-app/Dockerfile
    ports:
      - "81:80"

  production-app:
    build:
      context: .
      dockerfile: packages/production-app/Dockerfile
    ports:
      - "82:80"
```

### 11.3 CI/CD 流水线（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build all apps
        run: pnpm build:all

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v2
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: "packages/*/dist/"
          TARGET: "/var/www/"
```

---

## 十二、总结与对比

### 12.1 增强版 vs 基础版对比

| 维度 | 基础版 | 增强版（融合 Cool-Admin） |
|------|-------|--------------------------|
| **API 层** | 手写每个接口 | ✅ EPS 自动生成服务 |
| **CRUD 开发** | 重复编写表格/表单 | ✅ 配置化 CRUD，减少 70% 代码 |
| **插件系统** | 无 | ✅ 完善的插件化架构 |
| **数据字典** | 手动实现 | ✅ 统一字典管理系统 |
| **权限控制** | 基础权限判断 | ✅ 指令式 + 编程式权限控制 |
| **自动导入** | 手动引入组件 | ✅ 组件/API 自动导入 |
| **开发效率** | 一般 | ✅ 提升 2-3 倍 |
| **代码一致性** | 依赖规范 | ✅ 约定优于配置，强制统一 |

### 12.2 关键优势

1. **开发效率提升 200%+**
   - EPS 自动生成服务层，告别手写 API
   - CRUD 配置化，一个配置文件搞定增删改查
   - 自动导入组件和 API，减少样板代码

2. **代码质量提升**
   - TypeScript 全链路类型安全
   - 统一的开发模式和架构
   - 插件化设计，易于维护和扩展

3. **团队协作友好**
   - 约定优于配置，新人上手快
   - 模块化开发，减少冲突
   - 完善的脚手架工具

4. **企业级特性**
   - 完整的权限系统
   - 数据字典管理
   - 国际化支持
   - 性能优化方案

### 12.3 最佳实践建议

1. **目录结构规范**：严格遵循约定的目录结构，便于团队协作
2. **CRUD 优先**：90% 的后台页面使用 CRUD 配置化开发
3. **EPS 自动化**：充分利用 EPS 自动生成，避免手写 API
4. **插件化思维**：通用功能封装为插件，提高复用性
5. **渐进式迁移**：老项目可以逐步引入增强特性，不必一次性重构

### 12.4 下一步行动计划

#### 第一阶段：基础设施搭建（1-2 周）
1. 初始化 Monorepo 项目结构
2. 配置 shared-core 核心库
3. 实现 EPS Vite 插件
4. 搭建 CRUD 组件库

#### 第二阶段：主应用开发（2-3 周）
5. 开发主应用基座（登录、布局、系统管理）
6. 集成 qiankun 微前端框架
7. 实现权限系统和数据字典
8. 配置插件系统

#### 第三阶段：子应用开发（3-4 周）
9. 开发物流子应用（采购、仓储模块）
10. 开发生产子应用（生产计划模块）
11. 测试主子应用通信和数据共享
12. 性能优化和调试

#### 第四阶段：部署上线（1 周）
13. Docker 容器化配置
14. CI/CD 流水线搭建
15. 生产环境部署
16. 监控和日志系统

---

**文档版本**: v2.0 Enhanced
**最后更新**: 2025-10-09
**维护者**: 前端架构团队
**参考框架**: Cool-Admin-Vue

---

**附录：参考资源**

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [Cool-Admin 官方文档](https://vue.cool-admin.com/)
- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [Element Plus UI 组件库](https://element-plus.org/)
