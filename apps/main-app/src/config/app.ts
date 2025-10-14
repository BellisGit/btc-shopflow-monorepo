/**
 * 系统基础信息配置
 */

export const appConfig = {
  // 系统名称
  name: 'BTC 车间流程管理系统',

  // 系统简称
  shortName: 'BTC ShopFlow',

  // 系统英文名
  enName: 'BTC Shop Flow Management System',

  // 系统版本
  version: '1.0.0',

  // Logo 路径
  logo: '/logo.png',

  // Favicon 路径
  favicon: '/favicon.ico',

  // 公司/组织信息
  company: {
    name: 'BTC',
    fullName: 'BTC Technology',
    fullNameCn: '拜里斯',
    fullNameEn: 'Bellis Technology',
    website: 'https://www.btc.com',
    // Slogan 使用国际化键
    sloganKey: 'app.slogan',
  },

  // Copyright 信息
  copyright: {
    year: new Date().getFullYear(),
    text: `© ${new Date().getFullYear()} BTC. All rights reserved.`,
  },

  // 联系方式
  contact: {
    email: 'support@btc.com',
    phone: '400-123-4567',
    address: '深圳市南山区科技园',
  },

  // 加载页面文案
  loading: {
    title: '正在加载系统资源...',
    subTitle: '初次加载可能需要较多时间，请耐心等待',
  },

  // 路由配置
  router: {
    // 路由模式：'hash' | 'history'
    mode: 'history',
    // 页面切换动画
    transition: 'slide',
  },

  // 布局配置
  layout: {
    // 侧边栏宽度
    sidebarWidth: 210,
    // 侧边栏折叠宽度
    sidebarCollapseWidth: 64,
    // 顶栏高度
    topbarHeight: 48,
    // 标签栏高度
    tabbarHeight: 39,
  },
};

export default appConfig;

