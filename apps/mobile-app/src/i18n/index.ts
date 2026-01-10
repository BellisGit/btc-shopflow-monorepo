import type { App } from 'vue';
import { createI18n } from 'vue-i18n';

// 手动定义消息，避免依赖 @intlify/unplugin-vue-i18n/messages
// 因为 mobile-app 没有 locale 文件，使用空消息对象
const messages = {
  'zh-CN': {},
  'en-US': {},
};

export function setupI18n(app: App) {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages,
  });

  app.use(i18n as any); // 类型断言：vue-i18n 实例可以作为插件使用
  return i18n;
}

