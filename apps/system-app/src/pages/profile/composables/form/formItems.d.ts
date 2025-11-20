export declare function useFormItems(): {
    formItems: globalThis.ComputedRef<({
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                type: string;
                uploadType: string;
                text: string;
                size: number[];
                limitSize: number;
                placeholder?: undefined;
                disabled?: undefined;
                showPassword?: undefined;
            };
        };
        required?: undefined;
        rules?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        required: boolean;
        component: {
            name: string;
            props: {
                placeholder: string;
                type?: undefined;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                disabled?: undefined;
                showPassword?: undefined;
            };
        };
        rules?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                placeholder: string;
                disabled: boolean;
                type?: undefined;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                showPassword?: undefined;
            };
        };
        required?: undefined;
        rules?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                placeholder: string;
                type?: undefined;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                disabled?: undefined;
                showPassword?: undefined;
            };
        };
        required?: undefined;
        rules?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                placeholder: string;
                type?: undefined;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                disabled?: undefined;
                showPassword?: undefined;
            };
        };
        rules: {
            type: string;
            message: string;
            trigger: string[];
        }[];
        required?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                placeholder: string;
                type?: undefined;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                disabled?: undefined;
                showPassword?: undefined;
            };
        };
        rules: {
            pattern: RegExp;
            message: string;
            trigger: string;
        }[];
        required?: undefined;
    } | {
        prop: string;
        label: string;
        span: number;
        component: {
            name: string;
            props: {
                type: string;
                placeholder: string;
                showPassword: boolean;
                uploadType?: undefined;
                text?: undefined;
                size?: undefined;
                limitSize?: undefined;
                disabled?: undefined;
            };
        };
        rules: {
            min: number;
            message: string;
            trigger: string;
        }[];
        required?: undefined;
    })[]>;
};
