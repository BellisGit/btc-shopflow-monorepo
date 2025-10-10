import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { btc } from '@btc/vite-plugin';

export default defineConfig({
  plugins: [
    vue(),
    btc({
      type: 'admin',
      reqUrl: '', // 后端地址（可选）
      nameTag: true,
      eps: {
        enable: false, // 禁用 EPS 插件（测试时不需要后端）
        api: '',
        dist: '',
        mapping: [],
      },
    }),
  ],
  server: {
    port: 3100,
  },
});
