<template>
  <div class="agreement-text">
    <span>{{ t('未注册手机验证后自动登录，注册即代表同意') }}</span>
    <a href="#" class="agreement-link">{{ t('《拜里斯科技软件协议》') }}</a>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'BtcAgreementText'
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.agreement-text {
  text-align: left;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.6;
  margin: 0;
  padding: 0;

  span {
    color: var(--el-text-color-placeholder);
  }

  .agreement-link {
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary-light-3);
      text-decoration: underline;
    }
  }
}
</style>
