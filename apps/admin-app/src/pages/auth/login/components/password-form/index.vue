<template>
  <BtcLoginFormLayout>
    <template #form>
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
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
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="t('请输入密码')"
            size="large"
            show-password
            maxlength="20"
            @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
          />
        </el-form-item>
      </el-form>
    </template>

    <template #button>
      <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
        {{ t('立即登录') }}
      </el-button>
    </template>

    <template #extra>
      <div class="forgot-password-link">
        <router-link to="/forget-password" class="link">
          {{ t('忘记密码？') }}
          <el-icon class="arrow-right">
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>
    </template>
  </BtcLoginFormLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcLoginFormLayout from '../../../shared/components/login-form-layout/index.vue';
import { useFormEnterKey } from '../../../shared/composables/useFormEnterKey';
import { appStorage } from '@/utils/app-storage';

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
// 从统一存储中获取用户名
const getStoredUsername = (): string => {
  return appStorage.user.getUsername() || '';
};

const form = reactive({
  username: getStoredUsername(),
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

// 使用 Enter 键处理 Composable
const { handleEnterKey } = useFormEnterKey({
  formRef,
  onSubmit: handleSubmit
});

// 暴露表单数据和方法供父组件使用
defineExpose({
  form,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style lang="scss" scoped>
.form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .el-input {
    width: 100%;
  }
}

.forgot-password-link {
  margin-top: 16px;
}
</style>
