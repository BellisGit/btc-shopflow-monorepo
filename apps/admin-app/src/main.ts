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

    // 应用挂载后，延迟关闭 Loading
    setTimeout(() => {
      const el = document.getElementById('Loading');
      if (el) {
        el.classList.add('is-hide');
      }
    }, 300);
  })
  .catch(err => {
    console.error('BTC Shopflow 启动失败', err);
  });
