# 33.5 - 代码分割策略

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 33

## 🎯 任务目标

优化代码分割策略，减小包体积，提升加载性能。

## 📋 执行步骤

### 1. 配置 Manual Chunks

**vite.config.ts**:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks(id) {
          // vendor 拆分
          if (id.includes('node_modules')) {
            // Element Plus 单独打包
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            
            // Vue 全家桶
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
            
            // qiankun
            if (id.includes('qiankun')) {
              return 'qiankun';
            }
            
            // 图表库
            if (id.includes('echarts')) {
              return 'echarts';
            }
            
            // 其他第三方库
            return 'vendor';
          }
          
          // 业务代码分割
          if (id.includes('/src/views/')) {
            const match = id.match(/\/views\/([^/]+)\//);
            if (match) {
              return `page-${match[1]}`;
            }
          }
        },

        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop();
          
          if (/png|jpe?g|svg|gif|webp|ico/.test(ext || '')) {
            return 'img/[name]-[hash][extname]';
          }
          
          if (/css/.test(ext || '')) {
            return 'css/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // chunk 大小限制
    chunkSizeWarningLimit: 500,
  },
});
```

### 2. 路由懒加载优化

**src/router/routes.ts**:
```typescript
export default [
  {
    path: '/system',
    component: () => import('../layouts/default.vue'),
    children: [
      {
        path: 'user',
        // 命名 chunk
        component: () => import(
          /* webpackChunkName: "system-user" */
          '../views/system/user/index.vue'
        ),
      },
      {
        path: 'role',
        component: () => import(
          /* webpackChunkName: "system-role" */
          '../views/system/role/index.vue'
        ),
      },
    ],
  },
];
```

### 3. 动态导入优化

**异步组件**:
```typescript
import { defineAsyncComponent } from 'vue';

// 带加载状态的异步组件
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: Loading,
  delay: 200,
  timeout: 3000,
});
```

### 4. Preload 关键资源

**index.html**:
```html
<head>
  <!-- 预加载关键 chunk -->
  <link rel="modulepreload" href="/js/vue-vendor-xxx.js">
  <link rel="modulepreload" href="/js/element-plus-xxx.js">
</head>
```

### 5. 分析构建产物

**vite.config.ts** 添加:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

## ✅ 验收标准

### 检查 1: 构建分析

```bash
pnpm build

# 打开 dist/stats.html
# 检查:
- vue-vendor.js < 200KB
- element-plus.js < 500KB
- 业务代码按页面分割
- 没有超大的 chunk (> 500KB)
```

### 检查 2: 加载性能

```bash
# 打开 DevTools Network
# 访问应用
# 检查:
- 首次只加载必要的 chunk
- 路由切换时按需加载
- 没有重复加载
```

### 检查 3: Chunk 大小

```bash
ls -lh dist/js/

# 预期输出示例:
# vue-vendor-xxx.js      180KB
# element-plus-xxx.js    450KB
# qiankun-xxx.js         80KB
# page-system-xxx.js     120KB
# page-logistics-xxx.js  150KB
```

## 📝 检查清单

- [ ] Manual Chunks 配置
- [ ] 路由懒加载
- [ ] 异步组件优化
- [ ] 文件命名规范
- [ ] Preload 配置
- [ ] 构建分析工具
- [ ] Chunk 大小合理
- [ ] 加载性能提升

## 🎯 优化建议

### Chunk 大小目标
- vendor chunk < 200KB
- 业务 chunk < 150KB
- 总首屏资源 < 1MB

### 分割策略
- 第三方库按功能分割
- 业务代码按页面/模块分割
- 公共代码单独提取

## 🔗 下一步

- [34 - Docker 主应用镜像](./34-docker-base.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

