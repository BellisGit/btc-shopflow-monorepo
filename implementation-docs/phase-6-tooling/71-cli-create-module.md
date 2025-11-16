# 40 - CLI 创建业务模块

> **阶段**: Phase 6 | **时间**: 3小时 | **前置**: 39

## 🎯 任务目标

开发 CLI 工具，快速创建 CRUD 业务模块。

## 📋 执行步骤

### 1. 创建 CLI 脚本

**scripts/create-module.js**:
```javascript
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

(async () => {
  console.log(chalk.blue('📦 创建新的业务模块\n'));

  // 获取所有子应用
  const appsDir = path.join(__dirname, '../packages');
  const apps = (await fs.readdir(appsDir))
    .filter(name => name.endsWith('-app') && name !== 'main-app');

  const response = await prompts([
    {
      type: 'select',
      name: 'app',
      message: '选择子应用',
      choices: apps.map(app => ({ title: app, value: app })),
    },
    {
      type: 'text',
      name: 'moduleName',
      message: '模块名称（如：order-management）',
      validate: value => /^[a-z-]+$/.test(value) || '只能包含小写字母和连字符',
    },
    {
      type: 'text',
      name: 'moduleTitle',
      message: '模块标题（如：订单管理）',
    },
    {
      type: 'text',
      name: 'entityName',
      message: '实体名称（如：order）',
    },
  ]);

  if (!response.moduleName) {
    console.log(chalk.red('❌ 已取消'));
    process.exit(0);
  }

  const { app, moduleName, moduleTitle, entityName } = response;
  const modulePath = path.join(appsDir, app, 'src/modules', moduleName);

  // 创建目录
  await fs.ensureDir(modulePath);

  // 创建 CRUD 配置
  const crudContent = `import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [],
      total: 0,
    }),
    add: async (data: any) => ({}),
    update: async (data: any) => ({}),
    delete: async (params: any) => ({}),
  },

  table: {
    columns: [
      { prop: 'id', label: 'ID', width: 80 },
      { prop: 'name', label: '名称', width: 200 },
      { prop: 'createTime', label: '创建时间', width: 180 },
    ],
  },
} as CrudConfig;
`;

  await fs.writeFile(path.join(modulePath, 'crud.ts'), crudContent);

  // 创建页面
  const pageContent = `<template>
  <div class="${moduleName}-module">
    <h3>${moduleTitle}</h3>
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>

<style scoped>
.${moduleName}-module {
  padding: 20px;
}
</style>
`;

  await fs.writeFile(path.join(modulePath, 'index.vue'), pageContent);

  console.log(chalk.green('\n✅ 模块创建成功！\n'));
  console.log(chalk.yellow('📝 下一步：\n'));
  console.log(`1. 添加路由到 src/router/index.ts：`);
  console.log(chalk.cyan(`
  {
    path: '/${moduleName}',
    component: () => import('../modules/${moduleName}/index.vue'),
  }
  `));
  console.log(`2. 根据需求修改 CRUD 配置：packages/${app}/src/modules/${moduleName}/crud.ts`);
})();
```

### 2. 添加脚本

**package.json**:
```json
{
  "scripts": {
    "create:module": "node scripts/create-module.js"
  }
}
```

## ✅ 验收标准

### 检查：创建模块

```bash
# 运行脚本
pnpm create:module

# 输入信息
选择子应用: logistics-app
模块名称: order-management
模块标题: 订单管理
实体名称: order

# 验证结果
ls packages/logistics-app/src/modules/order-management
# 预期: crud.ts 和 index.vue 存在

# 访问页面
# 预期: 显示订单管理页面
```

## 📝 检查清单

- [ ] CLI 脚本创建
- [ ] 模块目录生成
- [ ] CRUD 配置生成
- [ ] 页面组件生成
- [ ] 脚本添加
- [ ] 模块创建成功

## 🔗 下一步

- [41 - 开发规范文档](./41-dev-guidelines.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

