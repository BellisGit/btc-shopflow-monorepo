<template>
  <div class="agreement-checkbox">
    <Checkbox v-model="checked" @update:model-value="handleChange">
      <span class="agreement-checkbox__text">
        登录代表您已同意<span class="agreement-checkbox__link" @click.stop="handleUserAgreement">《服务协议》</span>以及<span class="agreement-checkbox__link" @click.stop="handlePrivacyPolicy">《拜里斯隐私保护指引》</span>
      </span>
    </Checkbox>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Checkbox, showToast } from 'vant';

defineOptions({
  name: 'BtcAgreementCheckbox',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const checked = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  checked.value = val;
});

watch(checked, (val) => {
  emit('update:modelValue', val);
  emit('change', val);
});

const handleChange = (value: boolean) => {
  checked.value = value;
};

const handleUserAgreement = () => {
  showToast({
    type: 'loading',
    message: '服务协议功能开发中...',
    duration: 1500,
  });
  // TODO: 打开服务协议页面
};

const handlePrivacyPolicy = () => {
  showToast({
    type: 'loading',
    message: '拜里斯隐私保护指引功能开发中...',
    duration: 1500,
  });
  // TODO: 打开拜里斯隐私保护指引页面
};
</script>

