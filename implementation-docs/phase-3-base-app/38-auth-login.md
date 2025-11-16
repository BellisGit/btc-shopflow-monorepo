# 22 - 登录认证

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 21

## 🎯 任务目标

实现登录页面和 Token 管理功能。

## 📋 执行步骤

### 1. 创建登录页面

**src/views/login/index.vue**:
```vue
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>BTC 管理系统</h2>

      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            native-type="submit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store';
import type { FormInstance } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = ref({
  username: 'admin',
  password: '123456',
});

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

const handleLogin = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate();
  loading.value = true;

  try {
    // 实际项目中调用登录接口
    // const res = await service.auth.login(form.value);
    
    // Mock 登录
    const mockUser = { id: 1, name: '管理员' };
    const mockToken = 'mock-token-xxx';
    
    userStore.setUserInfo(mockUser, mockToken);
    
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}
</style>
```

### 2. 添加登录路由

**src/router/index.ts**:
```typescript
const routes = [
  {
    path: '/login',
    component: () => import('../views/login/index.vue'),
    meta: { noAuth: true },
  },
  // ...
];
```

## ✅ 验收标准

### 检查：登录流程

```bash
# 访问 http://localhost:5000/login
# 输入: admin / 123456
# 点击登录
# 预期: 跳转到 /dashboard
# 预期: localStorage 中有 token
# 预期: userStore 有用户信息
```

## 📝 检查清单

- [ ] 登录页面创建
- [ ] 表单校验
- [ ] 登录逻辑
- [ ] Token 存储
- [ ] 状态更新
- [ ] 路由跳转

## 🔗 下一步

- [23 - 路由守卫](./23-route-guard.md)

