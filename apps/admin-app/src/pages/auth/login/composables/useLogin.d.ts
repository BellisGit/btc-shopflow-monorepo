export declare function useLogin(): {
    form: {
        username: string;
        password: string;
    };
    loading: globalThis.Ref<boolean, boolean>;
    rules: {
        username: {
            required: boolean;
            message: string;
            trigger: string;
        }[];
        password: {
            required: boolean;
            message: string;
            trigger: string;
        }[];
    };
    submit: () => Promise<void>;
};
