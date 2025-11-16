# 08.5 - Vite 插件虚拟模块注入

> **阶段**: Phase 2 | **时间**: 2小时 | **前置**: 08, 09

## 🎯 任务目标

实现 Vite 虚拟模块机制，使 EPS 生成的服务可以通过 `import service from 'virtual:eps'` 导入。

## 📋 执行步骤

### 1. 增强 EPS 插件 - 添加虚拟模块支持

**packages/vite-plugin-eps/src/eps/index.ts**:
```typescript
import type { Plugin } from 'vite';
import { generateEps } from './generator';
import fs from 'fs';
import path from 'path';

export interface EpsPluginOptions {
  epsUrl: string;
  outputDir?: string;
  watch?: boolean;
}

export function epsPlugin(options: EpsPluginOptions): Plugin {
  const { epsUrl, outputDir = 'build/eps', watch = true } = options;

  // 缓存 EPS 数据
  let epsData: any = null;

  return {
    name: 'vite-plugin-eps',

    async buildStart() {
      console.log('[EPS] 开始生成服务层...');

      try {
        // 从后端获取 API 元数据
        const response = await fetch(epsUrl);
        const apiMeta = await response.json();

        // 生成代码文件
        await generateEps(apiMeta, outputDir);

        // 🔥 缓存数据用于虚拟模块
        epsData = apiMeta;

        console.log('[EPS] 服务层生成成功');
      } catch (error) {
        console.error('[EPS] 生成失败:', error);
      }
    },

    // 🔥 虚拟模块解析
    resolveId(id: string) {
      if (id === 'virtual:eps') {
        // 返回特殊标识，以 \0 开头表示虚拟模块
        return '\0virtual:eps';
      }
      return null;
    },

    // 🔥 虚拟模块加载
    load(id: string) {
      if (id === '\0virtual:eps') {
        // 读取生成的 JSON 文件
        const jsonPath = path.resolve(outputDir, 'eps.json');

        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf-8');

          // 返回模块代码
          return `
            const epsData = ${content};
            export default epsData;
          `;
        } else {
          console.warn('[EPS] eps.json 文件不存在');
          return `export default {};`;
        }
      }
      return null;
    },

    // 🔥 开发模式下热更新
    configureServer(server) {
      if (watch) {
        // 每 10 秒检查一次更新
        const timer = setInterval(async () => {
          try {
            const response = await fetch(epsUrl);
            const apiMeta = await response.json();

            // 检查是否有变化
            if (JSON.stringify(apiMeta) !== JSON.stringify(epsData)) {
              await generateEps(apiMeta, outputDir);
              epsData = apiMeta;

              // 🔥 触发热更新
              const module = server.moduleGraph.getModuleById('\0virtual:eps');
              if (module) {
                server.moduleGraph.invalidateModule(module);
                server.ws.send({
                  type: 'full-reload',
                  path: '*',
                });
              }

              console.log('[EPS] 服务层已更新');
            }
          } catch (error) {
            // 静默失败
          }
        }, 10000);

        // 服务器关闭时清理定时器
        server.httpServer?.on('close', () => {
          clearInterval(timer);
        });
      }
    },
  };
}
```

### 2. 添加 TypeScript 类型声明

**packages/vite-plugin-eps/src/eps/types.d.ts**:
```typescript
// 虚拟模块类型声明
declare module 'virtual:eps' {
  interface ApiMethod {
    path: string;
    method: string;
    name: string;
  }

  interface ServiceModule {
    [key: string]: ApiMethod[];
  }

  const epsData: ServiceModule;
  export default epsData;
}
```

### 3. 在应用中配置类型声明

**packages/main-app/vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { epsPlugin } from '@btc/vite-plugin-eps';

export default defineConfig({
  plugins: [
    vue(),
    epsPlugin({
      epsUrl: 'http://localhost:8001/admin/base/open/eps',
      outputDir: 'build/eps',
      watch: true,
    }),
  ],
});
```

**packages/main-app/src/vite-env.d.ts**:
```typescript
/// <reference types="vite/client" />

// 🔥 引入虚拟模块类型
declare module 'virtual:eps' {
  interface ApiMethod {
    path: string;
    method: string;
    name: string;
  }

  interface ServiceModule {
    [key: string]: ApiMethod[];
  }

  const epsData: ServiceModule;
  export default epsData;
}
```

### 4. 在服务构建器中使用虚拟模块

**packages/shared-core/src/btc/service/index.ts**:
```typescript
import epsData from 'virtual:eps'; // 🔥 从虚拟模块导入
import { BaseService } from './base';
import type { AxiosRequestConfig } from 'axios';

