import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:svg-icons';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createI18nPlugin, createThemePlugin } from '@btc/shared-core';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { QiankunProps } from '@btc/shared-core';
import App from './App.vue';

let app: VueApp | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let themePlugin: ReturnType<typeof createThemePlugin> | null = null;
let routerUnwatch: (() => void) | null = null; // 路由监听器清理函数

function handleLanguageChange(e: CustomEvent<{ locale: string }>) {
  const newLocale = e.detail.locale as 'zh-CN' | 'en-US';
  if (i18nPlugin?.i18n?.global) {
    i18nPlugin.i18n.global.locale.value = newLocale;
  }
}

function handleThemeChange(e: CustomEvent<{ color: string; dark: boolean }>) {
  if (themePlugin?.theme) {
    themePlugin.theme.setThemeColor(e.detail.color, e.detail.dark);
  }
}

function render(props: QiankunProps = {}) {
  const { container } = props;

  router = createRouter({
    // 使用 WebHistory，Qiankun 环境下设置 base 为应用前缀
    history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? '/production' : '/'),
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
    console.warn('[production-app] Router error:', error);
  });

  // 路由守卫：通知主应用添加标签
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    routerUnwatch = router.afterEach((to) => {
      // 跳过首页
      if (to.meta?.isHome) {
        return;
      }

      // ? 通知主应用添加标签（使用完整路径）
      const fullPath = `/production${to.path}`;
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
    locale: initialLocale,
    fallbackLocale: 'zh-CN',
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

    // 挂载后立即检查并修正 URL（防止 Vue Router 添加尾部斜杠）
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      router.isReady().then(() => {
        const currentPath = window.location.pathname;
        if (currentPath.endsWith('/') && currentPath !== '/') {
          window.history.replaceState(
            window.history.state,
            '',
            currentPath.slice(0, -1) + window.location.search + window.location.hash
          );
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
  async bootstrap() {},
  async mount(props: QiankunProps) {
    render(props);

    // 注册子应用的 Tab 元数据到主应用（暂时为空，待实现具体页面）
    if (props.registerTabs) {
      props.registerTabs([]);
    }

    // 通知主应用：子应用已就绪
    if (props.onReady) {
      props.onReady();
    }
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'production' }}));
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
