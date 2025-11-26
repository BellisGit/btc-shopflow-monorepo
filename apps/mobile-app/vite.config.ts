import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('mobile-app');

const withSrc = (relativePath: string) =>
  resolve(fileURLToPath(new URL('.', import.meta.url)), relativePath);

const withPackages = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../../packages', import.meta.url)), relativePath);

const withRoot = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../..', import.meta.url)), relativePath);

export default defineConfig({
  resolve: {
    alias: {
      '@': withSrc('src'),
      '@modules': withSrc('src/modules'),
      '@db': withSrc('src/db'),
      '@pwa': withSrc('src/pwa'),
      '@btc/shared-core': withPackages('shared-core/src'),
      '@btc/shared-components': withPackages('shared-components/src'),
      '@btc/shared-utils': withPackages('shared-utils/src'),
      '@btc-common': withPackages('shared-components/src/common'),
      '@btc-components': withPackages('shared-components/src/components'),
      '@btc-styles': withPackages('shared-components/src/styles'),
      '@btc-locales': withPackages('shared-components/src/locales'),
      '@assets': withPackages('shared-components/src/assets'),
      '@btc-utils': withPackages('shared-components/src/utils'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': withPackages('shared-components/src/charts/utils/css-var'),
      '@charts-utils/color': withPackages('shared-components/src/charts/utils/color'),
      '@charts-utils/gradient': withPackages('shared-components/src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': withPackages('shared-components/src/charts/composables/useChartComponent'),
      '@charts-types': withPackages('shared-components/src/charts/types'),
      '@charts-utils': withPackages('shared-components/src/charts/utils'),
      '@charts-composables': withPackages('shared-components/src/charts/composables'),
    },
    dedupe: ['vue', 'vue-router', 'pinia'],
  },
  plugins: [
    basicSsl(),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    Components({
      resolvers: [VantResolver()],
      dts: 'src/components.d.ts',
    }),
    VueI18nPlugin({
      include: [
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url)),
      ],
      runtimeOnly: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // 1. 修复：明确指定图标路径（确保public/icons下存在对应文件）
      includeAssets: [
        'icons/android-chrome-192x192.png',
        'icons/android-chrome-512x512.png',
        'icons/android-chrome-1024x1024.png', // 新增大尺寸图标
        'icons/favicon-32x32.png',
        'icons/favicon-16x16.png',
        'icons/apple-touch-icon.png' // iOS专属图标
      ],
      // 2. 关键修复：删除injectManifest（与generateSW冲突，导致manifest生成异常）
      // injectManifest: { ... }, // 注释/删除这部分
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'
        ],
        navigateFallback: null,
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // 3. 优化：图标用CacheFirst（生产环境更快），添加版本控制避免缓存残留
            urlPattern: /\/icons\/.*\.(png|ico|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icon-cache-v1', // 改版本号可强制更新图标
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 缓存7天
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      useCredentials: false,
      // 开发环境禁用自动注册，避免自签名证书导致的 SSL 错误
      // main.ts 中已有手动注册逻辑，会优雅处理证书错误
      injectRegister: false,
      strategies: 'generateSW', // 保持自动生成SW（适合大多数场景）
      filename: 'manifest.webmanifest',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/', // 开发环境 fallback 到首页，避免404
      },
      manifest: {
        // 使用中文标题，确保 PWA 安装后显示正确
        name: '拜里斯科技',
        short_name: '拜里斯科技', // short_name 用于桌面图标下方显示，控制在12字符内
        // 添加 lang 属性确保中文正确显示
        lang: 'zh-CN',
        description: '拜里斯科技移动应用',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ["standalone", "fullscreen", "minimal-ui"], // 6. 补充：增强跨浏览器兼容性
        orientation: 'portrait',
        start_url: '/', // 确保start_url可访问（默认首页）
        scope: '/', // 确保所有路由在scope内（避免跨域导致manifest失效）
        icons: [
          // 7. 关键修复：补充purpose: "icon"（兼容iOS）、增加1024尺寸、统一purpose
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any' // any: 通用，maskable: 支持圆角裁剪（安卓12+）
          },
          {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/android-chrome-1024x1024.png', // 新增：覆盖大尺寸设备（平板/折叠屏）
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/apple-touch-icon.png', // iOS专属图标（180x180）
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple-touch-icon' // 明确用途，Safari优先读取
          }
        ],
      },
      disableDevLogs: true,
    }),
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: config.devPort,
    host: '0.0.0.0',
    strictPort: false,
    https: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Service-Worker-Allowed': '/' // 8. 补充：允许SW控制根路径下所有资源
    },
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
        withPackages('.'),
        withPackages('shared-components/src'),
      ],
    },
  },
  preview: {
    port: config.prePort,
    host: '0.0.0.0',
    https: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vant-vendor': ['vant'],
          'utils-vendor': ['dexie', '@vueuse/core'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
