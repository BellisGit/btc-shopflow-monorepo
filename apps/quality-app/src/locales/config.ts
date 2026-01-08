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
    common: {
      // 错误消息
      error: {
        render_failed: '渲染失败',
        cannot_display_loading: '无法显示应用级 loading',
        identity_expired: '身份已过期，请重新登录',
        manifest_injected: '已从 manifest 注入应用配置',
        manifest_inject_failed: '从 manifest 注入配置失败',
      },
      // 系统相关
      system: {
        quality_module: '品质模块',
        btc_shop_management_system: 'BTC车间管理系统 - 质量应用',
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
    common: {
      // 错误消息
      error: {
        render_failed: 'Render failed',
        cannot_display_loading: 'Cannot display app-level loading',
        identity_expired: 'Identity expired, please login again',
        manifest_injected: 'Application configuration injected from manifest',
        manifest_inject_failed: 'Failed to inject configuration from manifest',
      },
      // 系统相关
      system: {
        quality_module: 'Quality Module',
        btc_shop_management_system: 'BTC Shop Management System - Quality Application',
      },
    },
  },
} satisfies LocaleConfig;
