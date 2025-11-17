# API 服务模块

## 概述

`api-services` 模块用于统一管理所有不在 EPS（Element Plus Service）系统中的后端 API 服务。EPS 系统通过自动化方式管理标准 CRUD 接口，但系统中仍有许多非标准的 API 需要手动管理，本模块就是为这些 API 提供统一的封装和调用方式。

## 目录结构

```
modules/api-services/
├── auth/
│   └── index.ts          # 认证相关 API 服务（登录、注册、密码重置等）
├── sys/
│   └── index.ts           # 系统级别 API（例如接口文档、系统设置等）
├── index.ts              # 统一导出所有 API 服务
├── config.ts             # 模块配置文件
├── types.ts              # 共享类型定义
└── README.md             # 本文件
```

## 使用方式

### 导入 API 服务

```typescript
import { authApi, codeApi, sysApi } from '@/modules/api-services';
```

### 使用示例

#### 1. 账号密码登录

```typescript
import { authApi } from '@/modules/api-services';
import { BtcMessage } from '@btc/shared-components';

try {
  const response = await authApi.login({
    username: 'admin',
    password: '123456',
    captchaId: 'xxx',  // 可选
    captcha: 'xxxx'    // 可选
  });
  
  // 保存 token
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  // 保存用户信息
  if (response.user) {
    setUserInfo(response.user);
  }
} catch (error) {
  console.error('登录失败:', error);
}
```

#### 2. 手机号登录

```typescript
import { authApi } from '@/modules/api-services';

try {
  const response = await authApi.loginBySms({
    phone: '13800138000',
    smsCode: '123456'
  });
  
  // 处理登录响应...
} catch (error) {
  console.error('登录失败:', error);
}
```

#### 3. 发送短信验证码

```typescript
import { authApi } from '@/modules/api-services';
import { BtcMessage } from '@btc/shared-components';

try {
  await authApi.sendSmsCode({
    phone: '13800138000',
    smsType: 'login'  // 'login' | 'register' | 'reset-password' | 'forgot'
  });
  BtcMessage.success('验证码已发送');
} catch (error) {
  BtcMessage.error('发送验证码失败');
}
```

#### 4. 获取图片验证码

```typescript
import { authApi } from '@/modules/api-services';

try {
  const response = await authApi.getCaptcha({
    height: 45,
    width: 150,
    color: '#2c3142'
  });
  
  // response.captchaId 用于后续验证
  // response.data 是 base64 或 svg 格式的图片数据
} catch (error) {
  console.error('获取验证码失败:', error);
}
```

#### 5. 用户注册

```typescript
import { authApi } from '@/modules/api-services';

try {
  await authApi.register({
    username: 'newuser',
    phone: '13800138000',
    password: '123456',
    smsCode: '123456'  // 可选
  });
  BtcMessage.success('注册成功');
} catch (error) {
  BtcMessage.error('注册失败');
}
```

#### 6. 重置密码

```typescript
import { authApi } from '@/modules/api-services';

try {
  await authApi.resetPassword({
    phone: '13800138000',
    smsCode: '123456',
    newPassword: 'newpass123'
  });
  BtcMessage.success('密码重置成功');
} catch (error) {
  BtcMessage.error('重置密码失败');
}
```

#### 7. 退出登录

```typescript
import { authApi } from '@/modules/api-services';

try {
  await authApi.logout();
  // 清除本地存储的 token 和用户信息
  localStorage.removeItem('token');
  router.push('/login');
} catch (error) {
  console.error('退出登录失败:', error);
  // 即使 API 调用失败，前端也要执行清理操作
}
```

### 验证码 API (codeApi) - 推荐使用 Composable

验证码功能推荐使用 `@btc/shared-core` 提供的 Composable，提供完整的状态管理：

```typescript
import { useSmsCode, useEmailCode } from '@btc/shared-core';
import { codeApi } from '@/modules/api-services';

// 短信验证码
const { countdown, sending, canSend, send, reset } = useSmsCode({
  sendSmsCode: codeApi.sendSmsCode,
  countdown: 60,
  minInterval: 60,
  onSuccess: () => {
    BtcMessage.success('验证码已发送');
  }
});

// 发送验证码
await send('13800138000', 'login');

// 邮箱验证码
const emailCode = useEmailCode({
  sendEmailCode: codeApi.sendEmailCode,
  countdown: 60,
  onSuccess: () => {
    BtcMessage.success('验证码已发送到邮箱');
  }
});

await emailCode.send('user@example.com', 'register');
```

**直接使用 API（不推荐）：**

```typescript
import { codeApi } from '@/modules/api-services';

// 发送短信验证码
await codeApi.sendSmsCode({
  phone: '13800138000',
  smsType: 'login'
});

// 发送邮箱验证码
await codeApi.sendEmailCode({
  email: 'user@example.com',
  type: 'register'
});
```

## API 列表

### 验证码 API (codeApi)

| 方法 | 说明 | 参数类型 | 返回类型 |
|------|------|---------|---------|
| `sendSmsCode()` | 发送短信验证码 | `{ phone, smsType? }` | `Promise<void>` |
| `sendEmailCode()` | 发送邮箱验证码 | `{ email, type? }` | `Promise<void>` |

### 认证 API (authApi)
### 系统 API (sysApi)

| 方法 | 说明 | 参数类型 | 返回类型 |
|------|------|---------|---------|
| `sysApi.apiDocs.page()` | 分页查询接口文档 | `Record<string, any>` | `Promise<any>` |
| `sysApi.apiDocs.list()` | 查询接口文档列表 | `Record<string, any>` | `Promise<any>` |


