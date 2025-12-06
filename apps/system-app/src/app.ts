import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 系统主应用身份配置
 */
const systemAppIdentity: AppIdentity = {
  id: 'system',
  name: '系统主应用',
  description: 'BTC车间管理系统 - 系统主应用',
  pathPrefix: '/',
  subdomain: 'www.bellis.com.cn',
  type: 'main',
  enabled: true,
  version: '1.0.0',
};

export default systemAppIdentity;

