<template>
  <div class="password-login">
    <!-- 登录表单 -->
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :placeholder="t('请输入用户名或邮箱')"
          size="large"
          @focus="() => console.log('用户名获得焦点:', form.username)"
          @blur="() => console.log('用户名失去焦点:', form.username)"
          @input="(val: string) => console.log('用户名输入:', val)"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="t('请输入密码')"
          size="large"
          show-password
          @keyup.enter="handleSubmit"
          @focus="() => console.log('密码获得焦点:', { username: form.username, password: form.password })"
          @blur="() => console.log('密码失去焦点:', { username: form.username, password: form.password })"
        />
      </el-form-item>
    </el-form>

    <!-- 登录按钮 -->
    <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleSubmit">
      {{ t('立即登录') }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, toRaw } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useBtc } from '/@/btc';
import { useBase } from '/$/base';
import { passwordLogin } from '../../shared/composables/api';

defineOptions({
  name: 'PasswordLoginView'
});

const { router } = useBtc();
const { user } = useBase();
const { t } = useI18n();

// 表单数据 - 直接在组件内管理，避免 props 传递问题
const form = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' },
    { min: 2, max: 50, message: t('用户名长度在 2 到 50 个字符'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('请输入密码'), trigger: 'blur' },
    { min: 6, max: 20, message: t('密码长度在 6 到 20 个字符'), trigger: 'blur' }
  ]
});

// 表单数据管理完成

// 加载状态
const loading = ref(false);

const formRef = ref<FormInstance>();

// 提交函数
const handleSubmit = async () => {
  // 先进行表单验证
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch {
    // 验证失败，不继续执行
    return;
  }

  try {
    loading.value = true;

    // 调用登录接口 - 传纯数据快照，避免 API 污染响应式对象
    const payload = { ...toRaw(form) };
    const response = await passwordLogin(payload);

    if (response.code === 2000) {
      ElMessage.success(t('登录成功'));
      // 保存token和用户信息
      if (response.data) {
        if (response.data.token) {
          // 使用新格式，包含过期时间和refresh token
          const tokenData = {
            token: response.data.token,
            expire: response.data.expires_in || 1800, // 默认30分钟
            refreshToken: response.data.refresh_token || '',
            refreshExpire: 604800 // 默认7天
          };
          user.setToken(tokenData);
        }
        if (response.data.user) {
          user.setInfo(response.data.user);
        }
      }

      // 跳转到首页
      router.push('/');
    } else {
      ElMessage.error(response.msg || t('登录失败'));
    }
  } catch (error: unknown) {
    console.error('登录错误:', error);
    const errorMessage = error instanceof Error ? error.message : t('登录失败');
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.password-login {
  .form {
    .el-form-item {
      margin-bottom: 16px;
    }

    .el-input {
      width: 100%;
    }
  }

  .login-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
