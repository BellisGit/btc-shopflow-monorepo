import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 布局应用身份配置
 */
const layoutAppIdentity: AppIdentity = {
  id: 'layout',
  name: '布局应用',
  description: 'BTC车间管理系统 - 布局应用',
  pathPrefix: '/',
  subdomain: 'layout.bellis.com.cn',
  type: 'layout',
  enabled: true,
  version: '1.0.0',
};

export default layoutAppIdentity;

