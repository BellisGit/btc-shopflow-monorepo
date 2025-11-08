export declare function useSmsLogin(): {
    form: {
        phone: string;
        smsCode: string;
    };
    loading: globalThis.Ref<boolean, boolean>;
    submit: (formData: {
        phone: string;
        smsCode: string;
    }) => Promise<void>;
};
