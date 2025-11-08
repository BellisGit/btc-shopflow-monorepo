/**
 * 娑堟伅绠＄悊缁勫悎寮忓嚱鏁? * 鎻愪緵缁熶竴鐨勬秷鎭彂閫佹帴鍙? */
/**
 * 浣跨敤娑堟伅绠＄悊鍣? * @returns 娑堟伅鍙戦€佹柟娉? */
export declare function useMessage(): {
    /**
     * 鏄剧ず鎴愬姛娑堟伅
     */
    success: (message: string) => void;
    /**
     * 鏄剧ず閿欒娑堟伅
     */
    error: (message: string) => void;
    /**
     * 鏄剧ず璀﹀憡娑堟伅
     */
    warning: (message: string) => void;
    /**
     * 鏄剧ず淇℃伅娑堟伅
     */
    info: (message: string) => void;
};
/**
 * 鐩存帴浣跨敤娑堟伅绠＄悊鍣ㄧ殑鏂规硶锛堢敤浜庨潪缁勪欢鐜锛? */
export declare const message: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
};
