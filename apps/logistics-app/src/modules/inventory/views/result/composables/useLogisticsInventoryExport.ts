import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { UseCrudReturn } from '@btc/shared-core';
import { service } from '@services/eps';

/**
 * 获取EPS服务节点
 */
function getEpsServiceNode(servicePath: string | string[]) {
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');
  let serviceNode: any = service;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      throw new Error(`EPS服务路径 ${servicePath} 不存在，无法找到 ${key}`);
    }
    serviceNode = serviceNode[key];
  }
  return serviceNode;
}

/**
 * 创建Summary sheet（使用export接口数据）
 */
function createSummarySheet(dataList: any[], XLSX: any) {
  const currentYear = new Date().getFullYear();
  const summarySheetName = `Summary ${currentYear}`;

  // Summary表头结构：固定格式，使用英文表头（与财务应用保持一致）
  const summaryHeader1 = [
    'StockCode',
    'UnitCost',
    'SYS_ST',
    'SYS_QC',
    'SYS_WF',
    'SYS_ST_SM',
    'SYS_IQC',
    'SYS_NG',
    'SYS_NS',
    'SYS_RWF',
    'SYS_FG',
    'SYS_RFG',
    'SYS_WF_FG',
    'SYS_Total',
    'BTC_ST',
    'BTC_QC',
    'BTC_WF',
    'BTC_ST_SM',
    'BTC_IQC',
    'BTC_NG',
    'BTC_NS',
    'BTC_RWF',
    'BTC_FG',
    'BTC_RFG',
    'BTC_WF_FG',
    'BTC_Total',
    'Variance',
    'VarianceCost'
  ];

  // 构建Summary数据行
  const summaryRows = dataList.map((item: any) => [
    item.stockCode || '',
    item.unitCost || 0,
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
    item.btcSt || 0,
    item.btcQc || 0,
    item.btcWf || 0,
    item.btcStSm || 0,
    item.btcIqc || 0,
    item.btcNg || 0,
    item.btcNs ?? 0,
    item.btcRwf || 0,
    item.btcFg || 0,
    item.btcRfg || 0,
    item.btcWfFg || 0,
    item.btcTotal || 0,
    item.variance || 0,
    item.varianceCost || 0
  ]);

  // 添加Total行
  const totalRow: any[] = ['Total', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // 计算各列的合计
  for (let colIndex = 1; colIndex < summaryHeader1.length; colIndex++) {
    totalRow[colIndex] = summaryRows.reduce((acc, row) => acc + (Number(row[colIndex]) || 0), 0);
  }

  const summarySheetData = [
    summaryHeader1,
    ...summaryRows,
    totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(summarySheetData);

  // 设置Summary列宽
  const summaryColWidths = [
    { wch: 15 }, // 库存编码
    { wch: 12 }, // 单位成本
    { wch: 10 }, // 系统ST
    { wch: 10 }, // 系统QC
    { wch: 10 }, // 系统WF
    { wch: 12 }, // 系统ST-SM
    { wch: 10 }, // 系统IQC
    { wch: 10 }, // 系统NG
    { wch: 10 }, // 系统NS
    { wch: 10 }, // 系统RWF
    { wch: 10 }, // 系统FG
    { wch: 10 }, // 系统RFG
    { wch: 12 }, // 系统WF-FG
    { wch: 12 }, // 系统合计
    { wch: 10 }, // BTC ST
    { wch: 10 }, // BTC QC
    { wch: 10 }, // BTC WF
    { wch: 12 }, // BTC ST-SM
    { wch: 10 }, // BTC IQC
    { wch: 10 }, // BTC NG
    { wch: 10 }, // BTC NS
    { wch: 10 }, // BTC RWF
    { wch: 10 }, // BTC FG
    { wch: 10 }, // BTC RFG
    { wch: 12 }, // BTC WF-FG
    { wch: 12 }, // BTC合计
    { wch: 12 }, // 差异
    { wch: 15 }  // 差异成本
  ];
  ws['!cols'] = summaryColWidths;

  return { ws, sheetName: summarySheetName };
}

/**
 * 创建Top 10 sheet（使用top接口数据）
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

  // 2. Qty Top10 Loss (varianceBottom)
  topSheetData.push(['Qty Top10 Loss']);
  topSheetData.push(topHeader);
  const varianceBottomRows = (topDataObj.varianceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...varianceBottomRows);
  topSheetData.push([]);

  // 3. Value Top Gain (priceTop)
  topSheetData.push(['Value Top Gain']);
  topSheetData.push(topHeader);
  const priceTopRows = (topDataObj.priceTop || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...priceTopRows);
  topSheetData.push([]);

  // 4. Value Top Loss (priceBottom)
  topSheetData.push(['Value Top Loss']);
  topSheetData.push(topHeader);
  const priceBottomRows = (topDataObj.priceBottom || []).map((item: any, idx: number) => formatTopRow(item, idx));
  topSheetData.push(...priceBottomRows);

  const ws = XLSX.utils.aoa_to_sheet(topSheetData);

  // 设置Top 10列宽
  const topColWidths = [
    { wch: 8 },   // 序号
    { wch: 15 },  // 库存编码
    { wch: 12 },  // 系统数量
    { wch: 12 },  // BTC数量
    { wch: 12 },  // 差异
    { wch: 15 }   // 总价值
  ];
  ws['!cols'] = topColWidths;

  return ws;
}

/**
 * 处理导出
 */
export function useLogisticsInventoryExport() {
  const { t } = useI18n();

  const handleExport = async (crudInstance: UseCrudReturn<any> | undefined) => {
    if (!crudInstance) {
      BtcMessage.error('CRUD上下文不可用');
      return;
    }

    try {
      // 获取EPS服务节点
      const serviceNode = getEpsServiceNode(['logistics', 'base', 'check']);

      if (!serviceNode || typeof serviceNode.export !== 'function') {
        throw new Error('导出方法不存在');
      }

      if (!serviceNode.top || typeof serviceNode.top !== 'function') {
        throw new Error('Top方法不存在');
      }

      // 获取当前查询参数
      const params = crudInstance.getParams();

      // 构建导出参数
      const exportParams: any = {};

      // 如果有keyword，传递keyword
      if (params.keyword) {
        exportParams.keyword = params.keyword;
      }

      // 并行调用两个接口获取数据
      const [exportResponse, topResponse] = await Promise.all([
        serviceNode.export(exportParams),
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

      // 创建两个sheet
      const { ws: summaryWs, sheetName: summarySheetName } = createSummarySheet(dataList, XLSX);
      const topWs = createTop10Sheet(topDataObj, XLSX);

      // 按顺序添加sheet：Summary, Top 10
      XLSX.utils.book_append_sheet(wb, summaryWs, summarySheetName);
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
      const filename = `${t('menu.logistics.inventoryManagement.result')}_${timestamp}.xlsx`;

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

