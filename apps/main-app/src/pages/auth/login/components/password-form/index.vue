<template>
  <div class="password-login">
    <!-- 登录表单 -->
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :placeholder="t('请输入用户名或邮箱')"
          size="large"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="t('请输入密码')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <!-- 登录按钮 -->
    <div class="op">
      <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
        {{ t('立即登录') }}
      </el-button>
    </div>

    <!-- 忘记密码链接 -->
    <div class="forgot-password-link">
      <router-link to="/forget-password" class="link">
        {{ t('忘记密码？') }}
        <el-icon class="arrow-right">
          <ArrowRight />
        </el-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';

defineOptions({
  name: 'BtcPasswordForm'
});

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  submit: [form: { username: string; password: string }];
}>();

const { t } = useI18n();

// 表单数据
const form = reactive({
  username: localStorage.getItem('username') || '',
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

const formRef = ref<FormInstance>();

// 提交函数
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit', { ...form });
  } catch {
    // 验证失败，不继续执行
  }
};

// 暴露表单数据和方法供父组件使用
defineExpose({
  form,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style lang="scss" scoped>
.password-login {
  display: flex;
  flex-direction: column;
  width: 100%;

  .form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .el-input {
      width: 100%;
    }
  }

  .op {
    width: 100%;
    margin-top: 4px; // 与表单的间距

    .el-button {
      width: 100%;
    }
  }
}
</style>
