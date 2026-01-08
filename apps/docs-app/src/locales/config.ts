/**
 * 文档应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '文档应用',
      title: '文档应用',
      description: 'BTC车间管理系统 - 文档应用',
      version: '版本 1.0.0',
      welcome: '欢迎使用文档应用',
    },
    menu: {
      docs: {
        center: '文档中心',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Documentation Application',
      title: 'Documentation Application',
      description: 'BTC Shop Management System - Documentation Application',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Documentation Application',
    },
    menu: {
      docs: {
        center: 'Documentation Center',
      },
    },
  },
} satisfies LocaleConfig;
