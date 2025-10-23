/**
 * EPS 鎻掍欢绫诲瀷瀹氫箟
 * 鍙傝€?cool-admin 鐨勫畬鏁寸被鍨嬩綋绯? */

export interface EpsColumn {
  /**
   * 灞炴€у悕
   */
  propertyName: string;
  /**
   * 瀛楁娉ㄩ噴
   */
  comment?: string;
  /**
   * 瀛楁绫诲瀷
   */
  type: string;
  /**
   * 鏄惁鍙┖
   */
  nullable?: boolean;
  /**
   * 瀛楁婧愶紙鏁版嵁搴撳瓧娈靛悕锛?   */
  source?: string;
  /**
   * 瀛楀吀绫诲瀷
   */
  dict?: string[];
  /**
   * 榛樿鍊?   */
  defaultValue?: any;
  /**
   * 鏈€澶ч暱搴?   */
  maxLength?: number;
  /**
   * 鏈€灏忓€?   */
  minValue?: number;
  /**
   * 鏈€澶у€?   */
  maxValue?: number;
}

export interface EpsSearch {
  /**
   * 绮剧‘鍖归厤瀛楁
   */
  fieldEq: EpsColumn[];
  /**
   * 妯＄硦鍖归厤瀛楁
   */
  fieldLike: EpsColumn[];
  /**
   * 鍏抽敭璇嶅尮閰嶅瓧娈?   */
  keyWordLikeFields: EpsColumn[];
}

export interface EpsApi {
  /**
   * API 鍚嶇О
   */
  name: string;
  /**
   * HTTP 鏂规硶
   */
  method: string;
  /**
   * API 璺緞
   */
  path: string;
  /**
   * API 鎻忚堪
   */
  summary?: string;
  /**
   * 绫诲瀷瀹氫箟
   */
  dts?: {
    parameters?: Array<{
      name: string;
      description?: string;
      required?: boolean;
      schema: { type: string; [key: string]: any };
    }>;
  };
}

export interface EpsEntity {
  /**
   * API 鍓嶇紑璺緞
   */
  prefix: string;
  /**
   * 瀹炰綋鍚嶇О
   */
  name: string;
  /**
   * API 鍒楄〃
   */
  api: EpsApi[];
  /**
   * 瀹炰綋瀛楁
   */
  columns?: EpsColumn[];
  /**
   * 鍒嗛〉鏌ヨ瀛楁
   */
  pageColumns?: EpsColumn[];
  /**
   * 鎼滅储閰嶇疆
   */
  search?: EpsSearch;
  /**
   * 鍒嗛〉鏌ヨ鎿嶄綔閰嶇疆
   */
  pageQueryOp?: {
    fieldEq?: string[];
    fieldLike?: string[];
    keyWordLikeFields?: string[];
  };
  /**
   * 鍛藉悕绌洪棿
   */
  namespace?: string;
  /**
   * 鏉冮檺閰嶇疆
   */
  permission?: Record<string, string>;
}

export interface EpsData {
  [moduleName: string]: EpsEntity[];
}

export interface TypeMapping {
  /**
   * 娴嬭瘯鏉′欢
   */
  test?: string[];
  /**
   * 鐩爣绫诲瀷
   */
  type: string;
  /**
   * 鑷畾涔夋槧灏勫嚱鏁?   */
  custom?: (params: { propertyName: string; type: string }) => string | null;
}

export interface EpsConfig {
  /**
   * 鏄惁鍚敤
   */
  enable: boolean;
  /**
   * EPS API URL锛岀┖瀛楃涓茶〃绀轰娇鐢ㄦ湰鍦?Mock
   */
  api?: string;
  /**
   * 杈撳嚭鐩綍
   */
  dist?: string;
  /**
   * 绫诲瀷鏄犲皠閰嶇疆
   */
  mapping?: TypeMapping[];
  /**
   * 鏄惁鐢熸垚瀛楀吀绫诲瀷
   */
  dict?: boolean;
}

export interface EpsPluginOptions {
  /**
   * EPS 鍏冩暟鎹?URL
   */
  epsUrl: string;
  /**
   * 杈撳嚭鐩綍
   */
  outputDir?: string;
  /**
   * 鏄惁鐩戝惉鍙樺寲
   */
  watch?: boolean;
}

export interface ServiceTree {
  [key: string]: any;
  namespace?: string;
  permission?: Record<string, string>;
  search?: EpsSearch;
  request?: any;
}

