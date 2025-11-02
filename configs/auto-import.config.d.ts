/**
 * 创建 Auto Import 配置
 */
export declare function createAutoImportConfig(): import("vite").Plugin<any> | import("vite").Plugin<any>[];
export interface ComponentsConfigOptions {
    /**
     * 额外的组件目录（用于域级组件）
     */
    extraDirs?: string[];
    /**
     * 是否导入共享组件库
     */
    includeShared?: boolean;
}
/**
 * 创建 Components 自动导入配置
 * @param options 配置选项
 */
export declare function createComponentsConfig(options?: ComponentsConfigOptions): import("vite").Plugin<any> & {
    api: import("unplugin-vue-components/dist/types-BgF15syy.js").PublicPluginAPI;
};
