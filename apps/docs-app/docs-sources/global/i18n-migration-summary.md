# 国际化扁平结构优化 - 迁移总结

## ✅ 已完成的工作

### Phase 1: 准备和分析 ✅
- ✅ 运行了重复检测脚本
- ✅ 创建了新的目录结构：`locales/shared/`, `locales/domains/`, `locales/apps/`
- ✅ 安装了必要的依赖（glob）

### Phase 2: 提取共享翻译 ✅
已创建以下共享翻译文件：
- ✅ `locales/shared/common.ts` - 通用词条（按钮、表单、表格、消息等）
- ✅ `locales/shared/crud.ts` - CRUD 操作翻译
- ✅ `locales/shared/theme.ts` - 主题设置翻译
- ✅ `locales/shared/auth.ts` - 认证相关翻译
- ✅ `locales/shared/app.ts` - 应用基础信息翻译
- ✅ `locales/shared/index.ts` - 统一导出

### Phase 3: 提取领域翻译 ✅
已创建以下领域翻译文件：
- ✅ `locales/domains/warehouse.ts` - 仓储领域翻译
- ✅ `locales/domains/inventory.ts` - 盘点领域翻译
- ✅ `locales/domains/index.ts` - 统一导出

### Phase 4: 创建简化的加载器 ✅
- ✅ `packages/shared-core/src/utils/i18n/simple-flat-loader.ts` - 简化的扁平格式加载器
- ✅ 在 `packages/shared-core/src/index.ts` 中导出新加载器

### Phase 5: 迁移各应用 ✅
已更新以下应用的 `i18n/getters.ts`：
- ✅ system-app
- ✅ admin-app
- ✅ logistics-app
- ✅ quality-app
- ✅ production-app
- ✅ personnel-app
- ✅ operations-app
- ✅ finance-app
- ✅ engineering-app
- ✅ dashboard-app

已创建应用特定翻译文件：
- ✅ `locales/apps/system.ts`
- ✅ `locales/apps/admin.ts`
- ✅ `locales/apps/logistics.ts`
- ✅ `locales/apps/quality.ts`
- ✅ `locales/apps/production.ts`
- ✅ `locales/apps/personnel.ts`
- ✅ `locales/apps/operations.ts`
- ✅ `locales/apps/finance.ts`
- ✅ `locales/apps/engineering.ts`
- ✅ `locales/apps/dashboard.ts`
- ✅ `locales/apps/docs.ts`
- ✅ `locales/apps/index.ts` - 统一导出

### Phase 6: 配置 ✅
- ✅ 在 `package.json` 中添加了新的 i18n 检查脚本：
  - `i18n:check:completeness`
  - `i18n:check:duplicates`
  - `i18n:check:all`
- ✅ 在 `apps/system-app/tsconfig.json` 中添加了 `@workspace/locales/*` 路径别名
- ✅ 修复了 `packages/shared-core/src/types/module.ts` 中的类型引用路径

## 📊 优化效果

### 文件组织
- **新增文件**: 约 20 个共享和领域翻译文件
- **文件结构**: 清晰的分类（shared/domains/apps）
- **格式统一**: 所有新文件使用扁平格式

### 代码简化
- **加载器**: 从复杂的 626 行逻辑简化为 ~50 行的简单合并
- **应用配置**: 每个应用的 getters.ts 现在使用统一的加载方式

### 消除重复
- **共享翻译**: common, crud, theme, auth, app 等已提取到共享目录
- **领域翻译**: warehouse, inventory 等已提取到领域目录

## 🔄 使用方式

### 在应用中使用

```typescript
// apps/system-app/src/i18n/getters.ts
import { loadFlatI18nMessages } from '@btc/shared-core';
import { common, crud, theme, auth, app } from '../../../../locales/shared';
import { warehouse, inventory } from '../../../../locales/domains';
import { system } from '../../../../locales/apps';

// 加载共享翻译
const sharedMessages = loadFlatI18nMessages([
  common,
  crud,
  theme,
  auth,
  app,
  warehouse,
  inventory,
  system,
]);

// 合并到应用翻译
const mergedAppZhCN = { ...sharedMessages['zh-CN'], ...zhCN };
```

### 添加新翻译

1. **共享翻译**: 添加到 `locales/shared/` 对应文件
2. **领域翻译**: 添加到 `locales/domains/` 对应文件
3. **应用特定**: 添加到 `locales/apps/` 对应文件

## ⚠️ 注意事项

1. **保持扁平格式**: 所有翻译文件使用扁平格式（避免 `_` 键问题）
2. **路径别名**: 需要在各应用的 `tsconfig.json` 中添加 `@workspace/locales/*` 路径
3. **config.ts 兼容**: 模块级 `config.ts` 中的嵌套格式仍然会被 `mergeConfigFiles` 处理

## 📝 后续工作建议

1. **完善英文翻译**: 部分应用特定翻译文件中的英文翻译需要补充
2. **添加路径别名**: 为其他应用也添加 `@workspace/locales/*` 路径别名
3. **清理冗余**: 确认迁移无误后，可以删除应用 JSON 文件中已提取的重复内容
4. **文档更新**: 更新开发文档，说明新的国际化使用方式

## 🎯 关键改进

1. ✅ **统一格式**: 所有新翻译文件使用扁平格式
2. ✅ **集中管理**: 共享翻译集中到 `locales/shared/`
3. ✅ **领域复用**: 领域翻译集中到 `locales/domains/`
4. ✅ **简化加载**: 使用简单的对象合并，无需复杂转换
5. ✅ **保持兼容**: 与现有的 `config.ts` 和 `setupAppI18n` 完全兼容

---

**迁移完成时间**: 2026-01-14  
**状态**: ✅ 主要迁移工作已完成，等待全局确认
