/**
 * Form Hook 宸ュ叿
 * 鐢ㄤ簬琛ㄥ崟鏁版嵁鐨勭粦瀹氬拰鎻愪氦杞崲
 * 瀹屾暣瀹炵幇 cool-admin 鐨?form-hook锛屽寘鍚墍鏈?绉嶅唴缃浆鎹㈠櫒
 */
export interface HookContext {
    method: 'bind' | 'submit';
    form: Record<string, any>;
    prop?: string;
}
export type HookFn = (value: any, ctx: HookContext) => any;
export declare const format: {
    [key: string]: HookFn;
};
declare const formHookDefault: {
    bind(data: any): void;
    submit(data: any): void;
};
export declare function registerFormHook(name: string, fn: HookFn): void;
export default formHookDefault;
export declare const formHook: {
    bind(data: any): void;
    submit(data: any): void;
};




