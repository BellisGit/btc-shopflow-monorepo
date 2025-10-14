import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * 二维数组转 worksheet
 */
function sheet_from_array_of_arrays(data: any[][]) {
  const ws: XLSX.WorkSheet = {};
  const range: XLSX.Range = {
    s: { c: 10000000, r: 10000000 },
    e: { c: 0, r: 0 },
  };

  for (let R = 0; R < data.length; R++) {
    for (let C = 0; C < data[R].length; C++) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;

      const cell: XLSX.CellObject = {
        v: data[R][C],
        t: 's' // 统一设置为字符串类型，避免格式问题
      };
      if (cell.v == null) continue;

      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

      ws[cell_ref] = cell;
    }
  }

  if (range.s.c < 10000000) {
    ws['!ref'] = XLSX.utils.encode_range(range);
  }

  return ws;
}

/**
 * 字符串转 ArrayBuffer
 */
function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

/**
 * 工作簿类
 */
class Workbook implements XLSX.WorkBook {
  SheetNames: string[] = [];
  Sheets: { [sheet: string]: XLSX.WorkSheet } = {};
}

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
export function exportJsonToExcel(options: ExportExcelOptions) {
  const {
    multiHeader = [],
    header,
    data,
    filename = 'excel-export',
    merges = [],
    autoWidth = true,
    bookType = 'xlsx',
  } = options;

  // 复制数据
  const sheetData = [...data];

  // 添加表头
  sheetData.unshift(header);

  // 添加多级表头（从后往前添加）
  for (let i = multiHeader.length - 1; i >= 0; i--) {
    sheetData.unshift(multiHeader[i]);
  }

  const ws_name = 'Sheet1';
  const wb = new Workbook();
  const ws = sheet_from_array_of_arrays(sheetData);

  // 合并单元格
  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = [];
    merges.forEach((item) => {
      ws['!merges']!.push(XLSX.utils.decode_range(item));
    });
  }

  // 自动列宽
  if (autoWidth) {
    const colWidth = sheetData.map((row) =>
      row.map((val) => {
        if (val == null) {
          return { wch: 10 };
        } else if (val.toString().charCodeAt(0) > 255) {
          // 中文字符
          return { wch: val.toString().length * 2 };
        } else {
          return { wch: val.toString().length };
        }
      })
    );

    // 以第一行为初始值
    const result = colWidth[0];
    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j]['wch'] < colWidth[i][j]['wch']) {
          result[j]['wch'] = colWidth[i][j]['wch'];
        }
      }
    }
    ws['!cols'] = result;
  }

  // 添加 worksheet 到 workbook
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  // 生成 Excel 文件
  const wbout = XLSX.write(wb, {
    bookType: bookType,
    bookSST: false,
    type: 'binary',
  });

  // 保存文件
  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream',
    }),
    `${filename}.${bookType}`
  );
}

