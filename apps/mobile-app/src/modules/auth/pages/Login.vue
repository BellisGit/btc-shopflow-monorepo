<template>
  <div class="login-page">
    <Form @submit="handleLogin">
      <CellGroup inset>
        <Field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <Field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </CellGroup>
      <div style="margin: 16px">
        <Button round block type="primary" native-type="submit">
          登录
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Form, CellGroup, Field, Button } from 'vant';
import { useAuthStore } from '@/stores/auth';

defineOptions({
  name: 'BtcMobileLogin',
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  username: '',
  password: '',
});

async function handleLogin() {
  try {
    // TODO: 调用登录 API
    const mockToken = 'mock-token-' + Date.now();
    const mockUser = { id: 1, username: form.value.username };
    
    authStore.login(mockToken, mockUser);
    
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (error) {
    console.error('[Login] Failed:', error);
  }
}
</script>


