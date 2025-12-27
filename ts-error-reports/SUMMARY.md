# TypeScript 类型错误统计汇总

生成时间: 2025/12/24 19:46:26

## 总体统计

- **总应用数**: 15
- **有错误的应用数**: 11
- **总错误数**: 1286

## 应用错误统计

| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ production-app | 140 | 78 | TS6133:26, TS2614:25, TS2345:17, TS2305:14, TS2322:12, TS18048:9, TS2538:8, TS2375:6, TS2379:5, TS2412:5, TS2339:4, TS2769:3, TS2532:3, TS2304:1, TS6196:1, TS7016:1 | [production_app_errors.txt](./production_app_errors.txt) |
| ❌ operations-app | 140 | 75 | TS6133:29, TS2614:23, TS2345:18, TS2322:12, TS2538:11, TS2305:11, TS18048:9, TS2412:6, TS2375:6, TS2379:5, TS2769:3, TS2532:3, TS2339:2, TS6196:1, TS7016:1 | [operations_app_errors.txt](./operations_app_errors.txt) |
| ❌ finance-app | 132 | 72 | TS6133:32, TS2614:27, TS2345:17, TS2322:12, TS18048:9, TS2538:8, TS2375:6, TS2379:5, TS2412:5, TS2305:3, TS2769:3, TS2532:3, TS6196:1, TS7016:1 | [finance_app_errors.txt](./finance_app_errors.txt) |
| ❌ engineering-app | 106 | 65 | TS6133:30, TS2345:16, TS2322:12, TS18048:9, TS2538:8, TS2375:6, TS2305:5, TS2379:5, TS2412:5, TS2769:3, TS2532:3, TS6196:1, TS2614:1, TS7016:1, TS2347:1 | [engineering_app_errors.txt](./engineering_app_errors.txt) |
| ❌ personnel-app | 106 | 65 | TS6133:30, TS2345:16, TS2322:12, TS18048:9, TS2538:8, TS2375:6, TS2305:5, TS2379:5, TS2412:5, TS2769:3, TS2532:3, TS6196:1, TS2614:1, TS7016:1, TS2347:1 | [personnel_app_errors.txt](./personnel_app_errors.txt) |
| ❌ dashboard-app | 106 | 65 | TS6133:30, TS2345:16, TS2322:12, TS18048:9, TS2538:8, TS2375:6, TS2305:5, TS2379:5, TS2412:5, TS2769:3, TS2532:3, TS6196:1, TS2614:1, TS7016:1, TS2347:1 | [dashboard_app_errors.txt](./dashboard_app_errors.txt) |
| ❌ logistics-app | 102 | 64 | TS6133:43, TS2345:14, TS2322:13, TS2412:7, TS2375:7, TS18048:6, TS2769:4, TS2532:4, TS2379:3, TS7016:1 | [logistics_app_errors.txt](./logistics_app_errors.txt) |
| ❌ system-app | 101 | 66 | TS6133:38, TS2345:17, TS2322:12, TS2375:7, TS18048:7, TS2769:6, TS2412:6, TS2379:4, TS2532:2, TS2353:1, TS7016:1 | [system_app_errors.txt](./system_app_errors.txt) |
| ❌ quality-app | 96 | 61 | TS6133:37, TS2345:14, TS2322:13, TS2375:8, TS2412:7, TS18048:6, TS2532:4, TS2769:3, TS2379:3, TS7016:1 | [quality_app_errors.txt](./quality_app_errors.txt) |
| ❌ layout-app | 5 | 5 | TS2305:4, TS2353:1 | [layout_app_errors.txt](./layout_app_errors.txt) |
| ✅ admin-app | 0 | 0 | - | [admin_app_errors.txt](./admin_app_errors.txt) |
| ✅ monitor-app | 0 | 0 | - | [monitor_app_errors.txt](./monitor_app_errors.txt) |
| ✅ mobile-app | 0 | 0 | - | [mobile_app_errors.txt](./mobile_app_errors.txt) |
| ✅ docs-app | 0 | 0 | - | [docs_app_errors.txt](./docs_app_errors.txt) |

## 共享包错误统计（合并）

| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |
|---------|--------|-----------|-------------|----------|
| ❌ packages (合并) | 252 | 123 | TS6133:92, TS2379:47, TS2322:23, TS2345:20, TS2769:14, TS18048:13, TS2412:13, TS2538:11, TS2532:7, TS2375:5, TS6198:2, TS6192:1, TS6196:1, TS2353:1, TS7016:1, TS2739:1 | [packages_errors.txt](./packages_errors.txt) |

## 错误代码汇总

| 错误代码 | 总数 | 官方含义 |
|---------|------|----------|
| TS6133 | 387 | 未使用的变量 |
| TS2345 | 165 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2322 | 133 | 类型不匹配 |
| TS2379 | 87 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS18048 | 86 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2614 | 78 | 模块无默认导出，或导入的命名空间对象无此导出成员 |
| TS2412 | 64 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2375 | 63 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2538 | 62 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2305 | 47 | 模块/命名空间中不存在指定的导出成员 |
| TS2769 | 45 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2532 | 35 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS7016 | 10 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS6196 | 7 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2339 | 6 | 对象上不存在该属性/方法 |
| TS2353 | 3 | 不能将类型 X 分配给类型 Y（类型不匹配） |
| TS2347 | 3 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS6198 | 2 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2304 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS6192 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |
| TS2739 | 1 | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |

## 错误代码详细说明与解决方案

> 参考: [TypeScript 错误代码官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html)

### TS2614

**官方含义**: 模块无默认导出，或导入的命名空间对象无此导出成员（如 `import X from 'xxx'` 但模块仅命名导出）

**高频触发原因**:
- 导入方式与导出方式不匹配（默认导入 ↔ 命名导出）
- 类型声明未正确描述导出类型

**针对性解决方案**:
- 修正导入语法（`import { X } from 'xxx'` 替代 `import X from 'xxx'`）
- 补全模块默认导出声明（`declare module 'xxx' { export default fn }`）

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

### TS2339

**官方含义**: 对象上不存在该属性/方法

**高频触发原因**:
- 属性名拼写错误
- 类型定义缺失该属性
- 对象为 `null/undefined` 时访问属性

**针对性解决方案**:
- 核对属性名（如 `user.name` 而非 `user.nam`）
- 扩展类型接口（`interface User { newProp: string }`）
- 非空断言（`obj!.prop`）或空值检查

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

