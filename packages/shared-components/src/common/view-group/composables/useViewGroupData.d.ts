import type { ViewGroupOptions, ViewGroupItem } from '../types';
export declare function useViewGroupData(config: ViewGroupOptions, tree: any, isCustom: boolean, selectFn?: (item?: ViewGroupItem) => void): {
    loading: globalThis.Ref<boolean, boolean>;
    keyWord: globalThis.Ref<string, string>;
    list: globalThis.Ref<{
        [x: string]: any;
        id?: number | string | undefined;
        name?: string | undefined;
        icon?: any;
    }[], ViewGroupItem[] | {
        [x: string]: any;
        id?: number | string | undefined;
        name?: string | undefined;
        icon?: any;
    }[]>;
    selected: globalThis.Ref<ViewGroupItem | undefined, ViewGroupItem | undefined>;
    loaded: globalThis.Ref<boolean, boolean>;
    reqParams: {
        order: string;
        sort: string;
        page: number;
        size: number;
    };
    refresh: (params?: any) => Promise<false | undefined>;
    onMore: () => void;
};
