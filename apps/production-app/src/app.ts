import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 生产应用身份配置
 */
const productionAppIdentity: AppIdentity = {
  id: 'production',
  name: '生产应用',
  description: 'BTC车间管理系统 - 生产应用',
  pathPrefix: '/production',
  subdomain: 'production.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default productionAppIdentity;

