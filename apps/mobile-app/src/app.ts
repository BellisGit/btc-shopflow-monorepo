import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';
import { useI18n } from '@btc/shared-core';

/**
 * 移动应用身份配置
 */
const { t } = useI18n();

const mobileAppIdentity: AppIdentity = {
  id: 'mobile',
  name: t('subapp.name'),
  description: t('app.description'),
  pathPrefix: '/mobile',
  subdomain: 'mobile.bellis.com.cn',
  type: 'sub',
  enabled: true,
  version: '1.0.0',
};

export default mobileAppIdentity;

