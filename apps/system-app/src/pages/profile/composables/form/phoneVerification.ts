import { useSmsCode } from '@btc/shared-core';
// @ts-expect-error - 类型声明文件可能未构建，但运行时可用
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';

export type PhoneSmsState = ReturnType<typeof useSmsCode>;

export function usePhoneVerification() {
  const sendSmsCode = async (data: { phone: string; smsType?: string }) => {
    const phoneService = service.admin?.base?.phone;
    if (!phoneService?.bind) {
      throw new Error('手机号服务不可用');
    }
    await phoneService.bind({
      phone: data.phone,
      smsType: data.smsType || 'bind'
    });
  };

  const phoneUpdateSmsCodeState = useSmsCode({
    sendSmsCode,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      BtcMessage.success('验证码已发送');
    },
    onError: (error) => {
      BtcMessage.error(error.message || '发送验证码失败');
    }
  });

  return {
    phoneUpdateSmsCodeState
  };
}

