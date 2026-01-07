/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '物流管理系统',
      title: '物流管理系统',
      description: '物流配送、仓储管理、运输调度',
      version: '版本 1.0.0',
      welcome: '欢迎使用物流管理系统',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      logistics: {
        procurement_module: '采购模块',
        procurement: {
          auxiliary: '辅料管理',
          packaging: '包材管理',
          supplier: '供应商管理',
        },
        warehouse_module: '仓储模块',
        warehouse: {
          material: '物料管理',
          material_list: '物料列表',
          material_ticket: '盘点票管理',
          config: '配置管理',
          config_storageLocation: '仓位配置',
        },
        customs_module: '海关模块',
        inventory_management: '盘点管理',
        inventory_management_storage_location: '仓位配置',
        inventory_management_info: '盘点记录表',
        inventory_management_detail: '盘点差异表',
        inventory_management_result: '盘点结果表',
        overview: '物流概览',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Logistics Management System',
      title: 'Logistics Management System',
      description: 'Logistics delivery, warehouse management, transportation scheduling',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Logistics Management System',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      logistics: {
        procurement_module: 'Procurement Module',
        procurement: {
          auxiliary: 'Auxiliary Management',
          packaging: 'Packaging Management',
          supplier: 'Supplier Management',
        },
        warehouse_module: 'Warehouse Module',
        warehouse: {
          material: 'Material Management',
          material_list: 'Material List',
          material_ticket: 'Check Ticket Management',
          config: 'Configuration Management',
          config_storageLocation: 'Storage Location Configuration',
        },
        customs_module: 'Customs Module',
        inventory_management: 'Inventory Management',
        inventory_management_storage_location: 'Storage Location Configuration',
        inventory_management_info: 'Inventory Records',
        inventory_management_detail: 'Inventory Variance',
        inventory_management_result: 'Inventory Result',
        overview: 'Logistics Overview',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
