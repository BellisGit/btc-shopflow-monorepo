/**
 * 日志查询页面配置
 */

import type { PageConfig } from '@btc/shared-core/types/locale';
import type { TableColumn } from '@btc/shared-components';
import { sysApi } from '@/modules/api-services/sys';
import type { CrudService } from '@btc/shared-core';

// 格式化时间
const formatTime = (time: string | null | undefined) => {
  if (!time) return '-';
  try {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return time;
  }
};

// 日志级别字典配置
const logLevelDict = [
  { label: '错误', value: 'ERROR', type: 'danger' as const },
  { label: '警告', value: 'WARN', type: 'warning' as const },
  { label: '信息', value: 'INFO', type: 'info' as const },
  { label: '调试', value: 'DEBUG', type: 'info' as const },
  { label: '致命', value: 'FATAL', type: 'danger' as const },
  { label: '跟踪', value: 'TRACE', type: 'info' as const },
];

const config: PageConfig = {
  columns: {
    'log.query': [
      { type: 'index', width: 80, fixed: 'left' },
      { prop: 'appName', label: 'log.query.fields.app_name', width: 120, fixed: 'left' },
      {
        prop: 'logLevel',
        label: 'log.query.fields.log_level',
        width: 100,
        dict: logLevelDict,
        dictColor: true,
      },
      { prop: 'loggerName', label: 'log.query.fields.logger_name', minWidth: 150 },
      { prop: 'message', label: 'log.query.fields.message', minWidth: 250, showOverflowTooltip: true },
      { prop: 'microAppLifecycle', label: 'log.query.fields.micro_app_lifecycle', width: 100 },
      {
        prop: 'timestamp',
        label: 'log.query.fields.timestamp',
        width: 180,
        fixed: 'right',
        formatter: (row: any) => formatTime(row.timestamp),
      },
    ] as TableColumn[],
  },

  service: {
    'log.query': sysApi.logs.getService(),
  },
};

export default config;
