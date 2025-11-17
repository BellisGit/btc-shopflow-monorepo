# 登录页面模块

登录功能模块，提供用户身份认证功能。这是一个独立的页面，不会出现在菜单中。

## 目录结构

```
login/
├── components/      # 登录相关组件
├── composables/     # 登录相关的组合式函数
├── styles/          # 登录页面样式
└── README.md        # 本文件
```

## 功能说明

### 主要功能
- 用户登录
- 用户名/密码验证
- 记住登录状态
- 第三方登录（可选）

### 技术栈
- Vue 3 Composition API
- Element Plus 表单组件
- Pinia 状态管理
- 自定义组合式函数

## 路由配置

本页面为独立路由，不包含在 Layout 中，需要单独配置路由：

```typescript
{
  path: '/login',
  name: 'Login',
  component: () => import('../pages/auth/login/index.vue'),
  meta: { 
    public: true,  // 公开页面，不需要认证
    noLayout: true // 不使用 Layout 布局
  }
}
```

## 开发计划

- [ ] 登录表单组件
- [ ] 表单验证逻辑
- [ ] 登录 API 集成
- [ ] 记住密码功能
- [ ] 错误处理
- [ ] 样式优化

## 使用示例

```vue
<script setup lang="ts">
import { useLogin } from './composables/useLogin';

const { formData, loading, handleSubmit } = useLogin();
</script>

<template>
  <LoginForm
    :model="formData"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
```

## 相关文档

- [注册模块](../register/README.md)
- [忘记密码模块](../forget-password/README.md)

