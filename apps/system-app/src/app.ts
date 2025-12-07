import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 系统主应用身份配置
 */
const systemAppIdentity: AppIdentity = {
  id: 'system',
  name: '系统主应用',
  description: 'BTC车间管理系统 - 系统主应用',
  pathPrefix: '/',
  subdomain: 'bellis.com.cn', // 修复：使用实际的域名（不带 www）
  type: 'main',
  enabled: true,
  version: '1.0.0',
};

export default systemAppIdentity;

