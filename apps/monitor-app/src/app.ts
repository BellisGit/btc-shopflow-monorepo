import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 监控应用身份配置
 */
const monitorAppIdentity: AppIdentity = {
  id: 'monitor',
  name: '监控应用',
  description: 'BTC车间管理系统 - 监控应用',
  pathPrefix: '/monitor',
  subdomain: 'monitor.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default monitorAppIdentity;

