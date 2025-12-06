import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 工程应用身份配置
 */
const engineeringAppIdentity: AppIdentity = {
  id: 'engineering',
  name: '工程应用',
  description: 'BTC车间管理系统 - 工程应用',
  pathPrefix: '/engineering',
  subdomain: 'engineering.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default engineeringAppIdentity;