class ServiceBuilder {
  build() {
    const service: any = {};

    // 遍历 EPS 数据生成服务
    for (const [moduleName, apis] of Object.entries(epsData)) {
      service[moduleName] = {};

      for (const api of apis as any[]) {
        // 为每个 API 生成方法
        service[moduleName][api.name] = (data?: any, config?: AxiosRequestConfig) => {
          const method = api.method.toLowerCase();

          return BaseService.request({
            url: api.path,
            method,
            [method === 'get' ? 'params' : 'data']: data,
            ...config,
          });
        };
      }
    }

    return service;
  }
}

// 导出服务实例
export const service = new ServiceBuilder().build();
```

### 5. 创建虚拟模块 Mock（测试用）

**packages/vite-plugin-eps/test/virtual-eps.mock.ts**:
```typescript
// 用于测试的 Mock 数据
export const mockEpsData = {
  user: [
    { path: '/admin/user/list', method: 'POST', name: 'list' },
    { path: '/admin/user/add', method: 'POST', name: 'add' },
    { path: '/admin/user/update', method: 'POST', name: 'update' },
    { path: '/admin/user/delete', method: 'POST', name: 'delete' },
  ],
  order: [
    { path: '/admin/order/page', method: 'POST', name: 'page' },
    { path: '/admin/order/info', method: 'GET', name: 'info' },
  ],
};
```

### 6. 使用示例

**在组件中使用自动生成的服务**:
```vue
<template>
  <div>
    <el-button @click="loadUsers">加载用户</el-button>
  </div>
</template>

<script setup lang="ts">
// 🔥 直接导入服务，自动类型推断
import { service } from '@btc/shared-core';

const loadUsers = async () => {
  try {
    // 🔥 自动补全 service.user.list
    const res = await service.user.list({
      page: 1,
      size: 20,
    });

    console.log('用户列表:', res.list);
  } catch (error) {
    console.error('加载失败:', error);
  }
};
</script>
```

### 7. 调试虚拟模块

**查看虚拟模块内容**:
```typescript
// 在浏览器控制台
import('virtual:eps').then(module => {
  console.log('EPS 数据:', module.default);
});
```

## ✅ 验收标准

### 检查 1: 虚拟模块可导入

```typescript
// 在任意组件中
import epsData from 'virtual:eps';

console.log(epsData);
// 预期: 输出完整的 EPS 数据结构
```

### 检查 2: 类型提示正常

```typescript
import { service } from '@btc/shared-core';

// 预期: 编辑器自动补全
service.user.list
service.order.page
```

### 检查 3: 热更新生效

```bash
# 1. 后端添加新接口
# 2. 等待 10 秒
# 预期: 控制台输出 "[EPS] 服务层已更新"
# 预期: 页面自动刷新
```

### 检查 4: 构建产物正确

```bash
pnpm build

# 检查构建后的代码
# 预期: 虚拟模块被编译为实际代码
```

## 📝 检查清单

- [ ] resolveId 钩子实现
- [ ] load 钩子实现
- [ ] 虚拟模块返回正确代码
- [ ] TypeScript 类型声明
- [ ] 热更新机制
- [ ] 服务构建器集成
- [ ] 类型提示正常
- [ ] 构建产物正确
- [ ] 开发体验良好

## 🚨 常见问题

**Q: 导入 virtual:eps 报错？**
A: 确保在 vite-env.d.ts 中添加了类型声明

**Q: 类型提示不准确？**
A: 需要根据后端实际返回类型完善类型定义

**Q: 热更新不生效？**
A: 检查 moduleGraph.invalidateModule 是否正确调用

**Q: 构建后虚拟模块找不到？**
A: 虚拟模块在构建时会被编译为实际代码，检查 load 钩子返回的代码

## 💡 最佳实践

1. **虚拟模块命名规范**
   - 使用 `virtual:` 前缀
   - 名称清晰明确
   - 例如: `virtual:eps`, `virtual:routes`

2. **缓存策略**
   - 缓存生成的数据，避免重复读取文件
   - 检测变化后再更新缓存

3. **类型安全**
   - 提供完整的 TypeScript 类型声明
   - 使用 declare module 声明虚拟模块类型

4. **热更新优化**
   - 只在数据真正变化时触发更新
   - 使用 moduleGraph 精确控制更新范围

5. **错误处理**
   - 虚拟模块加载失败时返回空对象
   - 提供友好的错误提示

## 🔗 下一步

- [26.5 - 子应用独立运行能力](../../phase-4-sub-apps/26.5-sub-app-standalone.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时
