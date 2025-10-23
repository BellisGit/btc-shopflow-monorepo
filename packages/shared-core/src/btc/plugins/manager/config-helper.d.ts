import type { PluginMetadata } from './types';
/**
 * 瀹氫箟鎻掍欢閰嶇疆鐨勮緟鍔╁嚱鏁? * 鎻愪緵绫诲瀷鎻愮ず鍜岄粯璁ゅ€? *
 * @param metadata 鎻掍欢鍏冩暟鎹厤缃? * @returns 鏍囧噯鍖栫殑鎻掍欢鍏冩暟鎹? *
 * @example
 * ```typescript
 * const config = definePluginConfig({
 *   label: 'GitHub 闆嗘垚',
 *   description: '鎻愪緵 GitHub 浠ｇ爜灞曠ず鍔熻兘',
 *   author: 'BTC Team',
 *   version: '1.0.0',
 *   updateTime: '2024-01-15',
 *   demo: ['/demo/github'],
 *   category: 'integration',
 *   tags: ['github', 'code', 'markdown'],
 *   recommended: true
 * });
 * ```
 */
export declare function definePluginConfig(metadata: PluginMetadata): PluginMetadata;
/**
 * 鍚堝苟鎻掍欢閰嶇疆
 * 灏嗙敤鎴烽厤缃笌榛樿閰嶇疆鍚堝苟
 *
 * @param userConfig 鐢ㄦ埛閰嶇疆
 * @param defaultConfig 榛樿閰嶇疆
 * @returns 鍚堝苟鍚庣殑閰嶇疆
 */
export declare function mergePluginConfig<T extends Record<string, any>>(userConfig: T, defaultConfig: T): T;
/**
 * 鍒涘缓鎻掍欢閰嶇疆妯℃澘
 * 鐢ㄤ簬蹇€熺敓鎴愭彃浠堕厤缃? *
 * @param pluginName 鎻掍欢鍚嶇О
 * @returns 鎻掍欢閰嶇疆妯℃澘
 */
export declare function createPluginConfigTemplate(pluginName: string): PluginMetadata;
/**
 * 楠岃瘉鎻掍欢閰嶇疆
 * 妫€鏌ラ厤缃殑瀹屾暣鎬у拰鏈夋晥鎬? *
 * @param metadata 鎻掍欢鍏冩暟鎹? * @returns 楠岃瘉缁撴灉
 */
export declare function validatePluginConfig(metadata: PluginMetadata): {
    valid: boolean;
    errors: string[];
};
/**
 * 鏍煎紡鍖栨彃浠朵俊鎭? * 灏嗘彃浠堕厤缃牸寮忓寲涓哄彲璇荤殑瀛楃涓? *
 * @param metadata 鎻掍欢鍏冩暟鎹? * @returns 鏍煎紡鍖栫殑鎻掍欢淇℃伅
 */
export declare function formatPluginInfo(metadata: PluginMetadata): string;


