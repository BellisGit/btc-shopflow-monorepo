import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';

const app = createApp(App);

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
