import { useSmsCode } from '@btc/shared-core';
export type PhoneSmsState = ReturnType<typeof useSmsCode>;
export declare function usePhoneVerification(): {
    phoneUpdateSmsCodeState: any;
};
