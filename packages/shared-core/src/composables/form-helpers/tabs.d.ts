import type { BtcFormConfig } from '../useBtcForm';
export declare function useTabs({ config, Form }: {
    config: BtcFormConfig;
    Form: any;
}): {
    active: globalThis.Ref<string | undefined, string | undefined>;
    list: globalThis.ComputedRef<any>;
    isLoaded: (value: any) => any;
    onLoad: (value: any) => void;
    get: () => any;
    set: (data: any) => void;
    change: (value: any, isValid?: boolean) => Promise<unknown>;
    clear: () => void;
    mergeProp: (item: any) => void;
    toGroup: (opts: {
        config: BtcFormConfig;
        prop: string;
        refs: any;
    }) => void;
};


