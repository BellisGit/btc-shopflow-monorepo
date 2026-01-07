/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '系统应用',
      title: '系统应用',
      description: '系统配置、基础数据、系统维护',
      version: '版本 1.0.0',
      welcome: '欢迎使用系统应用',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      data: {
        files: '文件管理',
        files_list: '文件列表',
        files_template: '文件模板',
        files_preview: '文件预览',
        dictionary: '字典管理',
        dictionary_file_categories: '文件分类',
        recycle: '数据回收站',
      },
      inventory: {
        data_source: '盘点数据源',
        data_source_bom: '非SysPro BOM表',
        data_source_list: '清单上传',
        data_source_ticket: '盘点票导入',
        process: '流程管理',
        result: '实盘数据',
        confirm: '流程确认',
      },
      system: {
        home: '首页',
      },
    },
  },
  'en-US': {
    app: {
      name: 'System Application',
      title: 'System Application',
      description: 'System configuration, basic data, system maintenance',
      version: 'Version 1.0.0',
      welcome: 'Welcome to System Application',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      data: {
        files: 'File Management',
        files_list: 'File List',
        files_template: 'File Template',
        files_preview: 'File Preview',
        dictionary: 'Dictionary Management',
        dictionary_file_categories: 'File Categories',
        recycle: 'Data Recycle Bin',
      },
      inventory: {
        data_source: 'Inventory Data Source',
        data_source_bom: 'Non-SysPro BOM Table',
        data_source_list: 'Checklist Upload',
        data_source_ticket: 'Check Ticket Import',
        process: 'Process Management',
        result: 'Live Inventory Data',
        confirm: 'Process Confirmation',
      },
      system: {
        home: 'Home',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
