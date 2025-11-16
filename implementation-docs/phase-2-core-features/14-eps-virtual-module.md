# 09 - EPS 服务构建器

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 08

## 🎯 任务目标

实现运行时服务构建器，从 EPS 数据动态生成 service 对象。

## 📋 执行步骤

### 1. 创建基础服务类

**packages/shared-core/src/btc/service/base.ts**:
```typescript
import axios, { type AxiosRequestConfig } from 'axios';

export class BaseService {
  static request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return axios(config).then((res) => res.data);
  }
}
```

### 2. 实现服务构建器

**packages/shared-core/src/btc/service/builder.ts**:
```typescript
import { BaseService } from './base';

interface ApiConfig {
  path: string;
  method: string;
  name: string;
}

export class ServiceBuilder {
  build(epsData: Record<string, ApiConfig[]>) {
    const service: any = {};

    for (const [module, apis] of Object.entries(epsData)) {
      service[module] = {};

      for (const api of apis) {
        service[module][api.name] = (data?: any) => {
          return BaseService.request({
            url: api.path,
            method: api.method,
            [api.method === 'get' ? 'params' : 'data']: data,
          });
        };
      }
    }

    return service;
  }
}
```

### 3. 创建虚拟模块支持

**packages/vite-plugin-eps/src/eps/virtual.ts**:
```typescript
import type { Plugin } from 'vite';

export function epsVirtualPlugin(): Plugin {
  const virtualModuleId = 'virtual:eps';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-eps-virtual',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 读取生成的 eps.json
        const fs = require('fs');
        const path = require('path');
        const epsPath = path.resolve(process.cwd(), 'build/core/eps.json');

        if (fs.existsSync(epsPath)) {
          const epsData = fs.readFileSync(epsPath, 'utf-8');
          return `export default ${epsData}`;
        }

        return 'export default {}';
      }
    },
  };
}
```

### 4. 集成到主插件

**packages/vite-plugin-eps/src/index.ts**:
```typescript
import { epsPlugin } from './eps';
import { epsVirtualPlugin } from './eps/virtual';

export { epsPlugin, epsVirtualPlugin };

// 便捷导出
export function btcPlugin(options: any) {
  return [
    epsPlugin(options),
    epsVirtualPlugin(),
  ];
}
```

### 5. 实现 useCore

**packages/shared-core/src/btc/index.ts**:
```typescript
import epsData from 'virtual:eps';
import { ServiceBuilder } from './service/builder';

let serviceInstance: any = null;

export function useCore() {
  if (!serviceInstance) {
    const builder = new ServiceBuilder();
    serviceInstance = builder.build(epsData);
  }

  return {
    service: serviceInstance,
  };
}
```

### 6. 导出类型定义

**packages/shared-core/src/index.ts**:
```typescript
export { useCore } from './btc';
export { BaseService } from './btc/service/base';
```

## ✅ 验收标准

### 检查 1: 虚拟模块可用

在应用中测试：
```typescript
import epsData from 'virtual:eps';
console.log(epsData);
// 预期: 输出 EPS 数据对象
```

### 检查 2: service 对象生成

```typescript
import { useCore } from '@btc/shared-core';

const { service } = useCore();

// 假设后端有 user 模块的 list 接口
service.user.list({ page: 1 }).then(res => {
  console.log(res);
});

// 预期: 正确调用接口并返回数据
```

### 检查 3: 类型提示

```typescript
// 预期: IDE 有代码补全
service.user. // <- 自动提示 list, add, update, delete 等
```

## 📝 检查清单

- [ ] BaseService 实现
- [ ] ServiceBuilder 实现
- [ ] 虚拟模块插件实现
- [ ] useCore 实现
- [ ] 类型定义导出
- [ ] 虚拟模块可加载
- [ ] service 对象生成正确
- [ ] API 调用成功

## 🚨 常见问题

**Q: virtual:eps 找不到？**  
A: 确保在 vite.config.ts 中使用了 epsVirtualPlugin()

**Q: 类型提示不准确？**  
A: 生成的 eps.d.ts 需要包含详细的类型定义

## 🔗 下一步

- [10 - CRUD Composable 实现](./10-crud-composable.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

