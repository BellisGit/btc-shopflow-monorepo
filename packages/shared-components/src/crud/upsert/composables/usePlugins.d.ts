import type { UpsertPlugin, UpsertProps } from '../types';
/**
 * 插件系统管理
 */
export declare function usePlugins(props: UpsertProps): {
    registeredPlugins: globalThis.Ref<{
        name: string;
        value?: any;
        created?: ((options: any) => void) | undefined;
        onOpen?: (() => void | Promise<void>) | undefined;
        onSubmit?: ((data: any) => any | Promise<any>) | undefined;
        onClose?: ((done: Function) => void) | undefined;
    }[], UpsertPlugin[] | {
        name: string;
        value?: any;
        created?: ((options: any) => void) | undefined;
        onOpen?: (() => void | Promise<void>) | undefined;
        onSubmit?: ((data: any) => any | Promise<any>) | undefined;
        onClose?: ((done: Function) => void) | undefined;
    }[]>;
    registerPlugins: () => void;
    triggerPluginOnOpen: () => Promise<void>;
    triggerPluginOnSubmit: (submitData: any) => Promise<any>;
    triggerPluginOnClose: (done: Function) => void;
    clearPlugins: () => void;
};
