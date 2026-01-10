import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 运维应用身份配置
 */
const operationsAppIdentity: AppIdentity = {
  id: 'operations',
  name: '运维应用',
  description: 'BTC车间管理系统 - 运维应用',
  pathPrefix: '/operations',
  subdomain: 'operations.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default operationsAppIdentity;

