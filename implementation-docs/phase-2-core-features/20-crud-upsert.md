# 13 - 插件管理器

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 12

## 🎯 任务目标

实现插件管理系统，支持业务功能模块化和热插拔。

## 📋 执行步骤

### 1. 定义插件接口

**packages/shared-core/src/btc/plugin/types.ts**:
```typescript
import type { App, Component, Directive } from 'vue';

export interface Plugin {
  name: string;
  version?: string;
  install: (app: App, options?: any) => void;
  components?: Record<string, Component>;
  directives?: Record<string, Directive>;
  composables?: Record<string, Function>;
}
```

### 2. 实现插件管理器

**packages/shared-core/src/btc/plugin/manager.ts**:
```typescript
import type { App } from 'vue';
import type { Plugin } from './types';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private app: App | null = null;

  setApp(app: App) {
    this.app = app;
  }

  register(plugin: Plugin, options?: any) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已注册`);
      return;
    }

    this.plugins.set(plugin.name, plugin);

    if (this.app) {
      plugin.install(this.app, options);
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  unregister(name: string) {
    this.plugins.delete(name);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();
```

### 3. 导出

**packages/shared-core/src/btc/plugin/index.ts**:
```typescript
export { PluginManager, pluginManager } from './manager';
export type { Plugin } from './types';
```

### 4. 集成到 useCore

**packages/shared-core/src/btc/index.ts**:
```typescript
import { pluginManager } from './plugin';

export function useCore() {
  return {
    service: serviceInstance,
    pluginManager,
  };
}
```

## ✅ 验收标准

### 检查：插件注册

```typescript
import { pluginManager, type Plugin } from '@btc/shared-core';

const TestPlugin: Plugin = {
  name: 'test',
  install(app, options) {
    console.log('插件安装', options);
  },
};

pluginManager.register(TestPlugin, { key: 'value' });

console.log(pluginManager.has('test')); // true
console.log(pluginManager.get('test')); // Plugin 对象
```

## 📝 检查清单

- [ ] 类型定义完整
- [ ] PluginManager 实现
- [ ] register 方法
- [ ] get/has 方法
- [ ] 导出正确
- [ ] 集成到 useCore

## 🔗 下一步

- [14 - 数据字典系统](./14-dict-system.md)

