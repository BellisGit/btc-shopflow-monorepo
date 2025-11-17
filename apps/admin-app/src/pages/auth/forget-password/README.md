# 忘记密码页面模块

密码重置功能模块，提供用户找回和重置密码功能。这是一个独立的页面，不会出现在菜单中。

## 目录结构

```
forget-password/
├── components/      # 忘记密码相关组件
├── composables/     # 忘记密码相关的组合式函数
├── styles/          # 忘记密码页面样式
└── README.md        # 本文件
```

## 功能说明

### 主要功能
- 通过邮箱/手机号找回密码
- 发送验证码
- 重置密码
- 密码强度校验

### 技术栈
- Vue 3 Composition API
- Element Plus 表单组件
- 验证码服务集成
- 密码重置流程管理

## 路由配置

本页面为独立路由，不包含在 Layout 中，需要单独配置路由：

```typescript
{
  path: '/forget-password',
  name: 'ForgetPassword',
  component: () => import('../pages/auth/forget-password/index.vue'),
  meta: { 
    public: true,  // 公开页面，不需要认证
    noLayout: true // 不使用 Layout 布局
  }
}
```

## 开发计划

- [ ] 找回密码表单组件
- [ ] 验证码发送功能
- [ ] 验证码验证逻辑
- [ ] 重置密码表单
- [ ] 密码重置 API 集成
- [ ] 错误处理
- [ ] 样式优化

## 使用示例

```vue
<script setup lang="ts">
import { useForgetPassword } from './composables/useForgetPassword';

const { 
  step, 
  formData, 
  loading, 
  handleSendCode, 
  handleVerifyCode,
  handleResetPassword 
} = useForgetPassword();
</script>

<template>
  <ForgetPasswordForm
    :step="step"
    :model="formData"
    :loading="loading"
    @send-code="handleSendCode"
    @verify-code="handleVerifyCode"
    @reset-password="handleResetPassword"
  />
</template>
```

## 相关文档

- [登录模块](../login/README.md)
- [注册模块](../register/README.md)

