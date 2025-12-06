import type { AppIdentity } from '@configs/app-identity.types';

/**
 * 文档应用身份配置
 */
const docsSiteAppIdentity: AppIdentity = {
  id: 'docs',
  name: '文档应用',
  description: 'BTC车间管理系统 - 文档应用',
  pathPrefix: '/docs',
  subdomain: 'docs.bellis.com.cn',
  type: 'docs',
  enabled: true,
  version: '1.0.0',
};

export default docsSiteAppIdentity;

