export interface BtcFormConfig {
    title?: string;
    height?: string;
    width?: string;
    props?: Record<string, any>;
    on?: Record<string, any>;
    op?: {
        hidden?: boolean;
        saveButtonText?: string;
        closeButtonText?: string;
        justify?: string;
        buttons?: any[];
    };
    dialog?: Record<string, any>;
    items: any[];
    form?: Record<string, any>;
    _data?: Record<string, any>;
}
export declare function useBtcForm(): {
    Form: globalThis.Ref<any, any>;
    config: {
        title?: string | undefined;
        height?: string | undefined;
        width?: string | undefined;
        props?: Record<string, any> | undefined;
        on?: Record<string, any> | undefined;
        op?: {
            hidden?: boolean | undefined;
            saveButtonText?: string | undefined;
            closeButtonText?: string | undefined;
            justify?: string | undefined;
            buttons?: any[] | undefined;
        } | undefined;
        dialog?: Record<string, any> | undefined;
        items: any[];
        form?: Record<string, any> | undefined;
        _data?: Record<string, any> | undefined;
    };
    form: Record<string, any>;
    visible: globalThis.Ref<boolean, boolean>;
    saving: globalThis.Ref<boolean, boolean>;
    loading: globalThis.Ref<boolean, boolean>;
    disabled: globalThis.Ref<boolean, boolean>;
};
