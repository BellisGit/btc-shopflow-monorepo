# 响应拦截器使用指南

## 概述

响应拦截器工具根据 BTC Shop Flow 3.0 项目的响应状态码文档实现统一的响应处理，支持所有业务状态码的自动处理。

## 特性

- ✅ 支持所有业务状态码（200, 400, 401, 410, 500, 501, 510-529 等）
- ✅ 自动错误消息显示
- ✅ 自动重定向处理（如登录过期跳转）
- ✅ 确认对话框支持
- ✅ 网络错误处理
- ✅ 可配置的消息处理器
- ✅ 类型安全

## 快速开始

### 1. 初始化（在应用启动时）

```typescript
// bootstrap/index.ts
import { initResponseInterceptor } from '../utils/response-interceptor-init';

export async function bootstrap(app: App) {
  // ... 其他初始化代码

  // 路由初始化
  const router = routerModule.default;
  app.use(router);

  // 初始化响应拦截器
  initResponseInterceptor(router);
}
```

### 2. 在 HTTP 工具中使用

```typescript
// utils/http.ts
import { responseInterceptor } from '@btc/shared-utils';

export class Http {
  constructor() {
    // 创建响应拦截器
    const interceptor = responseInterceptor.createResponseInterceptor();
    this.axiosInstance.interceptors.response.use(interceptor.onFulfilled, interceptor.onRejected);
  }
}
```

## 状态码处理

### 成功状态码

| 状态码 | 处理方式 | 说明               |
| ------ | -------- | ------------------ |
| 200    | 静默处理 | 操作成功，返回数据 |
| 2000   | 静默处理 | 操作成功（兼容）   |
| 1000   | 静默处理 | 操作成功（兼容）   |

### 错误状态码

| 状态码 | 处理方式     | 说明                 |
| ------ | ------------ | -------------------- |
| 400    | 显示错误消息 | 操作失败             |
| 500    | 显示错误消息 | 操作失败             |
| 501    | 显示错误消息 | 系统繁忙，请稍候再试 |

### 认证相关状态码

| 状态码 | 处理方式            | 说明                   |
| ------ | ------------------- | ---------------------- |
| 401    | 显示警告 + 跳转登录 | 身份已过期，请重新登录 |
| 410    | 显示错误消息        | 该用户不存在,请先注册  |
| 511    | 显示错误消息        | 登录失败，未获取到令牌 |
| 517    | 显示警告 + 跳转登录 | 身份令牌已过期         |
| 518    | 显示警告 + 跳转登录 | 获取到的身份令牌为空   |

### 数据相关状态码

| 状态码 | 处理方式     | 说明         |
| ------ | ------------ | ------------ |
| 510    | 显示警告消息 | 数据为空     |
| 522    | 显示错误消息 | 参数不能为空 |
| 523    | 显示错误消息 | 数据错误     |

### 用户管理相关状态码

| 状态码 | 处理方式     | 说明         |
| ------ | ------------ | ------------ |
| 520    | 显示错误消息 | 没有该工号   |
| 521    | 显示错误消息 | 初始密码错误 |
| 524    | 显示错误消息 | 账号已存在   |
| 526    | 显示错误消息 | 表单id过期   |
| 527    | 显示错误消息 | 手机号不存在 |
| 529    | 显示错误消息 | 邮箱不存在   |

### Keycloak相关状态码

| 状态码 | 处理方式     | 说明                   |
| ------ | ------------ | ---------------------- |
| 512    | 显示错误消息 | keycloak客户端地址错误 |
| 513    | 显示错误消息 | 获取领域失败           |
| 514    | 显示错误消息 | 获取客户端id失败       |
| 515    | 显示错误消息 | 获取客户端密钥失败     |
| 516    | 显示错误消息 | 连接keycloak失败       |

## 自定义处理

### 自定义消息处理器

```typescript
import { responseInterceptor, type MessageHandler } from '@btc/shared-utils';

const customMessageHandler: MessageHandler = {
  success: (message) => console.log('✅', message),
  error: (message) => console.error('❌', message),
  warning: (message) => console.warn('⚠️', message),
  info: (message) => console.info('ℹ️', message),
};

responseInterceptor.setMessageHandler(customMessageHandler);
```

### 自定义确认对话框处理器

```typescript
import { responseInterceptor, type ConfirmHandler } from '@btc/shared-utils';

const customConfirmHandler: ConfirmHandler = {
  confirm: async (message, title) => {
    return window.confirm(`${title}: ${message}`);
  },
};

responseInterceptor.setConfirmHandler(customConfirmHandler);
```

### 自定义路由处理器

```typescript
import { responseInterceptor, type RouterHandler } from '@btc/shared-utils';

const customRouterHandler: RouterHandler = {
  push: (path) => {
    window.location.href = path;
  },
};

responseInterceptor.setRouterHandler(customRouterHandler);
```

## 网络错误处理

拦截器会自动处理以下网络错误：

- **404**: 请求的资源不存在
- **429**: 请求过于频繁，请稍后重试
- **500**: 服务器内部错误
- **网络连接失败**: 网络连接失败，请检查网络设置
- **请求配置错误**: 请求配置错误

## 响应格式

拦截器期望的响应格式：

```typescript
interface ApiResponse<T = any> {
  code: number; // 业务状态码
  msg: string; // 响应消息
  data: T; // 响应数据
  total?: number; // 总数（分页时使用）
  token?: string; // 认证令牌（部分接口）
}
```

## 注意事项

1. **初始化顺序**: 确保在使用 HTTP 工具之前初始化响应拦截器
2. **路由依赖**: 重定向功能需要路由实例，确保正确设置
3. **消息处理器**: 如果不设置消息处理器，错误消息将不会显示
4. **类型安全**: 所有接口都有完整的 TypeScript 类型定义

## 扩展

如需添加新的状态码处理，请：

1. 在 `STATUS_CODE_CONFIG` 中添加配置
2. 根据业务需求设置 `action` 类型
3. 更新文档说明

```typescript
const STATUS_CODE_CONFIG: Record<number, StatusCodeConfig> = {
  // 现有配置...

  // 新增状态码
  999: {
    code: 999,
    message: '自定义错误消息',
    action: 'show',
    showType: 'error',
  },
};
```
