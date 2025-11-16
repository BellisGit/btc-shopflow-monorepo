# 37.5 - 环境变量管理

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 37

## 🎯 任务目标

建立统一的环境变量管理机制，支持多环境配置。

## 📋 执行步骤

### 1. 创建环境文件

**packages/main-app/.env**:
```bash
# 基础配置（所有环境共享）
VITE_APP_TITLE=BTC管理系统
VITE_APP_VERSION=1.0.0
```

**packages/main-app/.env.development**:
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8001
VITE_EPS_URL=http://localhost:8001/admin/base/open/eps

# 子应用地址
VITE_LOGISTICS_URL=http://localhost:5001
VITE_PRODUCTION_URL=http://localhost:5002

# 调试开关
VITE_DEBUG=true
VITE_MOCK=true
```

**packages/main-app/.env.test**:
```bash
# 测试环境
VITE_API_BASE_URL=https://test-api.btc-shopflow.com.cn
VITE_EPS_URL=https://test-api.btc-shopflow.com.cn/admin/base/open/eps

VITE_LOGISTICS_URL=https://test-logistics.btc-shopflow.com.cn
VITE_PRODUCTION_URL=https://test-production.btc-shopflow.com.cn

VITE_DEBUG=false
VITE_MOCK=false
```

**packages/main-app/.env.production**:
```bash
# 生产环境
VITE_API_BASE_URL=https://api.btc-shopflow.com.cn
VITE_EPS_URL=https://api.btc-shopflow.com.cn/admin/base/open/eps

VITE_LOGISTICS_URL=https://logistics.btc-shopflow.com.cn
VITE_PRODUCTION_URL=https://production.btc-shopflow.com.cn

# 监控配置
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

VITE_DEBUG=false
VITE_MOCK=false
```

### 2. 创建环境配置类型

**src/types/env.d.ts**:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_EPS_URL: string;
  readonly VITE_LOGISTICS_URL: string;
  readonly VITE_PRODUCTION_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_DEBUG: string;
  readonly VITE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 3. 创建配置管理器

**src/config/env.ts**:
```typescript
export const ENV_CONFIG = {
  // 应用信息
  appTitle: import.meta.env.VITE_APP_TITLE,
  appVersion: import.meta.env.VITE_APP_VERSION,

  // API 配置
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  epsUrl: import.meta.env.VITE_EPS_URL,

  // 子应用地址
  microApps: {
    logistics: import.meta.env.VITE_LOGISTICS_URL,
    production: import.meta.env.VITE_PRODUCTION_URL,
  },

  // 功能开关
  debug: import.meta.env.VITE_DEBUG === 'true',
  mock: import.meta.env.VITE_MOCK === 'true',

  // 监控
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },

  // 环境判断
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};

// 导出常用方法
export const isDev = ENV_CONFIG.isDev;
export const isProd = ENV_CONFIG.isProd;
```

### 4. 在代码中使用

**src/config/micro-apps.ts**:
```typescript
import { ENV_CONFIG } from './env';

export const microApps = [
  {
    name: 'logistics-app',
    entry: ENV_CONFIG.microApps.logistics,
    container: '#subapp-container',
    activeRule: '/logistics',
  },
  {
    name: 'production-app',
    entry: ENV_CONFIG.microApps.production,
    container: '#subapp-container',
    activeRule: '/production',
  },
];
```

**axios 配置**:
```typescript
import axios from 'axios';
import { ENV_CONFIG } from '@/config/env';

const request = axios.create({
  baseURL: ENV_CONFIG.apiBaseUrl,
  timeout: 10000,
});
```

### 5. 构建不同环境

**package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:test": "vite build --mode test",
    "build:prod": "vite build --mode production"
  }
}
```

### 6. Docker 环境变量

**Dockerfile**:
```dockerfile
FROM node:18-alpine as builder

ARG BUILD_ENV=production

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build --mode ${BUILD_ENV}

FROM nginx:alpine

COPY --from=builder /app/packages/main-app/dist /usr/share/nginx/html

# 运行时环境变量注入
COPY docker/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
```

**docker/env.sh**:
```bash
#!/bin/sh

# 将环境变量注入到 window 对象
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL}",
  SENTRY_DSN: "${SENTRY_DSN}"
};
EOF
```

**index.html**:
```html
<head>
  <script src="/env-config.js"></script>
</head>
```

### 7. 运行时配置读取

**src/config/runtime.ts**:
```typescript
// 优先使用运行时环境变量
export const RUNTIME_CONFIG = {
  apiBaseUrl: (window as any).__ENV__?.API_BASE_URL || ENV_CONFIG.apiBaseUrl,
  sentryDsn: (window as any).__ENV__?.SENTRY_DSN || ENV_CONFIG.sentry.dsn,
};
```

## ✅ 验收标准

### 检查 1: 环境文件

```bash
ls packages/main-app/.env*

# 预期:
.env
.env.development
.env.test
.env.production
```

### 检查 2: 不同环境构建

```bash
# 测试环境
pnpm build:test
# 检查: API_BASE_URL 是测试地址

# 生产环境
pnpm build:prod
# 检查: API_BASE_URL 是生产地址
```

### 检查 3: 类型提示

```typescript
import.meta.env.VITE_API_BASE_URL
// 预期: TypeScript 有类型提示
```

## 📝 检查清单

- [ ] 环境文件创建
- [ ] 类型定义
- [ ] 配置管理器
- [ ] 在代码中使用
- [ ] 构建脚本配置
- [ ] Docker 环境变量
- [ ] 运行时配置
- [ ] 多环境构建成功

## 🎯 环境变量最佳实践

### 1. 命名规范
```bash
# Vite 环境变量必须以 VITE_ 开头
VITE_API_BASE_URL=xxx

# 系统环境变量不需要前缀
NODE_ENV=production
```

### 2. 敏感信息处理
```bash
# 不要提交到 Git
.env.local
.env.*.local

# 使用 CI/CD secrets
VITE_SENTRY_DSN=${{ secrets.SENTRY_DSN }}
```

### 3. 默认值设置
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
```

## 🔗 下一步

- [38 - 性能检测和优化](./38-performance-check.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

