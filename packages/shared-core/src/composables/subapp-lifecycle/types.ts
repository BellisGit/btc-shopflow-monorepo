import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { Pinia } from 'pinia';
import type { QiankunProps } from '../../types/qiankun';
import type { createI18nPlugin } from '../../btc/plugins/i18n';
import type { createThemePlugin } from '../../btc/plugins/theme';

export type CleanupListener = [event: string, handler: EventListener];

export interface CleanupState {
  routerAfterEach?: () => void;
  listeners: CleanupListener[];
}

export interface SubAppContext {
  app: VueApp;
  router: Router;
  pinia: Pinia;
  i18n: ReturnType<typeof createI18nPlugin>;
  theme: ReturnType<typeof createThemePlugin>;
  cleanup: CleanupState;
  props: QiankunProps;
  translate: (key?: string | null) => string;
  isUnmounted?: boolean; // 标记应用是否已卸载，用于防止卸载后继续执行路由同步等操作
}

export interface SubAppOptions {
  appId: string;
  basePath: string;
  domainCachePath: string;
  AppComponent: any; // Vue 组件
  createRouter: () => Router;
  setupRouter: (app: VueApp, router?: Router) => Router;
  setupStore: (app: VueApp, store?: Pinia) => Pinia;
  setupI18n: (app: VueApp, locale?: string) => ReturnType<typeof createI18nPlugin>;
  setupUI: (app: VueApp) => ReturnType<typeof createThemePlugin>;
  setupPlugins?: (app: VueApp, router: Router) => Promise<void>;
}
