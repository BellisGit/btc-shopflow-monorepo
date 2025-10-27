/**
 * 日志中心配置
 */
import type { TableColumn } from '@btc/shared-components';
import { service } from '../../../../services/eps';

console.log('[Logs Config] 配置文件被导入');

// 操作日志列配置
export const operationLogColumns: TableColumn[] = [
  {
    prop: 'username',
    label: '用户名',
    width: 120
  },
  {
    prop: 'operationType',
    label: '操作类型',
    width: 120,
    dict: [
      { label: '新增', value: 'INSERT', type: 'success' as const },
      { label: '更新', value: 'UPDATE', type: 'primary' as const },
      { label: '删除', value: 'DELETE', type: 'danger' as const }
    ],
    dictColor: true
  },
  {
    prop: 'operationDesc',
    label: '操作描述',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    prop: 'tableName',
    label: '表名',
    width: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'ipAddress',
    label: 'IP地址',
    width: 140
  },
  {
    prop: 'createdAt',
    label: '操作时间',
    width: 180,
    sortable: true,
    formatter: (row: any) => {
      if (!row.createdAt) return '';
      return new Date(row.createdAt).toLocaleString('zh-CN');
    }
  },
  {
    label: '操作',
    fixed: 'right',
    width: 100,
    buttons: [
      {
        label: '详情',
        type: 'primary',
        onClick: ({ scope }: any) => {
          // 按钮点击事件会在组件中处理
        }
      }
    ]
  }
];

// 请求日志列配置
export const requestLogColumns: TableColumn[] = [
  {
    prop: 'requestTime',
    label: '请求时间',
    width: 180,
    sortable: true
  },
  {
    prop: 'userName',
    label: '用户名',
    width: 120
  },
  {
    prop: 'requestUrl',
    label: '请求地址',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    prop: 'method',
    label: '请求方法',
    width: 100,
    dict: [
      { label: 'GET', value: 'GET', type: 'success' as const },
      { label: 'POST', value: 'POST', type: 'primary' as const },
      { label: 'PUT', value: 'PUT', type: 'warning' as const },
      { label: 'DELETE', value: 'DELETE', type: 'danger' as const }
    ],
    dictColor: true
  },
  {
    prop: 'ipAddress',
    label: 'IP地址',
    width: 140
  },
  {
    prop: 'duration',
    label: '耗时(ms)',
    width: 100,
    sortable: true,
    formatter: (row: any) => {
      return `${row.duration || 0}ms`;
    }
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    dict: [
      { label: '成功', value: 'success', type: 'success' as const },
      { label: '失败', value: 'failed', type: 'danger' as const },
      { label: '错误', value: 'error', type: 'danger' as const }
    ],
    dictColor: true
  }
];

// EPS 服务 - 使用正确的服务路径（根据后端 prefix: admin/system/log/sys/operation 和 admin/system/log/sys/request）
export const logServices = {
  operationLog: service.system?.log?.sys?.operation,
  requestLog: service.system?.log?.sys?.request,
};

// 调试：打印日志服务结构
console.log('[Logs Debug] service.system:', service.system);
console.log('[Logs Debug] service.system?.log:', service.system?.log);
console.log('[Logs Debug] service.system?.log?.sys:', service.system?.log?.sys);
if (service.system?.log) {
  console.log('[Logs Debug] service.system?.log keys:', Object.keys(service.system.log));
}
if (service.system?.log?.sys) {
  console.log('[Logs Debug] service.system?.log?.sys keys:', Object.keys(service.system.log.sys));
  console.log('[Logs Debug] service.system?.log?.sys?.operation:', service.system.log.sys.operation);
  console.log('[Logs Debug] service.system?.log?.sys?.request:', service.system.log.sys.request);
}

// 日志服务已正确配置

// Tab 配置
export const logTabs = [
  {
    name: 'operation',
    label: '操作日志'
  },
  {
    name: 'request',
    label: '请求日志'
  }
];
