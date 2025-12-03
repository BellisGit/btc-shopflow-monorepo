import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { service } from './services/eps';
import { isDev } from './config';
import { registerAppEnvAccessors } from '@configs/layout-bridge';

// 注意：HTTP URL 拦截逻辑已在 index.html 中实现（内联脚本，最早执行）
// 这里不再需要重复拦截，避免多次重写同一原型导致的不确定行为
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
import 'virtual:svg-icons';
// 关键：确保 Element Plus 样式在最前面加载，避免被其他样式覆盖
// 开启样式隔离后，需要确保 Element Plus 样式在主应用中被正确加载
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
// 关键：直接导入确保构建时被正确打包，避免通过 SCSS @use 导入时的路径解析问题
import '@btc/shared-components/styles/dark-theme.css';
// 关键：在关闭样式隔离的情况下，需要在主应用入口直接引入样式，确保样式被正确加载
// 虽然 bootstrap/core/ui.ts 中也引入了，但在入口文件引入可以确保样式在应用启动时就被处理
import '@btc/shared-components/styles/index.scss';
// 关键：显式导入 BtcSvg 组件，确保在生产环境构建时被正确打包
// 即使组件在 bootstrap/core/ui.ts 中已经注册，这里显式导入可以确保组件被包含在构建产物中
import { BtcSvg } from '@btc/shared-components';

registerAppEnvAccessors();

const app = createApp(App);

// 在 bootstrap 之前就注册组件，确保组件在任何地方使用前都已注册
// 使用 typeof 确保组件被实际引用，避免被 tree-shake 掉
if (typeof BtcSvg !== 'undefined') {
  app.component('BtcSvg', BtcSvg);
  app.component('btc-svg', BtcSvg);
} else {
  console.error('[BtcSvg] 组件导入失败，请检查 @btc/shared-components 构建');
}

// 将 service 暴露到全局，供共享组件和子应用使用
if (typeof window !== 'undefined') {
  (window as any).__BTC_SERVICE__ = service;
  // 暴露到全局，供所有子应用共享使用
  (window as any).__APP_EPS_SERVICE__ = service;
  (window as any).service = service; // 也设置到 window.service，保持兼容性
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

    // 仅在开发环境注册开发工具组件
    if (isDev) {
      import('./components/DevTools/index.vue').then(({ default: DevTools }) => {
        const devToolsApp = createApp(DevTools);
        const container = document.createElement('div');
        document.body.appendChild(container);
        devToolsApp.mount(container);
      }).catch(err => {
        console.warn('开发工具加载失败:', err);
      });
    }
  })
  .catch(err => {
    // console.error('BTC Shopflow 启动失败', err);
  });
