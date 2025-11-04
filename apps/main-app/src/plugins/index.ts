import type { Plugin } from '@btc/shared-core';
import { exportJsonToExcel } from '@btc/shared-core';
import { githubPlugin } from './github';
import { i18nPlugin as i18nToolbarPlugin } from './i18n';
import { themePlugin as themeToolbarPlugin } from './theme';
import { userSettingPlugin } from './user-setting';

/**
 * Excel 插件
 */
export const excelPlugin: Plugin = {
  name: 'excel',
  version: '1.0.0',
  description: 'Excel export plugin based on xlsx',

  api: {
    export: exportJsonToExcel,
  },

  install(app, _options) {
    // 可以在这里注入全局属性
    app.config.globalProperties.$excel = {
      export: exportJsonToExcel,
    };
  },

  uninstall() {
    // Plugin uninstalled
  },
};

/**
 * 导出所有插件
 */
export { githubPlugin, i18nToolbarPlugin, themeToolbarPlugin, userSettingPlugin };

/**
 * 通知插件（示例）
 */
export const notificationPlugin: Plugin = {
  name: 'notification',
  version: '1.0.0',
  description: 'Notification management plugin',

  api: {
    success(message: string) {
      console.log('? Success:', message);
    },
    error(message: string) {
      console.error('? Error:', message);
    },
    info(message: string) {
      console.log('?? Info:', message);
    },
  },

  install(_app) {
    // Plugin installed
  },
};

/**
 * Logger 插件（示例，依赖 notification）
 */
export const loggerPlugin: Plugin = {
  name: 'logger',
  version: '1.0.0',
  description: 'Logger plugin with notification',
  dependencies: ['notification'], // 依赖 notification 插件

  api: {
    log(level: string, message: string) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    },
  },

  install(_app) {
    // Plugin installed
  },
};

