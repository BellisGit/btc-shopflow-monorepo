import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 管理应用身份配置
 */
const adminAppIdentity: AppIdentity = {
  id: 'admin',
  name: '管理应用',
  description: 'BTC车间管理系统 - 管理应用',
  pathPrefix: '/admin',
  subdomain: 'admin.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default adminAppIdentity;

