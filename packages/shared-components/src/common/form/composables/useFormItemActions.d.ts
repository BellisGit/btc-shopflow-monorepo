/**
 * 表单项动态控制方法（对齐 cool-admin form/helper/action.ts）
 */
export declare function useFormItemActions(formSetup: any): {
    findItemByProp: (prop: string) => any;
    getForm: (prop?: string) => any;
    setForm: (prop: string, value: any) => void;
    setData: (prop: string, value: any) => void;
    setConfig: (path: string, value: any) => void;
    setOptions: (prop: string, value: any[]) => void;
    setProps: (prop: string, value: any) => void;
    toggleItem: (prop: string, value?: boolean) => void;
    hideItem: (...props: string[]) => void;
    showItem: (...props: string[]) => void;
    setTitle: (value: string) => void;
    bindForm: (data: any) => void;
};
