<template>
  <div class="qr-login">
    <div class="qr-container">
      <div class="qr-code">
        <img :src="qrCodeUrl || loginQrImage" alt="扫码登录" />
      </div>
      <div class="qr-tips">
        <p>{{ props.t('请使用BTC移动端扫描二维码登录') }}</p>
        <el-button @click="refreshQrCode">
          {{ props.t('刷新二维码') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import loginQrImage from '/@/assets/images/login_qr.png';

defineOptions({
  name: 'qr-login-view'
});

// 接收ViewModel数据的props
const props = defineProps<{
  qrCodeUrl: string;
  refreshQrCode: () => void;
  t: (key: string, params?: any) => string;
}>();
</script>

<style lang="scss" scoped>
.qr-login {
  .qr-container {
    text-align: center;

    .qr-code {
      margin-bottom: 20px;

      img {
        width: 200px;
        height: 200px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
      }
    }

    .qr-tips {
      p {
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }

      .el-button {
        margin-top: 8px;
      }
    }
  }
}
</style>
