# TypeScript 类型错误统计汇总

生成时间: 2025/12/17 13:48:49

## 总体统计

- **总应用数**: 12
- **有错误的应用数**: 10
- **总错误数**: 266

## 应用错误统计

| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ production-app | 55 | 27 | TS2614:25, TS2305:19, TS2339:6, TS2307:2, TS2353:2, TS7006:1 | [production_app_errors.log](./production_app_errors.log) |
| ❌ finance-app | 36 | 15 | TS2614:27, TS2305:3, TS2307:2, TS2353:2, TS7006:1, TS2339:1 | [finance_app_errors.log](./finance_app_errors.log) |
| ❌ logistics-app | 33 | 12 | TS2339:15, TS2305:14, TS2558:4 | [logistics_app_errors.log](./logistics_app_errors.log) |
| ❌ system-app | 27 | 22 | TS2305:24, TS7006:1, TS2578:1, TS2307:1 | [system_app_errors.log](./system_app_errors.log) |
| ❌ admin-app | 24 | 11 | TS2307:16, TS2339:5, TS2305:3 | [admin_app_errors.log](./admin_app_errors.log) |
| ❌ quality-app | 20 | 11 | TS2305:13, TS2558:4, TS7006:2, TS2578:1 | [quality_app_errors.log](./quality_app_errors.log) |
| ❌ layout-app | 12 | 9 | TS2305:8, TS7016:3, TS2307:1 | [layout_app_errors.log](./layout_app_errors.log) |
| ❌ monitor-app | 10 | 5 | TS2305:5, TS7006:3, TS6307:2 | [monitor_app_errors.log](./monitor_app_errors.log) |
| ❌ engineering-app | 6 | 4 | TS2305:5, TS2339:1 | [engineering_app_errors.log](./engineering_app_errors.log) |
| ✅ mobile-app | 0 | 0 | - | [mobile_app_errors.log](./mobile_app_errors.log) |
| ✅ docs-site-app | 0 | 0 | - | [docs_site_app_errors.log](./docs_site_app_errors.log) |

## 共享包错误统计（合并）

| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ packages (合并) | 43 | 31 | TS2305:24, TS7006:10, TS6059:4, TS6307:4, TS2538:1 | [packages_errors.log](./packages_errors.log) |

## 错误代码汇总

| 错误代码 | 总数 | 说明 |
|---------|------|------|
| TS2305 | 118 | 未知错误 |
| TS2614 | 52 | 未知错误 |
| TS2339 | 28 | 属性不存在 |
| TS2307 | 22 | 无法找到模块或其类型声明 |
| TS7006 | 18 | 隐式 any 类型 |
| TS2558 | 8 | 未知错误 |
| TS6307 | 6 | 文件未在项目文件列表中 |
| TS2353 | 4 | 未知错误 |
| TS6059 | 4 | 未知错误 |
| TS7016 | 3 | 未知错误 |
| TS2578 | 2 | 未使用的 @ts-expect-error 指令 |
| TS2538 | 1 | 未知错误 |
