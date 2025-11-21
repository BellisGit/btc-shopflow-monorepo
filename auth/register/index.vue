<template>
  <BtcAuthLayout class="glassmorphism">
    <div class="login-card">
      <BtcAuthHeader />

      <div class="card-content">
        <!-- 返回登录链接 - 与登录页面的"前往注册"链接位置一致 -->
        <div class="back-to-login-wrapper">
          <div class="back-to-login">
            <router-link to="/login" class="back-to-login-link">
              {{ t('auth.back_to_login') }}
              <el-icon class="arrow-right">
                <ArrowRight />
              </el-icon>
            </router-link>
          </div>
        </div>

        <BtcRegisterForm
          :form="form"
          :rules="rules"
          :loading="loading"
          @submit="handleSubmit"
          ref="formRef"
        />

        <!-- 协议文本 -->
        <BtcAgreementText 
          ref="agreementRef"
          @agreement-change="handleAgreementChange" 
        />
      </div>
    </div>

    <BtcAuthFooter />
  </BtcAuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcAuthLayout from '../shared/components/auth-layout/index.vue';
import BtcAuthHeader from '../shared/components/auth-header/index.vue';
import BtcAuthFooter from '../shared/components/auth-footer/index.vue';
import BtcRegisterForm from './register-form/index.vue';
import BtcAgreementText from '../shared/components/agreement-text/index.vue';
import { BtcMessage } from '@btc/shared-components';
import { useRegister } from './composables/useRegister';
import '../shared/styles/index.scss';

defineOptions({
  name: 'Register'
});

const { t } = useI18n();
const formRef = ref();
const agreementRef = ref();
// 协议同意状态
const isAgreed = ref(false);

const {
  form,
  rules,
  loading,
  register
} = useRegister();

// 协议状态变化处理
const handleAgreementChange = (agreed: boolean) => {
  isAgreed.value = agreed;
};

// 检查协议同意状态
const checkAgreement = (): boolean => {
  if (!isAgreed.value) {
    BtcMessage.warning(t('auth.message.agreement_required'));
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  try {
    if (!formRef.value) return;
    if (!checkAgreement()) {
      return;
    }
    await register(formRef.value.formRef);
  } catch (error) {
    console.error('注册错误:', error);
    // 错误已在 useRegister 中处理，这里只是防止未捕获的错误
  }
};
</script>

<style lang="scss">
// 注册页面样式已经在共享样式中定义
</style>

