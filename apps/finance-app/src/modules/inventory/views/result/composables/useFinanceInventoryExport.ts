import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { UseCrudReturn } from '@btc/shared-core';
import { getEpsServiceNode } from './useFinanceInventoryService';

/**
 * 格式化Result数据行
 */
function formatResultRow(item: any): any[] {
  // 计算差异百分比
  const variancePercent = item.sysTotal !== 0
    ? ((item.variance / item.sysTotal) * 100).toFixed(2)
    : (item.btcTotal !== 0 ? '100.00' : '0.00');

  return [
    item.stockCode || '',
    // Synpro Qty
    item.sysSt || 0,
    item.sysQc || 0,
    item.sysWf || 0,
    item.sysStSm || 0,
    item.sysIqc || 0,
    item.sysNg || 0,
    item.sysNs || 0,
    item.sysRwf || 0,
    item.sysFg || 0,
    item.sysRfg || 0,
    item.sysWfFg || 0,
    item.sysTotal || 0,
    // Actual QTY
    item.btcSt || 0,
    item.btcQc || 0,
    item.btcWf || 0,
    item.btcStSm || 0,
    item.btcIqc || 0,
    item.btcNg || 0,
    item.btcNs || 0,
    item.btcRwf || 0,
    item.btcFg || 0,
    item.btcRfg || 0,
    item.btcWfFg || 0,
    item.btcTotal || 0,
    // Variance
    item.varianceCost || 0,
    variancePercent,
    // Synpro value
    item.sysFgValue || 0,
    item.sysWfFgValue || 0,
    item.sysRfgValue || 0,
    item.sysNgValue || 0,
    item.sysNsValue || 0,
    item.sysQcValue || 0,
    item.sysStValue || 0,
    item.sysWfValue || 0,
    item.sysIqcValue || 0,
    item.sysRwfValue || 0,
    item.sysStSmValue || 0,
    // Actual Value
    item.btcFgValue || 0,
    item.btcWfFgValue || 0,
    item.btcRfgValue || 0,
    item.btcNgValue || 0,
    item.btcNsValue || 0,
    item.btcQcValue || 0,
    item.btcStValue || 0,
    item.btcWfValue || 0,
    item.btcIqcValue || 0,
    item.btcRwfValue || 0,
    item.btcStSmValue || 0,
    item.btcTotalValue || 0,
    // Value Var.
    item.fgVar || 0,
    item.wfFgVar || 0,
    item.rfgVar || 0,
    item.ngVar || 0,
    item.nsVar || 0,
    item.qcVar || 0,
    item.stVar || 0,
    item.wfVar || 0,
    item.iqcVar || 0,
    item.rwfVar || 0,
    item.stSmVar || 0,
    item.totalVar || 0
  ];
}

/**
 * 创建Result sheet
 */
