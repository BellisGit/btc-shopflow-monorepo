/**
 * ESLint 自定义规则插件
 * 用于注册自定义的国际化规范检查规则
 */

const i18nKeyFormat = require('./i18n-key-format');

module.exports = {
  rules: {
    'i18n-key-format': i18nKeyFormat,
  },
};
