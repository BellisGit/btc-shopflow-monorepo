/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '质量管理系统',
      title: '质量管理系统',
      description: '质量检测、标准管理、质量报告',
      version: '版本 1.0.0',
      welcome: '欢迎使用质量管理系统',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      quality: {
        overview: '品质概览',
        inspection: '质量检测',
        defects: '缺陷管理',
        reports: '质量报告',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Quality Management System',
      title: 'Quality Management System',
      description: 'Quality inspection, standard management, quality reports',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Quality Management System',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      quality: {
        overview: 'Quality Overview',
        inspection: 'Quality Inspection',
        defects: 'Defect Management',
        reports: 'Quality Reports',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
