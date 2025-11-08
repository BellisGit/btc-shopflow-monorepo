export declare function useRegister(): {
    form: {
        username: string;
        phone: string;
        password: string;
        confirmPassword: string;
    };
    rules: {
        username: ({
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
        password: ({
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
            validator: (rule: any, value: string, callback: any) => void;
            trigger: string;
            required?: unknown;
            message?: unknown;
        })[];
    };
    loading: globalThis.Ref<boolean, boolean>;
    register: (formRef: any) => Promise<void>;
};
