import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 质量应用身份配置
 */
const qualityAppIdentity: AppIdentity = {
  id: 'quality',
  name: '质量应用',
  description: 'BTC车间管理系统 - 质量应用',
  pathPrefix: '/quality',
  subdomain: 'quality.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default qualityAppIdentity;

