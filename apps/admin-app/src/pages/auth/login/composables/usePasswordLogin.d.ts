export declare function usePasswordLogin(): {
    form: {
        username: string;
        password: string;
    };
    loading: globalThis.Ref<boolean, boolean>;
    submit: (formData: {
        username: string;
        password: string;
    }) => Promise<void>;
};
