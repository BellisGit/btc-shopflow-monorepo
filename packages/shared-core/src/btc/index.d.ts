import type { App } from 'vue';
import { type DynamicService, type EpsData } from './service/builder';
export interface BtcOptions {
    apiBaseUrl?: string;
    timeout?: number;
}
/**
 * 鏍稿績鍔熻兘閽╁瓙
 * 鎻愪緵鏈嶅姟瀵硅薄銆丆RUD銆佹彃浠剁瓑
 */
export declare function useCore(): {
    service: DynamicService;
};
/**
 * 鍒濆鍖?EPS 鏁版嵁锛堢敱搴旂敤璋冪敤锛? */
export declare function initEpsData(epsData: EpsData): void;
export declare function installBtc(app: App, options?: BtcOptions): void;


