<template>
  <div class="guest-mode-button">
    <Button plain size="small" @click="handleGuestMode">
      游客模式
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, showToast } from 'vant';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'BtcGuestModeButton',
});

const router = useRouter();

const handleGuestMode = () => {
  showToast({
    type: 'loading',
    message: '游客模式功能开发中...',
    duration: 1500,
  });
  // TODO: 实现游客模式逻辑
  // router.push('/');
};
</script>

