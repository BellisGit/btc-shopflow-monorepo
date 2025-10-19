import * as XLSX from 'xlsx';
export interface ExportExcelOptions {
    /** 多级表头 */
    multiHeader?: string[][];
    /** 表头 */
    header: string[];
    /** 数据 */
    data: any[][];
    /** 文件名（不含扩展名） */
    filename?: string;
    /** 合并单元格配置（如 ['A1:B1']） */
    merges?: string[];
    /** 是否自动列宽 */
    autoWidth?: boolean;
    /** 文件类型 */
    bookType?: XLSX.BookType;
}
/**
 * 导出 JSON 数据为 Excel
 */
export declare function exportJsonToExcel(options: ExportExcelOptions): void;
