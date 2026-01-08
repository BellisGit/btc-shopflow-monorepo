# TypeScript 类型错误统计汇总

生成时间: 2026/1/7 15:16:35

## 总体统计

- **总应用数**: 16
- **有错误的应用数**: 15
- **总错误数**: 716

## 应用错误统计

| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ layout-app | 140 | 8 | TS1005:44, TS1128:41, TS1136:16, TS1180:13, TS1434:11, TS1109:5, TS1131:5, TS1003:4, TS1011:1 | [layout_app_errors.txt](./layout_app_errors.txt) |
| ❌ system-app | 79 | 41 | TS6133:39, TS2307:12, TS2353:6, TS18048:5, TS2345:4, TS2532:3, TS6196:3, TS2375:2, TS2322:2, TS2305:1, TS2304:1, TS7006:1 | [system_app_errors.txt](./system_app_errors.txt) |
| ❌ docs-app | 67 | 41 | TS2307:67 | [docs_app_errors.txt](./docs_app_errors.txt) |
| ❌ logistics-app | 64 | 35 | TS6133:31, TS2307:7, TS2353:6, TS18048:5, TS2322:3, TS2345:3, TS2532:3, TS6196:3, TS2375:2, TS7006:1 | [logistics_app_errors.txt](./logistics_app_errors.txt) |
| ❌ quality-app | 64 | 35 | TS6133:31, TS2307:8, TS2353:6, TS18048:5, TS2345:3, TS2532:3, TS6196:3, TS2375:2, TS2322:2, TS7006:1 | [quality_app_errors.txt](./quality_app_errors.txt) |
| ❌ mobile-app | 43 | 21 | TS2307:42, TS2345:1 | [mobile_app_errors.txt](./mobile_app_errors.txt) |
| ❌ finance-app | 37 | 15 | TS6133:9, TS2551:6, TS2353:6, TS2322:4, TS6307:3, TS2305:2, TS2375:2, TS2532:1, TS2307:1, TS7006:1, TS18048:1, TS2345:1 | [finance_app_errors.txt](./finance_app_errors.txt) |
| ❌ operations-app | 33 | 15 | TS6133:9, TS2551:6, TS2353:6, TS6307:3, TS2307:2, TS2305:2, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [operations_app_errors.txt](./operations_app_errors.txt) |
| ❌ production-app | 29 | 15 | TS6133:9, TS2353:6, TS2305:3, TS2307:3, TS6307:3, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [production_app_errors.txt](./production_app_errors.txt) |
| ❌ engineering-app | 27 | 14 | TS6133:9, TS2353:6, TS6307:3, TS2305:2, TS2307:2, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [engineering_app_errors.txt](./engineering_app_errors.txt) |
| ❌ personnel-app | 27 | 14 | TS6133:9, TS2353:6, TS6307:3, TS2305:2, TS2307:2, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [personnel_app_errors.txt](./personnel_app_errors.txt) |
| ❌ dashboard-app | 27 | 14 | TS6133:9, TS2353:6, TS6307:3, TS2305:2, TS2307:2, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [dashboard_app_errors.txt](./dashboard_app_errors.txt) |
| ❌ admin-app | 22 | 1 | TS1005:12, TS1128:6, TS1109:3, TS1434:1 | [admin_app_errors.txt](./admin_app_errors.txt) |
| ❌ home-app | 20 | 9 | TS6133:9, TS2353:6, TS2375:2, TS7006:1, TS18048:1, TS2345:1 | [home_app_errors.txt](./home_app_errors.txt) |
| ✅ monitor-app | 0 | 0 | - | [monitor_app_errors.txt](./monitor_app_errors.txt) |

## 共享包错误统计（合并）

| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ packages (合并) | 37 | 23 | TS2305:18, TS2454:5, TS18048:4, TS7006:3, TS2307:1, TS2532:1, TS2379:1, TS2209:1, TS6133:1, TS2322:1, TS2345:1 | [packages_errors.txt](./packages_errors.txt) |

## 错误代码汇总

| 错误代码 | 总数 | 官方含义 |
|---------|------|----------|
| TS6133 | 165 | 未使用的变量 |
| TS2307 | 149 | 无法找到模块或其类型声明 |
| TS2353 | 60 | 不能将类型 X 分配给类型 Y（类型不匹配） |
| TS1005 | 56 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1128 | 47 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2305 | 32 | 模块/命名空间中不存在指定的导出成员 |
| TS18048 | 26 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2375 | 20 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2345 | 19 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS6307 | 18 | 文件未在 tsconfig.json 的项目文件列表中 |
| TS1136 | 16 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS7006 | 13 | 变量隐式具有 any 类型 |
| TS1180 | 13 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1434 | 12 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2322 | 12 | 类型不匹配 |
| TS2551 | 12 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2532 | 11 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS6196 | 9 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1109 | 8 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1131 | 5 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2454 | 5 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1003 | 4 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2304 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS1011 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2379 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2209 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |

## 错误代码详细说明与解决方案

> 参考: [TypeScript 错误代码官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html)

### TS2307

**官方含义**: 无法找到模块或其类型声明

**高频触发原因**:
- 模块路径错误（相对/绝对路径写错）
- 第三方库无 `@types/xxx` 类型包
- 文件不在 `tsconfig.json` 的 `include` 范围内

**针对性解决方案**:
- 校验路径（如 `./utils` 而非 `utils`）
- 安装对应类型包（`npm i @types/lodash -D`）
- 调整 `tsconfig.include` 为 `["src/**/*"]`

### TS2353

**官方含义**: 不能将类型 X 分配给类型 Y（重载参数不匹配/只读属性赋值/联合类型赋值错误）

**高频触发原因**:
- 重载函数调用参数类型不匹配
- 给 `readonly` 属性赋值
- 联合类型赋值未收窄

**针对性解决方案**:
- 核对重载函数的参数类型
- 移除只读属性的赋值操作
- 类型断言临时解决（`x as Y`，优先调整类型设计）

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

### TS6307

**官方含义**: 文件未在 `tsconfig.json` 的项目文件列表中

**高频触发原因**:
- 文件路径不在 `include` 范围内
- 文件被 `exclude` 字段排除
- `files` 字段未显式包含该文件

**针对性解决方案**:
- 调整 `include` 覆盖目标文件（`["src/**/*", "types/**/*"]`）
- 检查 `exclude` 是否误排除（如排除了 `src/utils`）

### TS7006

**官方含义**: 变量隐式具有 `any` 类型（未显式声明类型，且 TS 无法自动推断）

**高频触发原因**:
- 变量未声明类型且无初始值
- 函数参数未标注类型
- `tsconfig` 关闭 `noImplicitAny` 但代码未适配

**针对性解决方案**:
- 显式声明类型（`let num: number;`）
- 为函数参数加类型（`function fn(x: string) {}`）
- 临时用 `@ts-expect-error`（标注修复TODO）

