import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import { setupI18n } from './i18n';
import { registerSW } from 'virtual:pwa-register';
import { useAuthStore } from './stores/auth';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// Vant 样式 - 全量导入（按需导入时样式会自动导入，但为了确保样式正常，也可以手动导入）
// 如果使用按需导入，可以注释掉下面这行
import 'vant/lib/index.css';

const app = createApp(App);

// 全局错误处理 - 防止白屏
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error Handler]', err, info);
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
        <p style="color: #666; margin-bottom: 8px;">错误信息：${err?.message || '未知错误'}</p>
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
  console.error('[Unhandled Promise Rejection]', event.reason);
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
  console.error('[Global Error]', event.error || event.message);
  
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
  console.error('[Auth Store Init Error]', error);
}

// Router
try {
  app.use(router);
} catch (error) {
  console.error('[Router Error]', error);
}

// i18n
try {
  setupI18n(app);
} catch (error) {
  console.error('[i18n Setup Error]', error);
}

// PWA Service Worker
// 在开发环境中，如果使用自签名证书，Service Worker 注册会失败
// 因此完全禁用开发环境的 Service Worker 注册
// 生产环境使用有效证书时，Service Worker 会正常注册
// 使用 try-catch 避免生产环境 import.meta 问题
try {
  const isDev = (import.meta as any).env?.DEV;
  if ('serviceWorker' in navigator && !isDev) {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl);
        if (registration) {
          // 监听 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新版本已安装，但旧版本仍在运行
                  console.log('[PWA] New Service Worker installed, waiting for activation');
                  // 强制激活新版本（跳过等待）
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });

          // 页面加载时立即检查更新（确保能及时检测到新版本）
          registration.update().catch(err => {
            console.warn('[PWA] Service Worker initial update check failed:', err);
          });

          // 定期检查更新（每5分钟，更频繁地检查）
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          }, 5 * 60 * 1000); // 从30分钟改为5分钟

          // 页面可见时检查更新
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              registration.update().catch(err => {
                console.warn('[PWA] Service Worker update check failed:', err);
              });
            }
          });

          // 页面聚焦时检查更新
          window.addEventListener('focus', () => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          });

          // 监听 Service Worker 控制器变化（新版本已激活）
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service Worker controller changed, reloading page');
            // 延迟一下，确保新版本完全激活
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
      },
    });

    // 导出更新函数，供外部调用
    (window as any).updateServiceWorker = updateSW;
  }
} catch (e) {
  // 如果 import.meta 不可用（生产环境构建后），注册 Service Worker
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl);
        if (registration) {
          // 监听 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新版本已安装，但旧版本仍在运行
                  console.log('[PWA] New Service Worker installed, waiting for activation');
                  // 强制激活新版本（跳过等待）
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });

          // 页面加载时立即检查更新（确保能及时检测到新版本）
          registration.update().catch(err => {
            console.warn('[PWA] Service Worker initial update check failed:', err);
          });

          // 定期检查更新（每5分钟，更频繁地检查）
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          }, 5 * 60 * 1000); // 从30分钟改为5分钟

          // 页面可见时检查更新
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              registration.update().catch(err => {
                console.warn('[PWA] Service Worker update check failed:', err);
              });
            }
          });

          // 页面聚焦时检查更新
          window.addEventListener('focus', () => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          });

          // 监听 Service Worker 控制器变化（新版本已激活）
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service Worker controller changed, reloading page');
            // 延迟一下，确保新版本完全激活
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
      },
    });

    // 导出更新函数，供外部调用
    (window as any).updateServiceWorker = updateSW;
  }
}

// 安全地挂载应用
try {
  app.mount('#app');
} catch (error) {
  console.error('[App Mount Error]', error);
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
          <p style="color: #666; margin-bottom: 8px;">错误信息：${error?.message || '未知错误'}</p>
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

