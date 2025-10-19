export interface ProcessItem {
    path: string;
    fullPath: string;
    name?: string;
    meta: {
        label?: string;
        keepAlive?: boolean;
        isHome?: boolean;
        process?: boolean;
    };
    active?: boolean;
    app?: string;
}
/**
 * 获取当前应用名称（使用统一的 tabRegistry）
 */
export declare function getCurrentAppFromPath(path: string): string;
/**
 * 页面标签（Process）Store
 */
export declare const useProcessStore: import("pinia").StoreDefinition<"process", Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[];
    setTitle: (title: string) => void;
}, "list">, Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[];
    setTitle: (title: string) => void;
}, never>, Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string | undefined;
        meta: {
            label?: string | undefined;
            keepAlive?: boolean | undefined;
            isHome?: boolean | undefined;
            process?: boolean | undefined;
        };
        active?: boolean | undefined;
        app?: string | undefined;
    }[];
    setTitle: (title: string) => void;
}, "close" | "add" | "clear" | "set" | "remove" | "setTitle" | "clearCurrentApp" | "getAppTabs">>;
