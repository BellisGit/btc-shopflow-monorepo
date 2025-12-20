# TypeScript 类型错误统计汇总

生成时间: 2025/12/20 09:55:17

## 总体统计

- **总应用数**: 12
- **有错误的应用数**: 4
- **总错误数**: 41

## 应用错误统计

| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ production-app | 11 | 2 | TS6307:10, TS2305:1 | [production_app_errors.txt](./production_app_errors.txt) |
| ❌ monitor-app | 11 | 2 | TS6307:10, TS2305:1 | [monitor_app_errors.txt](./monitor_app_errors.txt) |
| ❌ finance-app | 10 | 1 | TS6307:10 | [finance_app_errors.txt](./finance_app_errors.txt) |
| ❌ engineering-app | 9 | 1 | TS6307:9 | [engineering_app_errors.txt](./engineering_app_errors.txt) |
| ✅ admin-app | 0 | 0 | - | [admin_app_errors.txt](./admin_app_errors.txt) |
| ✅ logistics-app | 0 | 0 | - | [logistics_app_errors.txt](./logistics_app_errors.txt) |
| ✅ system-app | 0 | 0 | - | [system_app_errors.txt](./system_app_errors.txt) |
| ✅ quality-app | 0 | 0 | - | [quality_app_errors.txt](./quality_app_errors.txt) |
| ✅ layout-app | 0 | 0 | - | [layout_app_errors.txt](./layout_app_errors.txt) |
| ✅ mobile-app | 0 | 0 | - | [mobile_app_errors.txt](./mobile_app_errors.txt) |
| ✅ docs-site-app | 0 | 0 | - | [docs_site_app_errors.txt](./docs_site_app_errors.txt) |

## 共享包错误统计（合并）

| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ✅ packages (合并) | 0 | 0 | - | [packages_errors.txt](./packages_errors.txt) |

## 错误代码汇总

| 错误代码 | 总数 | 官方含义 |
|---------|------|----------|
| TS6307 | 39 | 文件未在 tsconfig.json 的项目文件列表中 |
| TS2305 | 2 | 模块/命名空间中不存在指定的导出成员 |

## 错误代码详细说明与解决方案

> 参考: [TypeScript 错误代码官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html)

### TS6307

**官方含义**: 文件未在 `tsconfig.json` 的项目文件列表中

**高频触发原因**:
- 文件路径不在 `include` 范围内
- 文件被 `exclude` 字段排除
- `files` 字段未显式包含该文件

**针对性解决方案**:
- 调整 `include` 覆盖目标文件（`["src/**/*", "types/**/*"]`）
- 检查 `exclude` 是否误排除（如排除了 `src/utils`）

### TS2305

**官方含义**: 模块/命名空间中不存在指定的导出成员（如导入了未导出的变量/类型/函数）

**高频触发原因**:
- 导入成员名称拼写/大小写错误
- 模块导出语法错误（默认/命名导出混淆）
- 第三方库类型声明缺失导出成员

**针对性解决方案**:
- 核对模块实际导出的成员名（如 `export const fn` 而非 `export default fn`）
- 为第三方库补全 `.d.ts` 声明
- 检查导入路径是否指向正确模块

