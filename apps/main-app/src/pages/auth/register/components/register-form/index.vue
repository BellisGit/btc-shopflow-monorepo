<template>
  <div class="register-form">
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
      <!-- 用户名/邮箱输入 -->
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :placeholder="t('请输入用户名或邮箱')"
          size="large"
          maxlength="50"
        />
      </el-form-item>

      <!-- 手机号输入 -->
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          :placeholder="t('请输入手机号')"
          size="large"
          maxlength="11"
        />
      </el-form-item>

      <!-- 密码输入 -->
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="t('请输入密码')"
          size="large"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <!-- 确认密码输入 -->
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          :placeholder="t('请再次输入密码')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <!-- 提交按钮 -->
    <div class="op">
      <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
        {{ t('立即注册') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'BtcRegisterForm'
});

interface Props {
  form: {
    username: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  rules: FormRules;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [];
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();

const handleSubmit = () => {
  emit('submit');
};

defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style lang="scss" scoped>
.register-form {
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
    margin-top: 4px;

    .el-button {
      width: 100%;
    }
  }
}
</style>

