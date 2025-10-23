import * as XLSX from 'xlsx';
export interface ExportExcelOptions {
    /** 澶氱骇琛ㄥご */
    multiHeader?: string[][];
    /** 琛ㄥご */
    header: string[];
    /** 鏁版嵁 */
    data: any[][];
    /** 鏂囦欢鍚嶏紙涓嶅惈鎵╁睍鍚嶏級 */
    filename?: string;
    /** 鍚堝苟鍗曞厓鏍奸厤缃紙濡?['A1:B1']锛?*/
    merges?: string[];
    /** 鏄惁鑷姩鍒楀 */
    autoWidth?: boolean;
    /** 鏂囦欢绫诲瀷 */
    bookType?: XLSX.BookType;
}
/**
 * 瀵煎嚭 JSON 鏁版嵁涓?Excel
 */
export declare function exportJsonToExcel(options: ExportExcelOptions): void;