function createResultSheet(dataList: any[], XLSX: any) {
  // Result表头
  const header = [
    'StockCode',
    // Synpro Qty
    'SYS_ST', 'SYS_QC', 'SYS_WF', 'SYS_ST_SM', 'SYS_IQC', 'SYS_NG', 'SYS_NS', 'SYS_RWF', 'SYS_FG', 'SYS_RFG', 'SYS_WF_FG', 'SYS_Total',
    // Actual QTY
    'BTC_ST', 'BTC_QC', 'BTC_WF', 'BTC_ST_SM', 'BTC_IQC', 'BTC_NG', 'BTC_NS', 'BTC_RWF', 'BTC_FG', 'BTC_RFG', 'BTC_WF_FG', 'BTC_Total',
    // Variance
    'Variance(UnitCost)', 'Variance(%)',
    // Synpro value
    'FG', 'WF_FG', 'RFS', 'NG', 'NS', 'QC', 'ST', 'WF', 'RGC', 'RWF', 'ST_SM',
    // Actual Value
    'BTC_FG', 'BTC_WF_FG', 'BTC_RFS', 'BTC_NG', 'BTC_NS', 'BTC_QC', 'BTC_ST', 'BTC_WF', 'BTC_RGC', 'BTC_RWF', 'BTC_ST_SM', 'BTC_Total',
    // Value Var.
    'FG', 'WF_FG', 'RFS', 'NG', 'NS', 'QC', 'ST', 'WF', 'RGC', 'RWF', 'ST_SM', 'Total'
  ];

  const rows = dataList.map(formatResultRow);
  const sheetData = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 设置列宽
  const colWidths = [
    { wch: 15 }, // StockCode
    ...Array(12).fill({ wch: 12 }), // Synpro Qty (12列)
    ...Array(12).fill({ wch: 12 }), // Actual QTY (12列)
    { wch: 18 }, { wch: 15 }, // Variance (2列)
    ...Array(11).fill({ wch: 15 }), // Synpro value (11列)
    ...Array(12).fill({ wch: 15 }), // Actual Value (12列)
    ...Array(12).fill({ wch: 15 }), // Value Var. (12列)
  ];
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * 创建Summary sheet
 */
function createSummarySheet(summaryData: any[], XLSX: any) {
  const currentYear = new Date().getFullYear();
  const summarySheetName = `Summary ${currentYear}`;

  // Summary表头结构：两级表头
  const summaryHeader1 = [
    'Warehouse',
    'Quantity', '', '',
    'Amount (USD)', '', ''
  ];
  const summaryHeader2 = [
    '',
    'SYSPRO', 'Actual', 'Var.',
    'SYSPRO', 'Actual', 'Var.'
  ];

  // 构建Summary数据行
  const summaryRows = summaryData.map((item: any) => [
    item.warehouse || '',
    item.sysQty || 0,
    item.btcQty || 0,
    item.varQty || 0,
    item.sysAmount || 0,
    item.btcAmount || 0,
    item.varAmount || 0
  ]);

  // 添加Total行
  const totalRow: any[] = ['Total'];
  for (let i = 1; i < summaryHeader1.length; i++) {
    const sum = summaryRows.reduce((acc, row) => acc + (Number(row[i]) || 0), 0);
    totalRow.push(sum);
  }

  const summarySheetData = [
    summaryHeader1,
    summaryHeader2,
    ...summaryRows,
    totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(summarySheetData);

  // 设置Summary列宽
  const summaryColWidths = [
    { wch: 15 }, // Warehouse
    { wch: 15 }, { wch: 15 }, { wch: 15 }, // Quantity (3列)
    { wch: 18 }, { wch: 18 }, { wch: 18 }  // Amount (3列)
  ];
  ws['!cols'] = summaryColWidths;

  // 合并表头单元格
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push(
    { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, // Quantity合并B1:D1
    { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, // Amount合并E1:G1
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }  // Warehouse合并A1:A2
  );

  return { ws, sheetName: summarySheetName };
}

/**
 * 创建Top 10 sheet
 */
function createTop10Sheet(topDataObj: {
  varianceTop?: any[];
  priceTop?: any[];
  varianceBottom?: any[];
  priceBottom?: any[];
}, XLSX: any) {
  const topHeader = ['id', 'StockCode', 'SysQty', 'BTCQty', 'Variance', 'TotalValu'];

  // 格式化Top数据
  const formatTopRow = (item: any, index: number) => [
    index + 1,
    item.stockCode || '',
    item.sysQty || 0,
    item.btcQty || 0,
    item.variance || 0,
    item.totalVale || 0
  ];

  // 构建Top 10 sheet数据
  const topSheetData: any[][] = [];

  // 1. Qty Top10 Gain (varianceTop)
  topSheetData.push(['Qty Top10 Gain']);
  topSheetData.push(topHeader);
  const varianceTopRows = (topDataObj.varianceTop || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...varianceTopRows);
  topSheetData.push([]);

  // 2. Value Top Gain (priceTop)
  topSheetData.push(['Value Top Gain']);
  topSheetData.push(topHeader);
  const priceTopRows = (topDataObj.priceTop || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...priceTopRows);
  topSheetData.push([]);

  // 3. Qty Top10 Loss (varianceBottom)
  topSheetData.push(['Qty Top10 Loss']);
  topSheetData.push(topHeader);
  const varianceBottomRows = (topDataObj.varianceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...varianceBottomRows);
  topSheetData.push([]);

  // 4. Value Top Loss (priceBottom)
  topSheetData.push(['Value Top Loss']);
  topSheetData.push(topHeader);
  const priceBottomRows = (topDataObj.priceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...priceBottomRows);

  const ws = XLSX.utils.aoa_to_sheet(topSheetData);

  // 设置Top 10列宽
  const topColWidths = [
    { wch: 8 },   // id
    { wch: 15 },  // StockCode
    { wch: 12 },  // SysQty
    { wch: 12 },  // BTCQty
    { wch: 15 },  // Variance
    { wch: 18 }   // TotalValu
  ];
  ws['!cols'] = topColWidths;

  return ws;
}

/**
 * 处理导出
 */
export function useFinanceInventoryExport() {
  const { t } = useI18n();

  const handleExport = async (crudInstance: UseCrudReturn<any> | undefined) => {
    if (!crudInstance) {
      BtcMessage.error('CRUD上下文不可用');
      return;
    }

    try {
      // 获取EPS服务节点
      const serviceNode = getEpsServiceNode('finance.base.financeResult');

      if (!serviceNode || typeof serviceNode.export !== 'function') {
        throw new Error('导出方法不存在');
      }

      // 获取当前查询参数
      const params = crudInstance.getParams();

      // 构建导出参数
      const exportParams: any = {};
      if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
        const keyword = params.keyword as Record<string, any>;
        if (keyword.materialCode !== undefined && keyword.materialCode !== '') {
          exportParams.materialCode = keyword.materialCode;
        }
        if (keyword.position !== undefined && keyword.position !== '') {
          exportParams.position = keyword.position;
        }
      }

      // 并行调用三个接口获取数据
      const [exportResponse, summaryResponse, topResponse] = await Promise.all([
        serviceNode.export(exportParams),
        serviceNode.summary(),
        serviceNode.top(),
      ]);

      // 处理 export 接口响应
      let dataList: any[] = [];
      if (exportResponse && typeof exportResponse === 'object') {
        if ('data' in exportResponse && Array.isArray(exportResponse.data)) {
          dataList = exportResponse.data;
        } else if (Array.isArray(exportResponse)) {
          dataList = exportResponse;
        }
      }

      // 处理 summary 接口响应
      let summaryData: any[] = [];
      if (summaryResponse && typeof summaryResponse === 'object') {
        if ('data' in summaryResponse && Array.isArray(summaryResponse.data)) {
          summaryData = summaryResponse.data;
        } else if (Array.isArray(summaryResponse)) {
          summaryData = summaryResponse;
        }
      }

      // 处理 top 接口响应
      let topDataObj: {
        varianceTop?: any[];
        priceTop?: any[];
        varianceBottom?: any[];
        priceBottom?: any[];
      } = {};
      if (topResponse && typeof topResponse === 'object') {
        if ('data' in topResponse && topResponse.data && typeof topResponse.data === 'object') {
          topDataObj = topResponse.data;
        } else if (!('data' in topResponse) && typeof topResponse === 'object') {
          topDataObj = topResponse;
        }
      }

      // 使用XLSX库创建Excel文件
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');

      // 创建工作簿
      const wb = XLSX.utils.book_new();

      // 创建三个sheet
      const { ws: summaryWs, sheetName: summarySheetName } = createSummarySheet(summaryData, XLSX);
      const resultWs = createResultSheet(dataList, XLSX);
      const topWs = createTop10Sheet(topDataObj, XLSX);

      // 按顺序添加sheet：Summary 2025, Result, Top 10
      XLSX.utils.book_append_sheet(wb, summaryWs, summarySheetName);
      XLSX.utils.book_append_sheet(wb, resultWs, 'Result');
      XLSX.utils.book_append_sheet(wb, topWs, 'Top 10');

      // 生成Excel文件
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary',
      });

      // 转换为Blob
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
      };

      const blob = new Blob([s2ab(wbout)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // 创建下载链接
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      const filename = `${t('menu.finance.inventoryManagement.result')}_${timestamp}.xlsx`;

      saveAs(blob, filename);

      BtcMessage.success(t('platform.common.export_success'));
    } catch (error: any) {
      console.error('导出失败:', error);
      BtcMessage.error(error.message || t('platform.common.export_failed'));
    }
  };

  return {
    handleExport,
  };
}

