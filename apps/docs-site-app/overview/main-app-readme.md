---
title: 主应用（Main App）
type: overview
project: admin-app
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- admin-app
- micro-frontend
sidebar_label: 主应用说明
sidebar_order: 4
sidebar_group: overview
---

# 主应用（Main App）

**角色**：微前端架构的主应用（基座应用）+ 系统管理功能

---

## 功能概览

### 系统管理（5大业务模块）

#### 1. 平台治理
- **域管理**：多租户域划分
- **模块管理**：系统功能模块管理
- **插件管理**：可扩展插件管理

#### 2. 组织与账号
- **租户管理**：多租户配置
- **部门管理**：组织架构管理
- **用户管理**：用户账号管理
- **部门角色绑定**：批量绑定部门角色
- **用户角色分配**：为用户分配角色

#### 3. 访问控制
- **资源管理**：系统资源定义
- **行为管理**：操作行为定义
- **权限管理**：资源×行为权限组合
- **角色管理**：角色定义与管理
- **策略管理**：RBAC/ABAC 策略配置
- **角色权限绑定**：为角色分配权限
- **权限组合工具**：批量生成权限（资源×行为）

#### 4. 导航与可见性
- **菜单管理**：系统菜单配置
- **菜单权限绑定**：菜单可见性控制
- **菜单预览**：按用户/角色预览菜单树

#### 5. 运维与审计
- **操作日志**：系统审计日志
- **权限基线**：权限快照与对比
- **策略模拟器**：权限策略测试工具

---

## 目录结构

```
apps/admin-app/
src/
pages/
platform/ # 平台治理
domains/
modules/
plugins/
org/ # 组织与账号
tenants/
departments/
users/
dept-role-bind/
user-role-assign/
access/ # 访问控制
resources/
actions/
permissions/
roles/
policies/
role-perm-bind/
perm-compose/
navigation/ # 导航与可见性
menus/
menu-perm-bind/
menu-preview/
ops/ # 运维与审计
audit/
baseline/
simulator/
layout/ # 布局组件
router/ # 路由配置
store/ # 状态管理
micro/ # 微前端配置
utils/
mock.ts # Mock数据服务
```

---

## 启动方式

### 开发模式

```bash
# 从根目录
cd btc-shopflow-monorepo
pnpm --filter admin-app dev

# 或直接在 admin-app 目录
cd apps/admin-app
pnpm dev
```

访问：http://localhost:8080

### 生产构建

```bash
pnpm --filter admin-app build
```

---

## Mock 数据说明

### 使用 Mock 的页面

以下页面暂时使用 Mock 数据（`utils/mock.ts`）：

**权限相关**（4个）：
- `/access/permissions` - 权限列表
- `/access/policies` - 策略列表
- `/access/role-perm-bind/:id` - 角色权限绑定
- `/navigation/menu-perm-bind/:id` - 菜单权限绑定

**组织绑定**（2个）：
- `/org/dept-role-bind/:id` - 部门角色绑定
- `/org/user-role-assign/:id` - 用户角色分配

**高级功能**（5个）：
- `/access/perm-compose` - 权限组合工具
- `/navigation/menu-preview` - 菜单预览
- `/ops/audit` - 操作日志
- `/ops/baseline` - 权限基线
- `/ops/simulator` - 策略模拟器

### Mock 数据存储

- **位置**：`localStorage`
- **前缀**：`btc_`
- **数据格式**：JSON

### 切换到真实API

只需修改页面的 service 引用：

```typescript
// 从
const service = createMockCrudService('btc_permissions');

// 改为
const service = createCrudService('permission');
```

---

## 相关文档

- [菜单重构ADR](/adr/system/2025-10-12-system-menu-restructure) - 设计决策
- [表单系统完成报告](/changelog/forms-completion-report) - 表单组件
- [全局组件清单](/components/) - 可用组件

---

## 技术栈

- **框架**：Vue 3 + TypeScript + Vite
- **UI组件**：Element Plus
- **微前端**：Qiankun
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **国际化**：@btc/shared-core (i18n插件)
- **CRUD组件**：BtcCrud + BtcUpsert

---

## 页面统计

- **总页面数**：23
- **使用Mock**：11
- **真实API**：12（主要是迁移的原有页面）
- **绑定管理**：4
- **高级工具**：5
