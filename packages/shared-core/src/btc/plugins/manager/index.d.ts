import type { App } from 'vue';
import type { Plugin, PluginOptions, PluginManagerOptions, PluginRecord, PluginLifecycleEvents, ToolbarConfig, LayoutConfig } from './types';
import { PluginStatus } from './types';
/**
 * 鎻掍欢绠＄悊鍣紙澧炲己鐗堬級
 * 鏀寔缁勪欢銆佹寚浠ゃ€佽矾鐢辩殑鑷姩娉ㄥ唽
 * 鏀寔 toolbar銆乴ayout 鐨勭鐞? * 鏀寔鐢熷懡鍛ㄦ湡閽╁瓙
 */
export declare class PluginManager {
    private plugins;
    private app;
    private router;
    private options;
    private lifecycleEvents;
    private toolbarComponents;
    private layoutComponents;
    constructor(options?: PluginManagerOptions);
    /**
     * 璁剧疆 Vue 搴旂敤瀹炰緥
     */
    setApp(app: App): void;
    /**
     * 璁剧疆 Vue Router 瀹炰緥
     */
    setRouter(router: any): void;
    /**
     * 娉ㄥ唽鎻掍欢
     * @param plugin 鎻掍欢瀵硅薄
     * @returns 鎻掍欢绠＄悊鍣ㄥ疄渚嬶紙鏀寔閾惧紡璋冪敤锛?     */
    register<T = any>(plugin: Plugin<T>): this;
    /**
     * 瀹夎鎻掍欢锛堝寮虹増锛?     * @param name 鎻掍欢鍚嶇О
     * @param options 鎻掍欢閰嶇疆閫夐」
     */
    install(name: string, options?: PluginOptions): Promise<void>;
    /**
     * 娉ㄥ唽缁勪欢
     */
    private registerComponents;
    /**
     * 娉ㄥ唽鎸囦护
     */
    private registerDirectives;
    /**
     * 娉ㄥ唽璺敱
     */
    private registerRoutes;
    /**
     * 浠庣粍浠跺姞杞藉櫒涓彁鍙栫粍浠跺悕绉?     */
    private extractComponentName;
    /**
     * 鍗歌浇鎻掍欢
     * @param name 鎻掍欢鍚嶇О
     */
    uninstall(name: string): Promise<void>;
    /**
     * 鑾峰彇鎻掍欢
     * @param name 鎻掍欢鍚嶇О
     * @returns 鎻掍欢瀵硅薄
     */
    get<T = any>(name: string): Plugin<T> | undefined;
    /**
     * 鑾峰彇鎻掍欢 API
     * @param name 鎻掍欢鍚嶇О
     * @returns 鎻掍欢 API 瀵硅薄
     */
    getApi<T = any>(name: string): T | undefined;
    /**
     * 妫€鏌ユ彃浠舵槸鍚﹀瓨鍦?     * @param name 鎻掍欢鍚嶇О
     * @returns 鏄惁瀛樺湪
     */
    has(name: string): boolean;
    /**
     * 妫€鏌ユ彃浠舵槸鍚﹀凡瀹夎
     * @param name 鎻掍欢鍚嶇О
     * @returns 鏄惁宸插畨瑁?     */
    isInstalled(name: string): boolean;
    /**
     * 鑾峰彇鎵€鏈夋彃浠跺悕绉?     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    list(): string[];
    /**
     * 鑾峰彇鎵€鏈夊凡瀹夎鐨勬彃浠?     * @returns 宸插畨瑁呮彃浠跺悕绉版暟缁?     */
    listInstalled(): string[];
    /**
     * 鑾峰彇鎻掍欢鐘舵€?     * @param name 鎻掍欢鍚嶇О
     * @returns 鎻掍欢鐘舵€?     */
    getStatus(name: string): PluginStatus | undefined;
    /**
     * 鑾峰彇鎻掍欢璁板綍锛堝寘鍚姸鎬佸拰鍏冩暟鎹級
     * @param name 鎻掍欢鍚嶇О
     * @returns 鎻掍欢璁板綍
     */
    getRecord<T = any>(name: string): PluginRecord<T> | undefined;
    /**
     * 鎵归噺瀹夎鎻掍欢锛堟敮鎸佹寜 order 鎺掑簭锛?     * @param names 鎻掍欢鍚嶇О鏁扮粍
     * @param options 閫氱敤閰嶇疆閫夐」
     */
    installAll(names: string[], options?: PluginOptions): Promise<void>;
    /**
     * 鑾峰彇鎵€鏈夊伐鍏锋爮缁勪欢锛堟寜 order 鎺掑簭锛?     */
    getToolbarComponents(): ToolbarConfig[];
    /**
     * 鑾峰彇鎸囧畾浣嶇疆鐨勫竷灞€缁勪欢锛堟寜 order 鎺掑簭锛?     */
    getLayoutComponents(position?: 'header' | 'sidebar' | 'footer' | 'global'): LayoutConfig[];
    /**
     * 鑾峰彇鎻掍欢鐨?qiankun 閰嶇疆
     */
    getQiankunConfig(name: string): import("./types").QiankunConfig | undefined;
    /**
     * 鑾峰彇鎵€鏈夊叡浜粰瀛愬簲鐢ㄧ殑鎻掍欢
     */
    getSharedPlugins(): Plugin[];
    /**
     * 鑾峰彇鐢熷懡鍛ㄦ湡浜嬩欢锛堜緵鍏朵粬鎻掍欢浣跨敤锛?     */
    getLifecycleEvents(): PluginLifecycleEvents;
    /**
     * 鑾峰彇鎻掍欢閰嶇疆鍙傛暟
     */
    getPluginOptions(name: string): PluginOptions | undefined;
    /**
     * 绉婚櫎鎻掍欢锛堜粠绠＄悊鍣ㄤ腑鍒犻櫎锛?     * @param name 鎻掍欢鍚嶇О
     */
    remove(name: string): Promise<void>;
    /**
     * 娓呯┖鎵€鏈夋彃浠?     */
    clear(): void;
    /**
     * 鑾峰彇鎻掍欢鍏冩暟鎹?     * @param name 鎻掍欢鍚嶇О
     * @returns 鎻掍欢鍏冩暟鎹?     */
    getPluginMetadata(name: string): import("./types").PluginMetadata | undefined;
    /**
     * 鎸変綔鑰呯瓫閫夋彃浠?     * @param author 浣滆€呭悕绉?     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    getPluginsByAuthor(author: string): string[];
    /**
     * 鎸夌増鏈瓫閫夋彃浠?     * @param version 鐗堟湰鍙凤紙鏀寔閫氶厤绗︼級
     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    getPluginsByVersion(version: string): string[];
    /**
     * 鎸夊垎绫荤瓫閫夋彃浠?     * @param category 鍒嗙被鍚嶇О
     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    getPluginsByCategory(category: string): string[];
    /**
     * 鑾峰彇鎺ㄨ崘鎻掍欢
     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    getRecommendedPlugins(): string[];
    /**
     * 鎼滅储鎻掍欢
     * @param query 鎼滅储鍏抽敭璇?     * @returns 鎻掍欢鍚嶇О鏁扮粍
     */
    searchPlugins(query: string): string[];
    /**
     * 鑾峰彇鎵€鏈夋彃浠剁殑璇︾粏淇℃伅
     * @returns 鎻掍欢璇︾粏淇℃伅鏁扮粍
     */
    getPluginsInfo(): {
        name: string;
        config: import("./types").PluginMetadata | undefined;
        version: string | undefined;
        author: string | undefined;
        description: string | undefined;
        status: PluginStatus | undefined;
        installedAt: Date | undefined;
        error: Error | undefined;
        hasApi: boolean;
        hasComponents: boolean;
        hasDirectives: boolean;
        hasToolbar: boolean;
        hasLayout: boolean;
    }[];
    /**
     * 杈撳嚭鎻掍欢缁熻淇℃伅锛堜粎鍦?debug 妯″紡涓嬶級
     */
    logPluginStats(): void;
}
export * from './types';
export * from './resource-loader';
export * from './config-helper';
/**
 * 鑾峰彇鎻掍欢绠＄悊鍣ㄥ疄渚嬶紙鍗曚緥妯″紡锛? */
export declare function usePluginManager(options?: PluginManagerOptions): PluginManager;
/**
 * 閲嶇疆鎻掍欢绠＄悊鍣紙涓昏鐢ㄤ簬娴嬭瘯锛? */
export declare function resetPluginManager(): void;


