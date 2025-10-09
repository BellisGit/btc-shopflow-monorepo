# i18n 插件使用指南

## 🎯 微前端中的 i18n 架构

### 架构模式：独立 + 同步

每个应用（主应用和子应用）都有自己的 i18n 实例，通过 qiankun GlobalState 同步语言切换。

## 📋 使用示例

### 1. 主应用（main-app）

```typescript
// main-app/src/main.ts
import { createI18nPlugin } from '@btc/shared-core';
import { initGlobalState } from 'qiankun';

// 创建主应用的 i18n
const i18nPlugin = createI18nPlugin({
  loadFromApi: true,
  apiUrl: '/api/admin/i18n/messages',
  scope: 'common', // 加载通用翻译
  messages: {
    'zh-CN': {
      main: { title: 'BTC 微前端系统' },
    },
  },
});

app.use(i18nPlugin);

// 初始化 qiankun 全局状态
const actions = initGlobalState({
  locale: i18nPlugin.i18n.global.locale.value,
});

// 监听语言切换，同步到子应用
watch(i18nPlugin.i18n.global.locale, (newLocale) => {
  actions.setGlobalState({ locale: newLocale });
});
```

### 2. 子应用（logistics-app）

```typescript
// logistics-app/src/main.ts
import { createI18nPlugin } from '@btc/shared-core';

let i18nInstance: any = null;

export async function mount(props: any) {
  const { container, onGlobalStateChange } = props;

  // 创建物流应用的 i18n（独立实例）
  const i18nPlugin = createI18nPlugin({
    loadFromApi: true,
    apiUrl: '/api/admin/i18n/messages',
    scope: 'logistics', // 加载物流域翻译
    messages: {
      'zh-CN': {
        logistics: {
          order: '订单',
          warehouse: '仓库',
          procurement: '采购',
          inbound: '入库',
          outbound: '出库',
        },
      },
      'en-US': {
        logistics: {
          order: 'Order',
          warehouse: 'Warehouse',
          procurement: 'Procurement',
          inbound: 'Inbound',
          outbound: 'Outbound',
        },
      },
    },
  });

  i18nInstance = i18nPlugin.i18n;
  app.use(i18nPlugin);

  // 监听主应用的语言切换
  onGlobalStateChange?.((state: any) => {
    if (state.locale && state.locale !== i18nInstance.global.locale.value) {
      i18nInstance.global.locale.value = state.locale;
    }
  }, true);

  app.mount(container);
}
```

### 3. 子应用（production-app）

```typescript
// production-app/src/main.ts
const i18nPlugin = createI18nPlugin({
  loadFromApi: true,
  apiUrl: '/api/admin/i18n/messages',
  scope: 'production', // 加载生产域翻译
  messages: {
    'zh-CN': {
      production: {
        plan: '生产计划',
        schedule: '排期',
        material: '物料',
        workstation: '工位',
      },
    },
  },
});
```

## 🔄 工作流程

### 首次访问

```
1. 主应用初始化
   ├─ 本地语言包（zh-CN.ts）→ 立即显示
   ├─ API: /api/admin/i18n/messages?locale=zh-CN&scope=common
   └─ 缓存: i18n_common_zh-CN

2. 用户点击"物流管理"
   ├─ 加载 logistics-app
   ├─ 本地语言包 + logistics 自定义
   ├─ API: /api/admin/i18n/messages?locale=zh-CN&scope=logistics
   └─ 缓存: i18n_logistics_zh-CN

3. 用户切换到"生产管理"
   ├─ 加载 production-app
   ├─ API: /api/admin/i18n/messages?locale=zh-CN&scope=production
   └─ 缓存: i18n_production_zh-CN
```

### 语言切换

```
1. 用户在主应用切换语言（zh-CN → en-US）
   ↓
2. 主应用
   ├─ i18n.global.locale = 'en-US'
   ├─ setGlobalState({ locale: 'en-US' })
   └─ API: /api/admin/i18n/messages?locale=en-US&scope=common
   ↓
3. 当前激活的子应用（logistics-app）
   ├─ 监听到 GlobalState 变化
   ├─ i18n.global.locale = 'en-US'
   └─ API: /api/admin/i18n/messages?locale=en-US&scope=logistics
```

## 📦 后端 API 设计

### 接口规范

```
GET /api/admin/i18n/messages?locale={locale}&scope={scope}
```

**参数**：

- `locale`: zh-CN | en-US | ja-JP
- `scope`: common | logistics | production | warehouse

**响应**：

```json
{
  "code": 2000,
  "msg": "操作成功",
  "data": {
    "currentLanguage": "zh_CN",
    "currentLocale": "zh_CN",
    "messages": {
      "button.add.new": "新增",
      "sys.menu.update.success": "菜单更新成功",
      "logistics.order.create": "创建订单",
      "logistics.warehouse.select": "选择仓库"
    }
  }
}
```

### 后端表设计示例

```sql
CREATE TABLE sys_i18n (
  id BIGINT PRIMARY KEY,
  i18n_key VARCHAR(200),      -- 如: logistics.order.create
  locale VARCHAR(10),          -- 如: zh_CN
  value TEXT,                  -- 如: 创建订单
  scope VARCHAR(50),           -- 如: logistics
  INDEX idx_locale_scope (locale, scope)
);
```

## 🎯 缓存策略

### localStorage 缓存结构

```javascript
localStorage:
  i18n_common_zh-CN: { "button.save": "保存", ... }
  i18n_common_en-US: { "button.save": "Save", ... }
  i18n_logistics_zh-CN: { "logistics.order": "订单", ... }
  i18n_logistics_en-US: { "logistics.order": "Order", ... }
  i18n_production_zh-CN: { "production.plan": "计划", ... }
  locale: "zh-CN"
```

**优点**：

- ✅ 分域缓存，互不干扰
- ✅ 通用翻译（common）所有应用共享
- ✅ 域级翻译按需加载
- ✅ 1 天过期，自动更新

## 📊 数据流图

```
┌─────────────────────────────────────────────┐
│              主应用 (main-app)                │
│  i18n: scope=common                         │
│  GlobalState: { locale: 'zh-CN' }           │
└──────────────┬──────────────────────────────┘
               │ 语言切换
               ├─────────────┬─────────────┐
               ↓             ↓             ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ logistics-app    │ │production-app│ │warehouse-app │
│ scope=logistics  │ │scope=productn│ │scope=warehse │
│ 监听 GlobalState │ │监听GlobalState│ │监听GlobalState│
└──────────────────┘ └──────────────┘ └──────────────┘
       独立 i18n         独立 i18n        独立 i18n
```

## ✅ 最佳实践

### DO ✅

- ✅ 每个应用独立创建 i18n 实例
- ✅ 使用 scope 隔离域级翻译
- ✅ 通过 GlobalState 同步语言
- ✅ 缓存分域存储

### DON'T ❌

- ❌ 不要共享 i18n 实例（耦合太高）
- ❌ 不要在子应用中修改主应用的语言
- ❌ 不要全量加载所有域的翻译

---

**总结**：每个应用独立但协同，通过 GlobalState 同步，通过 scope 隔离！
