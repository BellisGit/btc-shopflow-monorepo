/**
 * 鎻掍欢璧勬簮鍔犺浇鍣? * 鐢ㄤ簬鍔犺浇鎻掍欢鐨勯潤鎬佽祫婧愶紙SVG銆佸浘鐗囩瓑锛? * 姣忎釜鎻掍欢鏈夌嫭绔嬬殑璧勬簮鐩綍锛岄伩鍏嶅啿绐? */
/**
 * SVG 璧勬簮閰嶇疆
 */
export interface SvgResource {
    /**
     * SVG 鍚嶇О锛堟枃浠跺悕锛?     */
    name: string;
    /**
     * SVG 鍐呭鎴栬矾寰?     */
    content: string;
    /**
     * 鎵€灞炴彃浠?     */
    plugin: string;
}
/**
 * 璧勬簮鍔犺浇鍣? */
export declare class ResourceLoader {
    private svgCache;
    /**
     * 娉ㄥ唽 SVG 璧勬簮
     * @param pluginName 鎻掍欢鍚嶇О
     * @param svgModules import.meta.glob 杩斿洖鐨勬ā鍧楀璞?     */
    registerSvgFromGlob(pluginName: string, svgModules: Record<string, () => Promise<any>>): Promise<void>;
    /**
     * 鎵嬪姩娉ㄥ唽鍗曚釜 SVG
     */
    registerSvg(pluginName: string, name: string, content: string): void;
    /**
     * 鑾峰彇 SVG 璧勬簮
     * @param pluginName 鎻掍欢鍚嶇О
     * @param name SVG 鍚嶇О
     */
    getSvg(pluginName: string, name: string): SvgResource | undefined;
    /**
     * 鑾峰彇鎻掍欢鐨勬墍鏈?SVG
     */
    getPluginSvgs(pluginName: string): SvgResource[];
    /**
     * 鑾峰彇鎵€鏈?SVG
     */
    getAllSvgs(): SvgResource[];
    /**
     * 娓呴櫎鎻掍欢鐨勬墍鏈夎祫婧?     */
    clearPlugin(pluginName: string): void;
    /**
     * 浠庤矾寰勪腑鎻愬彇鏂囦欢鍚?     */
    private extractFileName;
}
/**
 * 鑾峰彇璧勬簮鍔犺浇鍣ㄥ疄渚嬶紙鍗曚緥妯″紡锛? */
export declare function useResourceLoader(): ResourceLoader;
/**
 * 閲嶇疆璧勬簮鍔犺浇鍣紙鐢ㄤ簬娴嬭瘯锛? */
export declare function resetResourceLoader(): void;


