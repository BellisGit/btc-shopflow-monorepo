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

// Pinia
const pinia = createPinia();
app.use(pinia);

// 初始化 auth store
const authStore = useAuthStore();
authStore.init();

// Router
app.use(router);

// i18n
setupI18n(app);

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

app.mount('#app');

