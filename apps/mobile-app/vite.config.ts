import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';

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
    },
    dedupe: ['vue', 'vue-router', 'pinia'],
  },
  plugins: [
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'BTC ShopFlow Mobile',
        short_name: 'ShopFlow',
        description: 'BTC ShopFlow 移动端应用',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 8091,
    host: '0.0.0.0',
    strictPort: false,
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

