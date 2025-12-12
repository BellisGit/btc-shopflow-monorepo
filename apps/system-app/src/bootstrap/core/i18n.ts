/**
 * 国际化配置模块
 * 负责配置Vue I18n国际化
 */

import type { App } from 'vue';
import { createI18nPlugin, createThemePlugin, zhCN as sharedCoreZh, enUS as sharedCoreEn } from '@btc/shared-core';
import messages from '@intlify/unplugin-vue-i18n/messages';
// 导入 shared-components 的翻译文件
// 使用 shared-components 导出的方式，更可靠
import { sharedLocalesZhCN, sharedLocalesEnUS } from '@btc/shared-components';

// 合并 shared-core 的语言包
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

// 合并所有语言包：shared-core + shared-components + unplugin 自动加载的 messages
// 合并顺序：sharedCore -> sharedComponents -> unplugin messages
// 后面的会覆盖前面的，确保应用特定的翻译可以覆盖共享组件的翻译
const mergedMessages = {
  'zh-CN': mergeMessages(
    sharedCoreZh as Record<string, any>,
    sharedLocalesZhCN as Record<string, any>,
    (messages as Record<string, any>)['zh-CN'] || {}
  ),
  'en-US': mergeMessages(
    sharedCoreEn as Record<string, any>,
    sharedLocalesEnUS as Record<string, any>,
    (messages as Record<string, any>)['en-US'] || {}
  ),
};

/**
 * 配置国际化
 */
export const setupI18n = (app: App) => {
  // 国际化
  app.use(createI18nPlugin({ messages: mergedMessages }));

  // 主题
  app.use(createThemePlugin());
};
