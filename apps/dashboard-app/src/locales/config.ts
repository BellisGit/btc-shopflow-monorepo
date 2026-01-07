/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '看板管理系统',
      title: '看板管理系统',
      description: '数据可视化、统计分析、业务看板',
      version: '版本 1.0.0',
      welcome: '欢迎使用看板管理系统',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      dashboard: {
        overview: '看板概览',
        analytics: '数据分析',
        reports: '报表管理',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Dashboard Management System',
      title: 'Dashboard Management System',
      description: 'Data visualization, statistical analysis, business dashboard',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Dashboard Management System',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      dashboard: {
        overview: 'Dashboard Overview',
        analytics: 'Data Analytics',
        reports: 'Report Management',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
