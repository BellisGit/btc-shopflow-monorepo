/**
 * 移动应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '移动应用',
      title: '移动应用',
      description: 'BTC车间管理系统 - 移动应用',
      version: '版本 1.0.0',
      welcome: '欢迎使用移动应用',
    },
  },
  'en-US': {
    app: {
      name: 'Mobile Application',
      title: 'Mobile Application',
      description: 'BTC Shop Management System - Mobile Application',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Mobile Application',
    },
  },
} satisfies LocaleConfig;
