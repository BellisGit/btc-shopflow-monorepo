# i18n Key 命名规范

## 🎯 核心原则

**全局 Key 唯一 + 命名空间隔离**

## 📐 命名规范

### 格式

```
{namespace}.{category}.{key}
```

### 命名空间定义

| 命名空间       | 用途         | 示例                      |
| -------------- | ------------ | ------------------------- |
| `common.*`     | 通用 UI 文案 | common.button.save        |
| `sys.*`        | 系统级功能   | sys.user.login            |
| `logistics.*`  | 物流域       | logistics.order.create    |
| `production.*` | 生产域       | production.plan.create    |
| `warehouse.*`  | 仓储域       | warehouse.inventory.check |

## ✅ 正确示例

### 本地语言包

```typescript
// zh-CN.ts（扁平化结构）
export default {
  // 通用按钮
  'common.button.save': '保存',
  'common.button.delete': '删除',

  // 系统消息
  'sys.message.success': '操作成功',
  'sys.message.error': '操作失败',
};
```

### 后端 API 返回

```json
{
  "code": 2000,
  "data": {
    "messages": {
      "common.button.save": "保存",
      "sys.menu.update.success": "菜单更新成功",
      "logistics.order.create": "创建订单",
      "logistics.order.save": "保存订单",
      "production.plan.create": "创建计划"
    }
  }
}
```

### 应用自定义

```typescript
createI18nPlugin({
  scope: 'logistics',
  messages: {
    'zh-CN': {
      // ✅ 使用完整命名空间
      'logistics.app.special.action': '特殊操作',
      'logistics.module.custom.label': '自定义标签',
    },
  },
});
```

## ❌ 错误示例

```typescript
// ❌ 不要使用嵌套对象
export default {
  common: {
    save: '保存'  // 会被展平为 'common.save'，但不明确
  }
}

// ❌ 不要使用短 key
{
  "save": "保存",         // 太短，易冲突
  "delete": "删除"
}

// ❌ 不要重复定义相同 key
// 主应用
{ "button.save": "保存" }
// 物流应用
{ "button.save": "保存订单" }  // ❌ 应该用 logistics.order.save
```

## 📋 Key 分类规范

### 1. 通用层（common.\*）

适用于所有应用的 UI 元素：

```typescript
'common.button.{action}': 按钮
'common.table.{field}': 表格
'common.form.{field}': 表单
'common.menu.{item}': 菜单
'common.message.{type}': 消息
'common.validation.{rule}': 校验
```

### 2. 系统层（sys.\*）

系统级功能和消息：

```typescript
'sys.user.{field}': 用户相关
'sys.role.{field}': 角色相关
'sys.menu.{field}': 菜单相关
'sys.permission.{field}': 权限相关
'sys.message.{type}': 系统消息
```

### 3. 域层（{domain}.\*）

业务域专属术语：

```typescript
// 物流域
'logistics.order.{field}': 订单
'logistics.warehouse.{field}': 仓库
'logistics.procurement.{field}': 采购

// 生产域
'production.plan.{field}': 计划
'production.schedule.{field}': 排期
'production.material.{field}': 物料
```

## 🎯 使用示例

### 组件中使用

```vue
<template>
  <!-- 通用按钮（所有应用相同） -->
  <el-button>{{ $t('common.button.save') }}</el-button>

  <!-- 域级标题（物流专属） -->
  <h1>{{ $t('logistics.order.title') }}</h1>

  <!-- 系统消息 -->
  <el-message>{{ $t('sys.message.success') }}</el-message>
</template>
```

### API 请求分域

```javascript
// 主应用
GET /api/i18n?locale=zh-CN&scope=common
→ 返回 common.* 和 sys.*

// 物流应用
GET /api/i18n?locale=zh-CN&scope=logistics
→ 返回 logistics.*（不包含 production.*）

// 生产应用
GET /api/i18n?locale=zh-CN&scope=production
→ 返回 production.*（不包含 logistics.*）
```

## 🔑 后端数据库设计

```sql
CREATE TABLE sys_i18n (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  i18n_key VARCHAR(200) NOT NULL COMMENT 'Key（全局唯一）',
  locale VARCHAR(10) NOT NULL COMMENT '语言（zh_CN/en_US）',
  value TEXT NOT NULL COMMENT '翻译值',
  scope VARCHAR(50) NOT NULL COMMENT '范围（common/logistics/production）',
  namespace VARCHAR(50) NOT NULL COMMENT '命名空间（common/sys/logistics）',
  category VARCHAR(50) COMMENT '分类（button/menu/message）',
  description VARCHAR(500) COMMENT '用途说明',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_key_locale (i18n_key, locale),
  INDEX idx_scope_locale (scope, locale),
  INDEX idx_namespace (namespace)
);

-- 数据示例
INSERT INTO sys_i18n (i18n_key, locale, value, scope, namespace, category) VALUES
  ('common.button.save', 'zh_CN', '保存', 'common', 'common', 'button'),
  ('common.button.save', 'en_US', 'Save', 'common', 'common', 'button'),
  ('logistics.order.create', 'zh_CN', '创建订单', 'logistics', 'logistics', 'order'),
  ('production.plan.create', 'zh_CN', '创建计划', 'production', 'production', 'plan');
```

## ✅ 验证规则

### 开发时检查

```typescript
// 使用 TypeScript 类型安全
type I18nKey =
  | `common.button.${string}`
  | `common.menu.${string}`
  | `sys.${string}`
  | `logistics.${string}`
  | `production.${string}`;

// 使用时有类型提示
$t('common.button.save'); // ✅ 类型正确
$t('save'); // ❌ 类型错误
```

### 后端验证

```javascript
// API 保存时验证 key 格式
function validateI18nKey(key: string): boolean {
  const pattern = /^(common|sys|logistics|production|warehouse)\.[a-z]+\.[a-z_]+$/;
  return pattern.test(key);
}
```

## 🎉 最终规范

### DO ✅

- ✅ 使用扁平化 key：`'common.button.save'`
- ✅ 遵循命名规范：`{namespace}.{category}.{key}`
- ✅ 全局唯一：同一 key 在所有应用中含义相同
- ✅ 按域隔离：通过 scope 控制加载范围

### DON'T ❌

- ❌ 不使用嵌套对象：`{ common: { save: '保存' } }`
- ❌ 不使用短 key：`'save'`, `'delete'`
- ❌ 不重复定义：同一 key 不应有不同含义
- ❌ 不跨域污染：logistics.\* 不应出现在 production 中

---

**遵循此规范，可以保证 Key 全局唯一且易于维护！** ✅
