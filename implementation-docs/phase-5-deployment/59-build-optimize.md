# 33 - Vite 构建优化

> **阶段**: Phase 5 | **时间**: 3小时 | **前置**: 32

## 🎯 任务目标

优化 Vite 构建配置，实现代码分割和压缩。

## 📋 执行步骤

### 1. 安装优化插件

```bash
cd packages/main-app
pnpm add -D vite-plugin-compression rollup-plugin-visualizer
```

### 2. 配置代码分割

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'gzip' }),
    visualizer({ open: true }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'qiankun': ['qiankun'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 3. 配置自动导入

```bash
pnpm add -D unplugin-auto-import unplugin-vue-components
```

**vite.config.ts** 补充:
```typescript
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
});
```

## ✅ 验收标准

### 检查：构建产物

```bash
pnpm build

# 检查产物大小
du -sh dist
# 预期: < 2MB

# 检查 gzip 文件
ls dist/**/*.gz
# 预期: 存在压缩文件
```

## 📝 检查清单

- [ ] 优化插件安装
- [ ] 代码分割配置
- [ ] Gzip 压缩
- [ ] 自动导入配置
- [ ] 构建成功
- [ ] 产物大小合理

## 🔗 下一步

- [34 - Docker 主应用镜像](./34-docker-base.md)

