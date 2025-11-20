import type { Ref } from 'vue';
export declare function createFieldFormData(field: string, userInfo: Ref<any>, resetEmailUpdateCountdown: () => void): {
    phone: string;
    smsCode: string;
} | {
    email: string;
    emailCode: string;
} | {
    initPass: string;
    confirmPassword: string;
} | {
    [x: string]: any;
};
