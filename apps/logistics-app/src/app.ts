import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 物流应用身份配置
 */
const logisticsAppIdentity: AppIdentity = {
  id: 'logistics',
  name: '物流应用',
  description: 'BTC车间管理系统 - 物流应用',
  pathPrefix: '/logistics',
  subdomain: 'logistics.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default logisticsAppIdentity;

