# 38 - 性能检测和优化

> **阶段**: Phase 5 | **时间**: 3小时 | **前置**: 37

## 🎯 任务目标

使用 Lighthouse 检测性能并优化。

## 📋 执行步骤

### 1. 运行 Lighthouse

```bash
# 安装 Lighthouse
npm install -g lighthouse

# 检测主应用
lighthouse https://btc-shopflow.com.cn --output=html --output-path=./lighthouse-report.html

# 查看报告
open lighthouse-report.html
```

### 2. 性能优化清单

**优化项**:
- [ ] 启用 Gzip 压缩
- [ ] 配置浏览器缓存
- [ ] 使用 CDN 加载静态资源
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] 预加载关键资源
- [ ] 使用 Web Workers

### 3. 添加性能监控

**src/utils/performance.ts**:
```typescript
export function reportWebVitals() {
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
}
```

### 4. 优化配置

**vite.config.ts** 补充:
```typescript
export default defineConfig({
  build: {
    // 预加载
    modulePreload: {
      polyfill: true,
    },

    // CSS 代码分割
    cssCodeSplit: true,

    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

## ✅ 验收标准

### 检查：性能指标

| 指标 | 目标值 | 实际值 |
|------|--------|--------|
| FCP | < 1.8s | ___ |
| LCP | < 2.5s | ___ |
| TTI | < 3.8s | ___ |
| CLS | < 0.1 | ___ |
| Lighthouse | > 90 | ___ |

## 📝 检查清单

- [ ] Lighthouse 报告生成
- [ ] 性能指标达标
- [ ] 优化项实施
- [ ] 性能监控添加
- [ ] 构建配置优化

## 🎉 里程碑 M5 完成

恭喜！完成阶段五，生产环境已部署：
- ✅ Vite 构建优化
- ✅ Docker 容器化
- ✅ Nginx 配置
- ✅ CI/CD 流水线
- ✅ 性能优化

## 🔗 下一步

- [39 - CLI 创建子应用](../phase-6-tooling/39-cli-create-app.md)

