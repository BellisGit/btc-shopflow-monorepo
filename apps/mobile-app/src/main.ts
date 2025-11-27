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
    registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl);
        if (registration) {
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
      },
    });
  }
} catch (e) {
  // 如果 import.meta 不可用（生产环境构建后），注册 Service Worker
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] Service Worker registered:', swUrl);
        if (registration) {
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
          });
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration error:', error);
      },
    });
  }
}

app.mount('#app');

