import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { btc } from '@btc/vite-plugin';

export default defineConfig({
  plugins: [
    vue(),
    btc({
      type: 'admin',
      reqUrl: '',
      nameTag: true,
      eps: {
        enable: true,
        api: '', // 空 URL 表示使用本地 Mock 数据
        dist: 'build/eps',
        mapping: [],
      },
    }),
  ],
  server: {
    port: 3100,
  },
});
