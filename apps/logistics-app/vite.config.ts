import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  base: '/', // 明确设置为根路径，不使用 /logistics/
  plugins: [
    vue(),
    qiankun('logistics', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 8081,
    host: '0.0.0.0',
    cors: true,
    origin: 'http://localhost:8081',
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      strict: false,
    },
  },
});
