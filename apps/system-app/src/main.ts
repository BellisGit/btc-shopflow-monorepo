import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { service } from './services/eps';
import 'virtual:svg-icons';
// 关键：确保 Element Plus 样式在最前面加载，避免被其他样式覆盖
// 开启样式隔离后，需要确保 Element Plus 样式在主应用中被正确加载
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 关键：在关闭样式隔离的情况下，需要在主应用入口直接引入样式，确保样式被正确加载
// 虽然 bootstrap/core/ui.ts 中也引入了，但在入口文件引入可以确保样式在应用启动时就被处理
import '@btc/shared-components/styles/index.scss';

const app = createApp(App);

// 将 service 暴露到全局，供共享组件使用
if (typeof window !== 'undefined') {
  (window as any).__BTC_SERVICE__ = service;
}

// 启动
bootstrap(app)
  .then(() => {
    app.mount('#app');

    // 应用挂载后，立即关闭并移除所有 Loading 元素（如果存在）
    // 注意：system-app 的 index.html 中没有 #Loading 元素，但子应用可能有
    // 这里确保所有 Loading 元素都被移除，避免一直显示
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      // 立即隐藏
      loadingEl.style.display = 'none';
      loadingEl.style.visibility = 'hidden';
      loadingEl.style.opacity = '0';
      // 延迟移除，确保动画完成
    setTimeout(() => {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
      }
      }, 100);
    }
  })
  .catch(err => {
    // console.error('BTC Shopflow 启动失败', err);
  });
