import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { setupErrorHandler } from './guards/errorHandler';
import { setupBeforeResolveGuard } from './guards/beforeResolve';
import { setupBeforeEachGuard } from './guards/beforeEach';
import { setupAfterEachGuard } from './guards/afterEach';
import { createTitleGuard } from '@btc/shared-router';
import { tSync } from '../i18n/getters';

/**
 * 创建 router 实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
});

// 注册守卫
setupErrorHandler(router);
setupBeforeResolveGuard(router);
setupBeforeEachGuard(router);
setupAfterEachGuard(router);

// 注册标题守卫（使用国际化翻译函数）
createTitleGuard(router, {
  translate: tSync,
  preloadConfig: true,
});

export default router;

// 导出工具函数供外部使用
export { isAuthenticated, setupI18nTitleWatcher } from './utils';
