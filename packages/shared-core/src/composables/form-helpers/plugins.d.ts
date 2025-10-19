export interface FormPlugin {
    name: string;
    value?: any;
    created?: (options: any, ctx: any) => void;
    onOpen?: (options: any, ctx: any) => void | Promise<void>;
    onSubmit?: (data: any, ctx: any) => any | Promise<any>;
    onClose?: (done: Function, ctx: any) => void;
}
export declare function usePlugins(enablePlugin: boolean | undefined, { visible }: {
    visible: any;
}): {
    plugins: globalThis.Ref<{
        name: string;
        value?: any;
        created?: ((options: any, ctx: any) => void) | undefined;
        onOpen?: ((options: any, ctx: any) => void | Promise<void>) | undefined;
        onSubmit?: ((data: any, ctx: any) => any | Promise<any>) | undefined;
        onClose?: ((done: Function, ctx: any) => void) | undefined;
    }[], FormPlugin[] | {
        name: string;
        value?: any;
        created?: ((options: any, ctx: any) => void) | undefined;
        onOpen?: ((options: any, ctx: any) => void | Promise<void>) | undefined;
        onSubmit?: ((data: any, ctx: any) => any | Promise<any>) | undefined;
        onClose?: ((done: Function, ctx: any) => void) | undefined;
    }[]>;
    use: (plugin: FormPlugin) => void;
    clear: () => void;
    submit: (data: any) => Promise<any>;
};
