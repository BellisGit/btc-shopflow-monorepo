import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import { setupI18n } from './i18n';
import { registerSW } from 'virtual:pwa-register';
import { useAuthStore } from './stores/auth';
import { getDeviceInfo } from './utils/device';
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

// PWA Service Worker - 设备优化版本
// 针对不同设备（iOS、Android各品牌）采用不同的更新策略
try {
  const isDev = (import.meta as any).env?.DEV;
  const deviceInfo = getDeviceInfo();
  
  // 记录设备信息
  console.log('[PWA] Device Info:', {
    os: deviceInfo.os,
    brand: deviceInfo.brand,
    browser: deviceInfo.browser,
    supportsServiceWorker: deviceInfo.supportsServiceWorker,
    supportsBackgroundSync: deviceInfo.supportsBackgroundSync,
  });
  
  if (deviceInfo.supportsServiceWorker && !isDev) {
    // 根据设备类型调整更新检查频率
    // iOS设备：更新检查频率较低（iOS对后台任务限制较严格）
    // Android设备：可以更频繁地检查更新
    const updateCheckInterval = deviceInfo.isIOS 
      ? 10 * 60 * 1000  // iOS: 10分钟
      : deviceInfo.isAndroid && (deviceInfo.brand === 'Xiaomi' || deviceInfo.brand === 'Huawei' || deviceInfo.brand === 'Vivo')
      ? 3 * 60 * 1000   // 国产Android: 3分钟（这些设备通常有更积极的电池优化）
      : 5 * 60 * 1000;  // 其他Android: 5分钟
    
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl, `(${deviceInfo.brand} ${deviceInfo.browser})`);
        if (registration) {
          // 监听 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New Service Worker installed, waiting for activation');
                  // iOS设备：延迟激活，避免频繁刷新影响用户体验
                  // Android设备：立即激活
                  if (deviceInfo.isIOS) {
                    // iOS上延迟激活，给用户一些时间完成当前操作
                    setTimeout(() => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }, 2000);
                  } else {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });
            }
          });

          // 页面加载时立即检查更新
          registration.update().catch(err => {
            console.warn('[PWA] Service Worker initial update check failed:', err);
          });

          // 定期检查更新（根据设备类型调整频率）
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          }, updateCheckInterval);

          // 页面可见时检查更新（iOS特别重要，因为iOS对后台任务限制严格）
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
            // iOS设备：延迟刷新，避免打断用户操作
            // Android设备：立即刷新
            const reloadDelay = deviceInfo.isIOS ? 500 : 100;
            setTimeout(() => {
              window.location.reload();
            }, reloadDelay);
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
        // 在iOS上，某些情况下Service Worker注册可能失败，但不影响基本功能
        if (deviceInfo.isIOS) {
          console.warn('[PWA] Service Worker registration failed on iOS, app will still work but offline features may be limited');
        }
      },
    });

    // 导出更新函数，供外部调用
    (window as any).updateServiceWorker = updateSW;
  } else if (isDev) {
    console.log('[PWA] Service Worker registration disabled in development mode');
  } else if (!deviceInfo.supportsServiceWorker) {
    console.warn('[PWA] Service Worker not supported on this device');
  }
} catch (e) {
  // 如果 import.meta 不可用（生产环境构建后），注册 Service Worker
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.supportsServiceWorker) {
    const updateCheckInterval = deviceInfo.isIOS 
      ? 10 * 60 * 1000
      : deviceInfo.isAndroid && (deviceInfo.brand === 'Xiaomi' || deviceInfo.brand === 'Huawei' || deviceInfo.brand === 'Vivo')
      ? 3 * 60 * 1000
      : 5 * 60 * 1000;
    
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl, `(${deviceInfo.brand} ${deviceInfo.browser})`);
        if (registration) {
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New Service Worker installed, waiting for activation');
                  if (deviceInfo.isIOS) {
                    setTimeout(() => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }, 2000);
                  } else {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });
            }
          });

          registration.update().catch(err => {
            console.warn('[PWA] Service Worker initial update check failed:', err);
          });

          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          }, updateCheckInterval);

          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              registration.update().catch(err => {
                console.warn('[PWA] Service Worker update check failed:', err);
              });
            }
          });

          window.addEventListener('focus', () => {
            registration.update().catch(err => {
              console.warn('[PWA] Service Worker update check failed:', err);
            });
          });

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service Worker controller changed, reloading page');
            const reloadDelay = deviceInfo.isIOS ? 500 : 100;
            setTimeout(() => {
              window.location.reload();
            }, reloadDelay);
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
        if (deviceInfo.isIOS) {
          console.warn('[PWA] Service Worker registration failed on iOS, app will still work but offline features may be limited');
        }
      },
    });

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

