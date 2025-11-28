<template>
  <div class="login-buttons">
    <!-- 手机号登录按钮 -->
    <Button
      class="login-buttons__phone"
      round
      block
      type="primary"
      :loading="phoneLoading"
      :disabled="phoneLoading"
      @click="handlePhoneLogin"
    >
      <Icon name="phone-o" class="login-buttons__icon login-buttons__icon--white" />
      <span>手机号登录</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, Icon } from 'vant';
import { usePhoneLogin } from '../../composables/usePhoneLogin';

defineOptions({
  name: 'BtcLoginButtons',
});

const emit = defineEmits<{
  phoneLogin: [];
}>();

const { loading: phoneLoading } = usePhoneLogin();

const handlePhoneLogin = async () => {
  emit('phoneLogin');
};

</script>

