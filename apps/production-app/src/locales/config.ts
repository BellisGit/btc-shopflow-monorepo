/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '生产管理系统',
      title: '生产管理系统',
      description: '生产计划、工艺管理、设备监控',
      version: '版本 1.0.0',
      welcome: '欢迎使用生产管理系统',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      production: {
        overview: '生产概览',
        plans: '生产计划',
        schedule: '生产调度',
        materials: '物料管理',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Production Management System',
      title: 'Production Management System',
      description: 'Production planning, process management, equipment monitoring',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Production Management System',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      production: {
        overview: 'Production Overview',
        plans: 'Production Plans',
        schedule: 'Production Schedule',
        materials: 'Material Management',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
