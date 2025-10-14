import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  base: '/', // 明确设置为根路径，不使用 /production/
  plugins: [
    vue(),
    qiankun('production', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 8084,
    host: '0.0.0.0',
    cors: true,
    origin: 'http://localhost:8084',
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      strict: false,
    },
  },
});
