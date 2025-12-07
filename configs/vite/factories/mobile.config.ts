/**
 * 移动应用 Vite 配置工厂
 * 生成移动应用的完整 Vite 配置（mobile-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { createPathHelpers } from '../utils/path-helpers';

// 使用 ESM 导入 VueI18nPlugin（Vite 配置文件支持 ESM）
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { btc } from '@btc/vite-plugin';
import { addVersionPlugin } from '../plugins';

export interface MobileAppViteConfigOptions {
  /**
   * 应用名称（如 'mobile-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * 自定义插件列表
   */
  customPlugins?: Plugin[];
  /**
   * 自定义构建配置
   */
  customBuild?: Partial<UserConfig['build']>;
  /**
   * 自定义服务器配置
   */
  customServer?: Partial<UserConfig['server']>;
  /**
   * 自定义预览服务器配置
   */
  customPreview?: Partial<UserConfig['preview']>;
  /**
   * 自定义 CSS 配置
   */
  customCss?: Partial<UserConfig['css']>;
  /**
   * 代理配置
   */
  proxy?: Record<string, any>;
  /**
   * BTC 插件配置
   */
  btcOptions?: {
    type?: 'mobile';
    svg?: {
      skipNames?: string[];
    };
  };
  /**
   * VueI18n 插件配置
   */
  vueI18nOptions?: {
    include?: string[];
    runtimeOnly?: boolean;
  };
  /**
   * PWA 插件配置
   */
  pwaOptions?: {
    registerType?: 'autoUpdate' | 'prompt';
    includeAssets?: string[];
    workbox?: any;
    manifest?: any;
    [key: string]: any;
  };
}

/**
 * 创建移动应用 Vite 配置
 */
export function createMobileAppViteConfig(options: MobileAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customCss,
    proxy = {},
    btcOptions = {},
    vueI18nOptions,
    pwaOptions = {},
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 使用导入的 createPathHelpers
  const { withRoot, withPackages } = createPathHelpers(appDir);

  const baseUrl = '/';
  const publicDir = getPublicDir(appName, appDir);

  // 扩展别名配置（移动应用特有）
  const baseResolve = createBaseResolve(appDir, appName);
  const mobileAliases = {
    '@modules': resolve(appDir, 'src/modules'),
    '@db': resolve(appDir, 'src/db'),
    '@pwa': resolve(appDir, 'src/pwa'),
  };

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. SSL 插件
    basicSsl(),
    // 2. 自定义插件
    ...customPlugins,
    // 3. Vue 插件
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    // 4. BTC 业务插件
    btc({
      type: 'mobile' as any,
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      ...btcOptions,
    }),
    // 5. Vant 组件自动注册
    Components({
      resolvers: [VantResolver()],
      dts: 'src/components.d.ts',
    }),
    // 6. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, '../../packages/shared-components/src/locales/**'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 7. PWA 插件
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/android-chrome-192x192.png',
        'icons/android-chrome-512x512.png',
        'icons/android-chrome-1024x1024.png',
        'icons/favicon-32x32.png',
        'icons/favicon-16x16.png',
        'icons/apple-touch-icon.png',
      ],
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'
        ],
        navigateFallback: null,
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
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
            urlPattern: /\/icons\/.*\.(png|ico|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icon-cache-v1',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
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
      injectRegister: false,
      strategies: 'generateSW',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/',
        suppressWarnings: true,
      },
      manifest: {
        name: '拜里斯科技',
        short_name: '拜里斯科技',
        lang: 'zh-CN',
        description: '拜里斯科技移动应用',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/android-chrome-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/apple-touch-icon.png',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      disableDevLogs: true,
      ...pwaOptions,
    }),
    // 8. manifest 中间件
    {
      name: 'manifest-middleware',
      configureServer(server) {
        server.middlewares.use('/manifest.webmanifest', (req, res, next) => {
          res.setHeader('Content-Type', 'application/manifest+json');
          next();
        });
      },
    } as Plugin,
    // 9. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
  ];

  // 构建配置
  const buildConfig: UserConfig['build'] = {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vant-vendor': ['vant'],
          'utils-vendor': ['dexie', '@vueuse/core'],
        },
      },
    },
    emptyOutDir: true,
    ...customBuild,
  };

  // 服务器配置
  const serverConfig: UserConfig['server'] = {
    port: appConfig.devPort,
    host: '0.0.0.0',
    strictPort: false,
    https: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Service-Worker-Allowed': '/',
    },
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
        withPackages('.'),
        withPackages('shared-components/src'),
      ],
    },
    proxy: {
      '/api': {
        target: 'https://10.80.9.76:8091',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      ...proxy,
    },
    ...customServer,
  };

  // 预览服务器配置
  const previewConfig: UserConfig['preview'] = {
    port: appConfig.prePort,
    host: '0.0.0.0',
    https: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    ...customPreview,
  };

  // CSS 配置
  const cssConfig: UserConfig['css'] = {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    ...customCss,
  };

  // 返回完整配置
  return {
    base: baseUrl,
    publicDir,
    resolve: {
      ...baseResolve,
      alias: {
        ...baseResolve?.alias,
        ...mobileAliases,
      },
    },
    plugins,
    esbuild: {
      charset: 'utf8',
    },
    server: serverConfig,
    preview: previewConfig,
    css: cssConfig,
    build: buildConfig,
  };
}

