# 19 - 插件管理器实现总结

## ? 任务概述

创建统一的插件管理系统，用于注册和管理应用中的各种功能插件（Excel、PDF、Upload 等）。

## ? 完成内容

### 1. 核心实现

#### **插件接口定义** (`types.ts`)
```typescript
interface Plugin<T = any> {
  name: string;                     // 插件名称（唯一标识）
  version?: string;                 // 版本号
  description?: string;             // 描述
  dependencies?: string[];          // 依赖的其他插件
  install?: (app: App, options?: PluginOptions) => void | Promise<void>;
  uninstall?: () => void | Promise<void>;
  api?: T;                          // 插件功能 API
  meta?: Record<string, any>;       // 元数据
}
```

#### **插件管理器类** (`index.ts`)
```typescript
class PluginManager {
  // 核心方法
  register(plugin: Plugin): this;           // 注册插件（链式）
  install(name: string): Promise<void>;     // 安装插件
  uninstall(name: string): Promise<void>;   // 卸载插件
  
  // 查询方法
  get(name: string): Plugin | undefined;    // 获取插件对象
  getApi<T>(name: string): T | undefined;   // 获取插件 API
  has(name: string): boolean;               // 检查是否存在
  isInstalled(name: string): boolean;       // 检查是否已安装
  
  // 批量操作
  list(): string[];                         // 所有插件名称
  listInstalled(): string[];                // 已安装插件
  installAll(names: string[]): Promise<void>; // 批量安装
  
  // 状态管理
  getStatus(name: string): PluginStatus | undefined;
  getRecord(name: string): PluginRecord | undefined;
}
```

#### **单例模式**
```typescript
export function usePluginManager(options?: PluginManagerOptions): PluginManager
```

---

### 2. 特性功能

| 特性 | 状态 | 说明 |
|------|------|------|
| **类型安全** | ? | 完整的 TypeScript 泛型支持 |
| **依赖检查** | ? | 自动检查插件依赖关系 |
| **生命周期** | ? | install/uninstall 钩子 |
| **单例模式** | ? | usePluginManager() 全局唯一实例 |
| **链式调用** | ? | register 返回 this |
| **状态管理** | ? | registered/installed/uninstalled/failed |
| **批量操作** | ? | installAll 批量安装 |
| **调试模式** | ? | debug 选项输出日志 |

---

### 3. 示例插件

#### **Excel 插件**
```typescript
export const excelPlugin: Plugin = {
  name: 'excel',
  version: '1.0.0',
  description: 'Excel export plugin based on xlsx',
  api: {
    export: exportJsonToExcel,
  },
  install(app) {
    console.log('[Excel Plugin] Installed');
  },
};
```

#### **Notification 插件**
```typescript
export const notificationPlugin: Plugin = {
  name: 'notification',
  api: {
    success(msg: string) { console.log('?', msg); },
    error(msg: string) { console.error('?', msg); },
    info(msg: string) { console.log('??', msg); },
  },
};
```

#### **Logger 插件（带依赖）**
```typescript
export const loggerPlugin: Plugin = {
  name: 'logger',
  dependencies: ['notification'], // 依赖 notification 插件
  api: {
    log(level: string, msg: string) {
      console.log(`[${level}] ${msg}`);
    },
  },
};
```

---

### 4. 集成方式

#### **在 main.ts 中初始化**
```typescript
import { usePluginManager } from '@btc/shared-core';
import { excelPlugin, notificationPlugin, loggerPlugin } from './plugins';

const pluginManager = usePluginManager({ debug: true });
pluginManager.setApp(app);

// 链式注册
pluginManager
  .register(excelPlugin)
  .register(notificationPlugin)
  .register(loggerPlugin);

// 批量安装
await pluginManager.installAll(['excel', 'notification', 'logger']);
```

#### **在组件中使用**
```typescript
// CrudDemo.vue
const pluginManager = usePluginManager();
const excelApi = pluginManager.getApi('excel');

excelApi.export({
  header: ['Name', 'Age'],
  data: [['Tom', 25]],
  filename: 'users',
});
```

---

### 5. 测试验证

#### **插件列表测试**
- ? 显示已注册插件：excel, notification, logger
- ? 显示已安装插件：excel, notification, logger

#### **功能测试**
- ? Test Excel Plugin - 导出测试数据为 Excel
- ? Test Notification Plugin - 控制台输出通知
- ? Test Logger Plugin - 控制台输出日志

#### **依赖测试**
- ? Logger 插件依赖 Notification 插件
- ? 依赖检查自动通过

---

## ? 文档

- ? **README.md** - 完整使用文档
  - API 文档
  - 完整示例
  - 最佳实践
  - 常见问题

---

## ? 架构优势

### 1. **统一管理**
所有功能插件集中管理，易于维护和扩展。

### 2. **按需加载**
只注册和安装需要的插件，减少打包体积。

### 3. **依赖自动检查**
插件依赖关系自动验证，避免运行时错误。

### 4. **类型安全**
```typescript
// 类型推断正确
const excelApi = pluginManager.getApi<ExcelAPI>('excel');
excelApi.export(...);  // ? TypeScript 提示完整
```

### 5. **可扩展性**
- 未来可扩展：热重载、远程加载、版本管理、权限控制

---

## ? 与 cool-admin 对比

| 功能 | cool-admin | 我们的实现 | 状态 |
|------|------------|------------|------|
| 插件注册 | ? 模块化 | ? PluginManager | ? 更灵活 |
| 依赖管理 | ? 手动 | ? 自动检查 | ? 更智能 |
| 类型安全 | ?? 部分 | ? 完整泛型 | ? 更安全 |
| 状态追踪 | ? 无 | ? 完整状态 | ? 更可控 |
| 生命周期 | ? 有 | ? install/uninstall | ? 对齐 |

---

## ? 下一步

插件管理器已完成，可以继续实现：
- **20 - PDF 插件** - 基于 jsPDF 的 PDF 导出
- **21 - Upload 插件** - 文件上传功能
- **22 - 数据字典系统** - 枚举值管理

---

## ? 总结

插件管理器为整个应用提供了**统一的插件架构**，让各种功能模块（Excel、PDF、Upload 等）可以：
- ? 独立开发
- ? 统一管理
- ? 按需加载
- ? 类型安全
- ? 易于扩展

**这是构建大型应用的关键基础设施！** ?

