# 注册页面模块

用户注册功能模块，提供新用户注册功能。这是一个独立的页面，不会出现在菜单中。

## 目录结构

```
register/
├── components/      # 注册相关组件
├── composables/     # 注册相关的组合式函数
├── styles/          # 注册页面样式
└── README.md        # 本文件
```

## 功能说明

### 主要功能
- 新用户注册
- 表单验证（用户名、密码、邮箱等）
- 密码强度校验
- 验证码验证（可选）
- 用户协议确认

### 技术栈
- Vue 3 Composition API
- Element Plus 表单组件
- 自定义验证规则
- 密码强度检测

## 路由配置

本页面为独立路由，不包含在 Layout 中，需要单独配置路由：

```typescript
{
  path: '/register',
  name: 'Register',
  component: () => import('../pages/auth/register/index.vue'),
  meta: { 
    public: true,  // 公开页面，不需要认证
    noLayout: true // 不使用 Layout 布局
  }
}
```

## 开发计划

- [ ] 注册表单组件
- [ ] 表单验证逻辑
- [ ] 密码强度检测
- [ ] 注册 API 集成
- [ ] 验证码集成（可选）
- [ ] 错误处理
- [ ] 样式优化

## 使用示例

```vue
<script setup lang="ts">
import { useRegister } from './composables/useRegister';

const { formData, loading, handleSubmit } = useRegister();
</script>

<template>
  <RegisterForm
    :model="formData"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
```

## 相关文档

- [登录模块](../login/README.md)
- [忘记密码模块](../forget-password/README.md)

