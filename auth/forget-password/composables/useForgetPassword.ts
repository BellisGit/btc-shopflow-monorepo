import { ref, reactive, watch, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useBtc } from '/@/btc';
import { useBase } from '/$/base';

export function useForgetPassword(phoneFormRef?: any, passwordFormRef?: any, authStepFormRef?: any) {
  // 表单数据
  const formData = reactive({
    phone: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  });


  // 状态
  const loading = ref(false);
  const smsCountdown = ref(0);
  const hasSentSms = ref(false);
  const phoneError = ref('');
  const isPhoneValid = ref(false);
  const canReset = ref(false);
  const currentStep = ref(0);
  const { router } = useBtc();
  const { app } = useBase();
  const { t } = useI18n();


  let countdownTimer: number | null = null;

  // 步骤配置
  const stepList = [
    { title: '验证身份' },
    { title: '重置密码' }
  ];

  const stepDescriptions = [
    '通过手机号验证身份',
    '请设置新密码'
  ];

  // 表单验证规则
  const formRules = reactive({
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    smsCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 6, message: '验证码为6位数', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
      { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, message: '密码必须包含数字和字母', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (rule: any, value: any, callback: any) => {
          if (value !== formData.newPassword) {
            callback(new Error('两次输入密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  });

  // 验证手机号
  function validatePhone() {
    const phoneRegex = /^1[3-9]\d{9}$/;
    isPhoneValid.value = phoneRegex.test(formData.phone);

    if (formData.phone && !isPhoneValid.value) {
      phoneError.value = '请输入正确的手机号';
    } else {
      phoneError.value = '';
    }

    // 更新是否可以重置密码
    updateCanReset();
  }

  // 发送短信验证码
  async function sendSmsCode() {
    if (!phoneFormRef?.value) {
      return;
    }

    // 先验证手机号
    validatePhone();
    if (!isPhoneValid.value) {
      ElMessage.error('请输入正确的手机号');
      return;
    }

    try {
      loading.value = true;
      // 这里应该调用发送短信的API
      // await service.base.open.sendSms({ phone: formData.phone });

      ElMessage.success('验证码已发送');
      hasSentSms.value = true;
      startCountdown();
    } catch (error) {
      ElMessage.error('发送失败，请重试');
      console.error('发送短信失败', error);
    } finally {
      loading.value = false;
    }
  }

  // 开始倒计时
  function startCountdown() {
    smsCountdown.value = 60;
    countdownTimer = setInterval(() => {
      smsCountdown.value--;
      if (smsCountdown.value <= 0) {
        clearInterval(countdownTimer!);
        countdownTimer = null;
      }
    }, 1000);
  }

  // 手机号回车事件
  function handlePhoneEnter() {
    if (isPhoneValid.value && smsCountdown.value === 0) {
      sendSmsCode();
    }
  }

  // 验证码输入完成
  function onCodeComplete(code: string) {
    formData.smsCode = code;
    // 检查是否可以重置密码
    updateCanReset();
  }

  // 更新是否可以重置密码
  function updateCanReset() {
    canReset.value = isPhoneValid.value && formData.smsCode.length === 6;
  }

  // 下一步
  async function handleNextStep() {
    if (currentStep.value === 0) {
      if (!phoneFormRef?.value) {
        return;
      }

      try {
        await phoneFormRef.value.validate();
        authStepFormRef.value?.nextStep();
        currentStep.value = 1;
      } catch (error) {
        // 表单验证失败
      }
    } else if (currentStep.value === 1) {
      await handleResetPassword();
    }
  }

  // 上一步
  function handlePrevStep() {
    authStepFormRef.value?.prevStep();
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  // 步骤变化
  function handleStepChange(step: number) {
    currentStep.value = step;
    console.log('步骤变化:', step);
  }

  // 完成
  function handleFinish() {
    // 重置密码流程完成
  }

  // 重置密码
  async function handleResetPassword() {
    if (!passwordFormRef?.value) return;
    try {
      loading.value = true;
      await passwordFormRef.value.validate();

      // 这里应该调用重置密码的API
      // const response = await service.base.open.resetPassword({
      //   phone: formData.phone,
      //   smsCode: formData.smsCode,
      //   newPassword: formData.newPassword
      // });

      // if (response.success) {
        ElMessage.success('密码重置成功');
        await showResetSuccessDialog();
      // } else {
      //   ElMessage.error(response.message || '重置失败，请重试');
      // }
    } catch (error) {
      console.error('重置密码失败:', error);
      ElMessage.error('重置失败，请重试');
    } finally {
      loading.value = false;
    }
  }

  // 显示重置成功对话框
  async function showResetSuccessDialog() {
    try {
      await ElMessageBox.confirm(
        '密码重置成功！请前往登录页面',
        '重置成功',
        {
          confirmButtonText: '去登录',
          cancelButtonText: '不用了',
          type: 'success',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          buttonSize: 'large',
          distinguishCancelAndClose: true,
          cancelButtonClass: 'el-button--default'
        }
      );
      router.push('/login');
    } catch (error) {
      console.log('用户点击"不用了"或关闭对话框');
    }
  }

  // 清理定时器
  function cleanup() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  onBeforeUnmount(() => {
    cleanup();
  });

  // 为模板创建分开的表单对象
  const phoneForm = reactive({
    phone: formData.phone,
    smsCode: formData.smsCode
  });

  const passwordForm = reactive({
    newPassword: formData.newPassword,
    confirmPassword: formData.confirmPassword
  });

  // 同步表单数据
  watch(() => phoneForm.phone, (val) => { formData.phone = val; });
  watch(() => phoneForm.smsCode, (val) => { formData.smsCode = val; });
  watch(() => passwordForm.newPassword, (val) => { formData.newPassword = val; });
  watch(() => passwordForm.confirmPassword, (val) => { formData.confirmPassword = val; });

  // 创建分开的验证规则
  const phoneRules = {
    phone: formRules.phone,
    smsCode: formRules.smsCode
  };

  const passwordRules = {
    newPassword: formRules.newPassword,
    confirmPassword: formRules.confirmPassword
  };

  return {
    formData,
    phoneForm,
    passwordForm,
    phoneRules,
    passwordRules,
    loading,
    smsCountdown,
    hasSentSms,
    phoneError,
    isPhoneValid,
    canReset,
    currentStep,
    stepList,
    stepDescriptions,
    formRules,
    validatePhone,
    sendSmsCode,
    handlePhoneEnter,
    onCodeComplete,
    handleNextStep,
    handlePrevStep,
    handleStepChange,
    handleFinish,
    app,
    t // 添加 t 函数
  };
}
