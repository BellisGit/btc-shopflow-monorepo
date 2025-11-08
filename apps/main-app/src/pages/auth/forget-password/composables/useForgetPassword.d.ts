export declare function useForgetPassword(): {
    form: {
        phone: string;
        smsCode: string;
        newPassword: string;
        confirmPassword: string;
    };
    rules: {
        phone: ({
            required: boolean;
            message: string;
            trigger: string;
            pattern?: unknown;
        } | {
            pattern: RegExp;
            message: string;
            trigger: string;
            required?: unknown;
        })[];
        smsCode: ({
            required: boolean;
            message: string;
            trigger: string;
            len?: unknown;
        } | {
            len: number;
            message: string;
            trigger: string;
            required?: unknown;
        })[];
        newPassword: ({
            required: boolean;
            message: string;
            trigger: string;
            min?: unknown;
            max?: unknown;
        } | {
            min: number;
            max: number;
            message: string;
            trigger: string;
            required?: unknown;
        })[];
        confirmPassword: ({
            required: boolean;
            message: string;
            trigger: string;
            validator?: unknown;
        } | {
            validator: (rule: any, value: string, callback: Function) => void;
            trigger: string;
            required?: unknown;
            message?: unknown;
        })[];
    };
    loading: globalThis.Ref<boolean, boolean>;
    sending: any;
    smsCountdown: any;
    hasSentSms: any;
    sendSmsCode: () => Promise<void>;
    resetPassword: (formRef: any) => Promise<void>;
};
