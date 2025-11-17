import { createApp } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:svg-icons';
import './styles/theme.scss';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createI18nPlugin, createThemePlugin } from '@btc/shared-core';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { QiankunProps } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale } from './i18n/getters';
import App from './App.vue';

let app: VueApp | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let themePlugin: ReturnType<typeof createThemePlugin> | null = null;
let routerUnwatch: (() => void) | null = null; // 路由监听器清理函数

// 语言切换事件监听器
function handleLanguageChange(e: CustomEvent<{ locale: string }>) {
  const newLocale = e.detail.locale as 'zh-CN' | 'en-US';
  if (i18nPlugin?.i18n?.global) {
    i18nPlugin.i18n.global.locale.value = newLocale;
  }
}

// 主题切换事件监听器
function handleThemeChange(e: CustomEvent<{ color: string; dark: boolean }>) {
  if (themePlugin?.theme) {
    themePlugin.theme.setThemeColor(e.detail.color, e.detail.dark);
  }
}

function render(props: QiankunProps = {}) {
  const { container } = props;

  router = createRouter({
    // 在 qiankun 环境下使用 MemoryHistory，避免路由冲突
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/'),
    strict: true,
    routes: [
      {
        path: '/',
        name: 'Home',
        component: () => import('./views/Home.vue'),
        meta: { isHome: true },
      },
    ],
  });

  router.onError((error) => {
    console.warn('[engineering-app] Router error:', error);
  });

  // 路由守卫：通知主应用添加标签
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    routerUnwatch = router.afterEach((to) => {
      // 跳过首页
      if (to.meta?.isHome) {
        return;
      }

      // 使用 window.location.pathname 获取完整路径，避免重复拼接
      const currentPath = window.location.pathname;
      // 确保路径以 /engineering 开头
      const fullPath = currentPath.startsWith('/engineering') ? currentPath : `/engineering${to.path === '/' ? '' : to.path}`;

      window.dispatchEvent(new CustomEvent('subapp:route-change', {
        detail: {
          path: fullPath,
          fullPath: fullPath,
          name: to.name,
          meta: {
            ...to.meta,
            label: to.name as string,
          },
        },
      }));
    });
  }

  // Initialize i18n
  const initialLocale = props.locale || 'zh-CN';
  i18nPlugin = createI18nPlugin({
    locale: normalizeLocale(initialLocale),
    fallbackLocale: 'zh-CN',
    messages: getLocaleMessages(),
    scope: 'engineering',
  });

  // Initialize theme
  themePlugin = createThemePlugin();

  app = createApp(App);
  app.use(router);
  app.use(createPinia());
  app.use(ElementPlus);
  app.use(i18nPlugin);
  app.use(themePlugin);

  const mountPoint = container ? container.querySelector('#app') : '#app';
  if (mountPoint) {
    app.mount(mountPoint);

    // 在 qiankun 环境下，同步初始路由
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      router.isReady().then(() => {
        // 从浏览器 URL 提取子应用路由
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/engineering')) {
          const subRoute = currentPath.slice('/engineering'.length) || '/';
          // 如果当前路由不匹配，则同步到子应用路由
          if (router.currentRoute.value.path !== subRoute) {
            router.replace(subRoute).catch(() => {});
          }
        } else {
          // 如果不是 /engineering 路径，默认跳转到首页
          router.replace('/').catch(() => {});
        }
      });
    }
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('language-change', handleLanguageChange as EventListener);
    window.addEventListener('theme-change', handleThemeChange as EventListener);
  }
}

renderWithQiankun({
  bootstrap() {
    // 使用 queueMicrotask 确保在下一个事件循环中 resolve
    // 避免模块加载阻塞导致的超时问题
    return new Promise<void>((resolve, reject) => {
      try {
        queueMicrotask(() => {
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  async mount(props: QiankunProps) {
    render(props);

    // 通知主应用：子应用已就绪
    if (props.onReady) {
      props.onReady();
    }
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'engineering' }}));
  },
  async update(props: QiankunProps) {
    if (props.locale && i18nPlugin?.i18n?.global) {
      i18nPlugin.i18n.global.locale.value = props.locale as 'zh-CN' | 'en-US';
    }
  },
  async unmount(props: QiankunProps) {
    // ? 解绑路由监听器（防止幽灵事件）
    if (routerUnwatch) {
      routerUnwatch();
      routerUnwatch = null;
    }

    // 清理子应用的 Tab 映射
    if (props.clearTabs) {
      props.clearTabs();
    }

    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      window.removeEventListener('language-change', handleLanguageChange as EventListener);
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    }

    app?.unmount();
    app = null;
    router = null;
    i18nPlugin = null;
    themePlugin = null;
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
