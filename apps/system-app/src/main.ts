import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { service } from './services/eps';
import 'virtual:svg-icons';

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
