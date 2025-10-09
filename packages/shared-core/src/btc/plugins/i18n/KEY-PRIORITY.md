# i18n Key 优先级和冲突处理

## 🎯 相同 Key 的工作机制

### 场景说明

假设 `button.save` 这个 key 在多个地方都定义了。

## 📊 优先级规则

### 规则 1：同一应用内的优先级

```
应用自定义 (options.messages)    ← 最高优先级 ⭐⭐⭐
    ↓ 覆盖
API 远程 (scope=xxx)             ← 中等优先级 ⭐⭐
    ↓ 覆盖
本地默认 (zh-CN.ts)              ← 兜底优先级 ⭐
```

### 规则 2：不同应用间完全隔离

**主应用和子应用是独立的 i18n 实例，不会冲突！**

```
主应用 (main-app)
├─ i18n 实例 1
└─ $t('button.save') = "保存"

子应用 (logistics-app)
├─ i18n 实例 2（独立的）
└─ $t('button.save') = "保存订单"
```

## 📋 完整示例

### 示例 1：子应用内的 Key 合并

**物流应用（logistics-app）**：

```typescript
createI18nPlugin({
  loadFromApi: true,
  apiUrl: '/api/admin/i18n/messages',
  scope: 'logistics',
  messages: {
    'zh-CN': {
      'button.save': '确认保存订单', // 3️⃣ 应用自定义
    },
  },
});
```

**数据源**：

```typescript
// 1️⃣ 本地默认（zh-CN.ts）
{
  "button.save": "保存"
}

// 2️⃣ API 返回（scope=logistics）
GET /api/i18n?locale=zh-CN&scope=logistics
→ {
  "button.save": "保存订单",
  "logistics.order": "订单"
}

// 3️⃣ 应用自定义（options.messages）
{
  "button.save": "确认保存订单"
}
```

**合并过程**：

```javascript
// 初始化
messages = {
  "button.save": "保存"  // 1️⃣ 本地
}

// API 加载后
mergeLocaleMessage({
  "button.save": "保存订单",  // 2️⃣ API 覆盖
  "logistics.order": "订单"
})
→ "button.save" = "保存订单"

// 应用自定义再次合并
mergeLocaleMessage({
  "button.save": "确认保存订单"  // 3️⃣ 应用自定义覆盖
})
→ "button.save" = "确认保存订单" ✅ 最终结果
```

**最终**：`$t('button.save')` = **"确认保存订单"** ✅

### 示例 2：跨应用的 Key 隔离

**场景**：主应用和子应用都有 `button.save`

```typescript
// ========== 主应用 ==========
createI18nPlugin({ scope: 'common' })

// 合并后：
{
  "button.save": "保存"  // 来自 API scope=common
}

// 显示
$t('button.save')  →  "保存"


// ========== 物流应用 ==========
createI18nPlugin({
  scope: 'logistics',
  messages: {
    'zh-CN': { 'button.save': '保存订单' }
  }
})

// 合并后：
{
  "button.save": "保存订单"  // 来自应用自定义（覆盖了本地和API）
  "logistics.order": "订单"  // 来自 API scope=logistics
}

// 显示
$t('button.save')  →  "保存订单"
```

**结果**：

- 主应用显示："保存"
- 物流应用显示："保存订单"
- **互不影响** ✅

## 🎯 推荐的 Key 命名规范

### 避免冲突的最佳实践

#### ✅ 使用命名空间

```typescript
// 本地默认（通用）
{
  "common.button.save": "保存",
  "common.button.delete": "删除"
}

// API 返回（域级）
{
  "logistics.button.save": "保存订单",
  "logistics.order.create": "创建订单"
}

// 应用自定义（特殊）
{
  "app.button.save": "确认保存",
  "app.custom.action": "自定义操作"
}
```

#### ❌ 避免扁平化 Key

```typescript
// 不推荐
{
  "save": "保存",          // 太短，容易冲突
  "delete": "删除",
}

// 推荐
{
  "common.save": "保存",    // 带命名空间
  "common.delete": "删除",
}
```

## 📐 域级隔离策略

### 后端 API 设计

```sql
-- 数据库表设计
CREATE TABLE sys_i18n (
  id BIGINT PRIMARY KEY,
  i18n_key VARCHAR(200),
  locale VARCHAR(10),
  value TEXT,
  scope VARCHAR(50),          -- ← 关键字段
  domain VARCHAR(50),         -- 所属域
  INDEX idx_scope_locale (scope, locale)
);

-- 数据示例
INSERT INTO sys_i18n VALUES
  (1, 'common.button.save', 'zh_CN', '保存', 'common', NULL),
  (2, 'common.button.save', 'en_US', 'Save', 'common', NULL),
  (3, 'logistics.order.create', 'zh_CN', '创建订单', 'logistics', 'logistics'),
  (4, 'production.plan.create', 'zh_CN', '创建计划', 'production', 'production');
```

### API 查询

```javascript
// 主应用请求
GET /api/i18n?locale=zh-CN&scope=common
→ SELECT * FROM sys_i18n WHERE scope='common' AND locale='zh_CN'
→ 返回：{ "common.button.save": "保存" }

// 物流应用请求
GET /api/i18n?locale=zh-CN&scope=logistics
→ SELECT * FROM sys_i18n WHERE scope='logistics' AND locale='zh_CN'
→ 返回：{ "logistics.order.create": "创建订单" }
```

## ✅ 最终优先级总结

### 在同一个应用内

```
1. 本地默认: { "button.save": "保存" }
2. API 远程: { "button.save": "保存订单" }      ← 覆盖本地
3. 应用自定义: { "button.save": "确认保存" }    ← 覆盖 API ✅ 最终生效
```

### 跨应用隔离

```
主应用 → 独立 i18n 实例 → "保存"
物流应用 → 独立 i18n 实例 → "保存订单"
生产应用 → 独立 i18n 实例 → "保存计划"
```

**完全隔离，互不影响！** ✅

## 🎯 实际使用建议

### 最佳实践

1. **通用 UI 文案**：使用 `common.*` 前缀，scope=common
2. **域级业务术语**：使用 `{domain}.*` 前缀，scope=domain
3. **应用特殊需求**：通过 options.messages 硬编码

### 示例

```typescript
// 物流应用
createI18nPlugin({
  scope: 'logistics',
  messages: {
    'zh-CN': {
      // 仅用于覆盖或临时翻译
      'app.special.action': '特殊操作',
    },
  },
});

// 组件中使用
$t('common.button.save'); // "保存" (来自 common)
$t('logistics.order.create'); // "创建订单" (来自 logistics API)
$t('app.special.action'); // "特殊操作" (来自应用自定义)
```

---

**答案：相同 key 在同一应用内按优先级覆盖，在不同应用间完全隔离！** ✅
