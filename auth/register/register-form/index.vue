<template>
  <div class="register-form">
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
      <!-- 用户名/邮箱输入 -->
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          name="username"
          autocomplete="username"
          :placeholder="t('请输入用户名或邮箱')"
          size="large"
          maxlength="50"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
        />
      </el-form-item>

      <!-- 手机号输入 -->
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          name="phone"
          autocomplete="tel"
          :placeholder="t('请输入手机号')"
          size="large"
          maxlength="11"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
        />
      </el-form-item>

      <!-- 密码输入 -->
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          :placeholder="t('请输入密码')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
        />
      </el-form-item>

      <!-- 确认密码输入 -->
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="t('请再次输入密码')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
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
import { useFormEnterKey } from '../../shared/composables/useFormEnterKey';

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

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit');
  } catch {
    // 验证失败，不继续执行
  }
};

// 使用 Enter 键处理 Composable
const { handleEnterKey } = useFormEnterKey({
  formRef,
  onSubmit: handleSubmit
});

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

