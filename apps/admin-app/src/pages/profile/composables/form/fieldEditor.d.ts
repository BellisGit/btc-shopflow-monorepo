import type { Ref } from 'vue';
import type { PhoneSmsState } from './phoneVerification';
interface FieldEditorOptions {
    Form: Ref<any>;
    userInfo: Ref<any>;
    showFullInfo: Ref<boolean>;
    loadUserInfo: (showFull: boolean) => Promise<void>;
    phoneUpdateSmsCodeState: PhoneSmsState;
    sendUpdateEmailCode: (email: string) => Promise<void>;
    emailUpdateCountdown: Ref<number>;
    emailUpdateSending: Ref<boolean>;
    resetEmailUpdateCountdown: () => void;
    onRequestVerify?: (field: string) => void;
    onSetVerifyCallback?: (callback: () => void) => void;
}
export declare function useFieldEditor({ Form, userInfo, showFullInfo, loadUserInfo, phoneUpdateSmsCodeState, sendUpdateEmailCode, emailUpdateCountdown, emailUpdateSending, resetEmailUpdateCountdown, onRequestVerify, onSetVerifyCallback }: FieldEditorOptions): {
    handleEditField: (field: string) => Promise<void>;
    handleBindField: (field: string) => void;
};
export {};