| 方法 | 说明 | 参数类型 | 返回类型 |
|------|------|---------|---------|
| `getCaptcha()` | 获取图片验证码 | `{ height?, width?, color? }` | `CaptchaResponse` |
| `healthCheck()` | 健康检查 | - | `HealthCheckResponse` |
| `login()` | 账号密码登录 | `LoginRequest` | `LoginResponse` |
| `loginBySms()` | 手机号登录 | `SmsLoginRequest` | `LoginResponse` |
| `logout()` | 退出登录 | - | `Promise<void>` |
| `logoutBatch()` | 批量退出登录 | `LogoutBatchRequest` | `Promise<void>` |
| `register()` | 用户注册 | `RegisterRequest` | `Promise<void>` |
| `resetPassword()` | 重置密码 | `ResetPasswordRequest` | `Promise<void>` |
| `verifyCode()` | 验证码校验 | `VerifyCodeRequest` | `Promise<void>` |

## 类型定义

所有 API 的请求和响应类型都在 `types.ts` 文件中定义，提供完整的 TypeScript 类型支持。

主要类型包括：
- `LoginRequest` / `LoginResponse` - 登录请求和响应
- `SmsLoginRequest` - 短信登录请求
- `RegisterRequest` - 注册请求
- `ResetPasswordRequest` - 重置密码请求
- `CaptchaResponse` - 验证码响应
- 等等...

## 扩展指南

如果需要添加新的业务模块 API（非 EPS 系统中的 API），按照以下步骤：

### 1. 创建新的 API 服务文件

在 `modules/api-services/` 下创建新的目录，例如 `other-module/index.ts`：

```typescript
import { requestAdapter } from '@/utils/requestAdapter';

export const otherModuleApi = {
  // 定义 API 方法
  someMethod(data: SomeRequest) {
    return requestAdapter.post('/some/path', data, { notifySuccess: false });
  }
};
```

### 2. 添加类型定义

在 `types.ts` 中添加相关的类型定义：

```typescript
export interface SomeRequest {
  // 请求参数类型
}
```

### 3. 导出新模块

在 `index.ts` 中导出：

```typescript
export { authApi } from './auth';
export { otherModuleApi } from './other-module';  // 新增
```

### 4. 更新 README

在 README 中添加新模块的说明和 API 列表。

## 验证码 Composable 详细说明

### useSmsCode / useEmailCode

提供完整的验证码发送状态管理，包括：

**功能特性：**
- ✅ 自动倒计时（默认 60 秒，可配置）
- ✅ 发送状态管理（loading）
- ✅ 已发送状态标记
- ✅ 发送频率限制（防止频繁发送）
- ✅ 自动清理定时器（组件卸载时）
- ✅ 格式验证（手机号/邮箱）
- ✅ 自定义成功/失败回调

**状态说明：**
- `countdown`: 倒计时剩余秒数
- `sending`: 是否正在发送中
- `hasSent`: 是否已发送过验证码
- `canSend`: 是否可以发送（倒计时结束且不在发送中）

**使用示例：**

```vue
<template>
  <el-input v-model="phone" placeholder="请输入手机号">
    <template #suffix>
      <el-button
        :disabled="!canSend || !phone"
        :loading="sending"
        @click="handleSendCode"
      >
        {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
      </el-button>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSmsCode } from '@btc/shared-core';
import { codeApi } from '@/modules/api-services';
import { BtcMessage } from '@btc/shared-components';

const phone = ref('');

const { countdown, sending, canSend, send } = useSmsCode({
  sendSmsCode: codeApi.sendSmsCode,
  countdown: 60,
  minInterval: 60,
  onSuccess: () => {
    BtcMessage.success('验证码已发送');
  },
  onError: (error) => {
    BtcMessage.error(error.message);
  }
});

const handleSendCode = async () => {
  try {
    await send(phone.value, 'login');
  } catch (error) {
    // 错误已通过 onError 回调处理
  }
};
</script>
```

## 注意事项

### 与 EPS 系统的区别

- **EPS 系统**：通过 `virtual:eps` 虚拟模块自动生成，提供标准的 CRUD 接口（list、page、info、add、update、delete 等）
- **本模块**：手动管理非标准的业务 API，需要开发者自行维护

### 使用场景

使用本模块的场景：
- 登录、注册等认证相关的 API
- 发送验证码、校验验证码等特殊业务 API
- 批量操作、自定义查询等非标准 CRUD API
- 其他 EPS 系统无法覆盖的 API

使用 EPS 系统的场景：
- 标准的列表查询、分页查询
- 标准的增删改查操作
- 后端已配置在 EPS 中的服务

### 错误处理

所有 API 方法都会抛出错误，需要调用方自行处理：

```typescript
try {
  await authApi.login(data);
} catch (error: any) {
  // 统一错误处理
  BtcMessage.error(error.message || '操作失败');
}
```

### HTTP 工具

本模块使用 `@/utils/http` 工具进行 HTTP 请求，该工具已经配置了：
- 自动添加 Authorization header（从 localStorage 获取 token）
- 统一错误处理
- 请求重试机制
- 请求日志记录

## 相关文档

- [登录页面模块](../../pages/auth/login/README.md)
- [注册页面模块](../../pages/auth/register/README.md)
- [忘记密码模块](../../pages/auth/forget-password/README.md)
- [HTTP 工具文档](../../utils/http.ts)

