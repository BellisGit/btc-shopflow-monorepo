/**
 * 国际化配置模块
 * 负责配置Vue I18n国际化
 */

import type { App } from 'vue';
import { createI18nPlugin, createThemePlugin } from '@btc/shared-core';
import messages from '@intlify/unplugin-vue-i18n/messages';

/**
 * 配置国际化
 */
export const setupI18n = (app: App) => {
  // 国际化
  app.use(createI18nPlugin({ messages }));

  // 主题
  app.use(createThemePlugin());
};
