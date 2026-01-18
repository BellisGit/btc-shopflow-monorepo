;
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import { setupI18n } from './i18n';
import { registerSW } from 'virtual:pwa-register';
import { useAuthStore } from './stores/auth';
import { getDeviceInfo } from './utils/device';
import { logger } from '@btc/shared-core';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// Vant 样式 - 全量导入
// 注意：如果使用按需导入（VantResolver），样式会自动导入，可以注释掉下面这行
import 'vant/lib/index.css';

const app = createApp(App);

// 全局错误处理 - 防止白屏
app.config.errorHandler = (err, instance, info) => {
  logger.error('[Vue Error Handler]', err, info);
  // 在移动端显示错误信息，避免白屏
  if (typeof document !== 'undefined') {
    const appEl = document.getElementById('app');
    if (appEl && !appEl.querySelector('.error-display')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-display';
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      errorDiv.innerHTML = `
        <h2 style="color: #ff4d4f; margin-bottom: 16px;">应用启动失败</h2>
        <p style="color: #666; margin-bottom: 8px;">错误信息：${(err as Error)?.message || '未知错误'}</p>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">请刷新页面重试，或联系技术支持</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">刷新页面</button>
      `;
      appEl.appendChild(errorDiv);
    }
  }
};

// 全局未处理的 Promise 拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  logger.error('[Unhandled Promise Rejection]', event.reason);
  // 阻止默认的错误处理（避免在控制台显示）
  event.preventDefault();

  // 在移动端显示错误信息
  if (typeof document !== 'undefined') {
    const appEl = document.getElementById('app');
    if (appEl && !appEl.querySelector('.error-display')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-display';
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      const errorMsg = event.reason?.message || event.reason?.toString() || '未知错误';
      errorDiv.innerHTML = `
        <h2 style="color: #ff4d4f; margin-bottom: 16px;">应用启动失败</h2>
        <p style="color: #666; margin-bottom: 8px;">错误信息：${errorMsg}</p>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">请刷新页面重试，或联系技术支持</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">刷新页面</button>
      `;
      appEl.appendChild(errorDiv);
    }
  }
});

// 全局 JavaScript 错误处理
window.addEventListener('error', (event) => {
  logger.error('[Global Error]', event.error || event.message);

  // 在移动端显示错误信息
  if (typeof document !== 'undefined') {
    const appEl = document.getElementById('app');
    if (appEl && !appEl.querySelector('.error-display')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-display';
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      const errorMsg = event.error?.message || event.message || '未知错误';
      errorDiv.innerHTML = `
        <h2 style="color: #ff4d4f; margin-bottom: 16px;">应用启动失败</h2>
        <p style="color: #666; margin-bottom: 8px;">错误信息：${errorMsg}</p>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">请刷新页面重试，或联系技术支持</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">刷新页面</button>
      `;
      appEl.appendChild(errorDiv);
    }
  }
});

// Pinia
const pinia = createPinia();
app.use(pinia);

// 初始化 auth store
try {
  const authStore = useAuthStore();
  authStore.init();
} catch (error) {
  logger.error('[Auth Store Init Error]', error);
}

// Router
try {
  app.use(router);
} catch (error) {
  logger.error('[Router Error]', error);
}

// i18n
try {
  setupI18n(app);
} catch (error) {
  logger.error('[i18n Setup Error]', error);
}

// PWA Service Worker - 兼容性优化版本
// 不需要离线功能，只保留基本的 manifest 支持
// 在不支持 Service Worker 的浏览器上不影响应用运行
try {
  const isDev = (import.meta as any).env?.DEV;
  const deviceInfo = getDeviceInfo();

  // 检查浏览器兼容性（仅用于日志记录，不影响应用运行）
  // QQ 浏览器、某些国产浏览器可能不支持 Service Worker，但不影响基本功能
  const isUnsupportedBrowser = deviceInfo.browser === 'qq' ||
                                deviceInfo.browser === 'unknown' ||
                                !deviceInfo.supportsServiceWorker;

  // 记录兼容性信息（不显示警告，因为应用可以正常运行）
  if (isUnsupportedBrowser) {
    console.info(`[App] Running on ${deviceInfo.browser} browser (Service Worker not supported, but app will work normally)`);
  }

  // 只在支持的浏览器上注册 Service Worker，且非开发环境
  // 由于不需要离线功能，可以完全禁用 Service Worker
  // 但保留 manifest 支持，以便应用可以添加到主屏幕
  // Service Worker 功能已禁用（代码已移除以避免常量条件 lint 错误）
} catch (e) {
  // Service Worker 注册失败不影响应用运行
  console.warn('[PWA] Service Worker registration error (non-blocking):', e);
  // Service Worker 功能已禁用（代码已移除以避免常量条件 lint 错误）
}

// 安全地挂载应用
try {
  app.mount('#app');
} catch (error) {
  logger.error('[App Mount Error]', error);
  // 如果挂载失败，显示错误信息
  if (typeof document !== 'undefined') {
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <h2 style="color: #ff4d4f; margin-bottom: 16px;">应用启动失败</h2>
          <p style="color: #666; margin-bottom: 8px;">错误信息：${(error as Error)?.message || '未知错误'}</p>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">请刷新页面重试，或联系技术支持</p>
          <button onclick="window.location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">刷新页面</button>
        </div>
      `;
    }
  }
}

