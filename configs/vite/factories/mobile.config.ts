/**
 * 移动应用 Vite 配置工厂
 * 生成移动应用的完整 Vite 配置（mobile-app）
 */

import type { UserConfig, Plugin, ViteDevServer } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
// @ts-ignore - vite-plugin-pwa 类型定义可能有问题，但运行时可用
// vite-plugin-pwa v0.20.0 使用 CommonJS 导出，需要使用 createRequire
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const VitePWAModule = require('vite-plugin-pwa');
// vite-plugin-pwa 可能导出为 { default: function } 或直接导出函数
const VitePWA = (VitePWAModule.default && typeof VitePWAModule.default === 'function') 
  ? VitePWAModule.default 
  : (typeof VitePWAModule === 'function' ? VitePWAModule : VitePWAModule.VitePWA || VitePWAModule);
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
  const plugins = [
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
    // 4. BTC 业务插件（btc() 返回插件数组）
    ...btc({
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
    // 7. PWA 插件（仅保留 manifest 支持，不需要离线功能）
    // 移除 Service Worker 和离线缓存，确保在所有浏览器上都能正常运行
    VitePWA({
      // 完全禁用 Service Worker 注册（不需要离线功能）
      injectRegister: false,
      registerType: 'manual', // 手动注册，实际上不会注册
      includeAssets: [
        'icons/android-chrome-192x192.png',
        'icons/android-chrome-512x512.png',
        'icons/android-chrome-1024x1024.png',
        'icons/favicon-32x32.png',
        'icons/favicon-16x16.png',
        'icons/apple-touch-icon.png',
      ],
      // 使用 generateSW 策略，但配置为不生成 Service Worker
      // 通过设置空的 globPatterns 和 runtimeCaching，尽可能减少生成的内容
      strategies: 'generateSW',
      workbox: {
        // 不缓存任何文件
        globPatterns: [],
        // 禁用所有缓存功能
        runtimeCaching: [],
        // 禁用导航回退
        navigateFallback: null,
        // 不跳过等待，不声明客户端
        skipWaiting: false,
        clientsClaim: false,
        // 禁用清理过期缓存
        cleanupOutdatedCaches: false,
      },
      // 设置一个自定义的 Service Worker 文件名（但实际上不会生成，因为 injectRegister: false）
      filename: 'sw.js',
      // 不生成 Service Worker 文件（通过配置 workbox 为空实现）
      // 开发环境禁用 Service Worker
      devOptions: {
        enabled: false,
        type: 'module',
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
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: ['any', 'maskable'], // purpose 必须是数组
          },
          {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: ['any', 'maskable'],
          },
          {
            src: '/icons/android-chrome-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: ['any', 'maskable'],
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
        ],
        // 针对不同设备的显示模式
        display_override: ['standalone', 'fullscreen', 'minimal-ui', 'browser'],
        // 注意：iOS 特定配置（apple-mobile-web-app-*）应通过 HTML meta 标签设置，不在 manifest 中
        // 这些配置已经在 index.html 中设置了
      },
      disableDevLogs: true,
      // 确保不包含非标准的 ios 字段
      // 如果 pwaOptions 中有 manifest，需要合并时排除 ios 字段
      ...(pwaOptions ? {
        ...pwaOptions,
        manifest: pwaOptions.manifest ? {
          ...pwaOptions.manifest,
          ios: undefined, // 明确排除 ios 字段
        } : undefined,
      } : {}),
    }),
    // 8. manifest 中间件
    {
      name: 'manifest-middleware',
      configureServer(server: ViteDevServer) {
        server.middlewares.use('/manifest.webmanifest', (_req: any, res: any, next: any) => {
          res.setHeader('Content-Type', 'application/manifest+json');
          next();
        });
      },
    } as Plugin,
    // 8.5. 修复 manifest 文件插件（移除非标准字段，修复 purpose 格式）
    {
      name: 'fix-manifest-plugin',
      closeBundle() {
        // 在构建完成后修复 manifest 文件
        const manifestPath = resolve(appDir, 'dist', 'manifest.webmanifest');
        if (existsSync(manifestPath)) {
          try {
            const manifestContent = readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);
            let modified = false;
            
            // 移除非标准的 ios 字段
            if (manifest.ios) {
              delete manifest.ios;
              modified = true;
            }
            
            // 修复 purpose 字段：将字符串转换为数组
            if (manifest.icons && Array.isArray(manifest.icons)) {
              manifest.icons = manifest.icons.map((icon: any) => {
                if (icon.purpose && typeof icon.purpose === 'string' && icon.purpose.includes(' ')) {
                  icon.purpose = icon.purpose.split(' ');
                  modified = true;
                }
                return icon;
              });
            }
            
            if (modified) {
              const fixedContent = JSON.stringify(manifest, null, 2);
              writeFileSync(manifestPath, fixedContent, 'utf-8');
              console.log('[fix-manifest-plugin] ✅ 已修复 manifest.webmanifest（移除 ios 字段，修复 purpose 格式）');
            }
          } catch (error) {
            console.warn('[fix-manifest-plugin] ⚠️ 修复 manifest 时出错:', error);
          }
        }
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
    cssCodeSplit: false,
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        reduce_vars: false,
        reduce_funcs: false,
        passes: 1,
        collapse_vars: false,
        dead_code: false,
      },
      // 关键：对于 ES 模块，完全禁用 mangle 以避免导出名称被混淆
      // 这可以防止 "does not provide an export named 'g'" 错误
      // 虽然这会增加一些文件大小，但可以确保动态导入正常工作
      mangle: false,
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 关键：确保导出的名称不会被混淆
        generatedCode: {
          constBindings: false,
        },
        manualChunks: (id: string) => {
          // 强制分离 Vue 相关依赖
          if (id.includes('node_modules/vue/') || 
              id.includes('node_modules/vue-router/') || 
              id.includes('node_modules/pinia/')) {
            return 'vue-vendor';
          }
          // 强制分离 Vant 相关依赖
          if (id.includes('node_modules/vant/')) {
            return 'vant-vendor';
          }
          // 强制分离工具库依赖
          if (id.includes('node_modules/dexie/') || 
              id.includes('node_modules/@vueuse/')) {
            return 'utils-vendor';
          }
          // 其他 node_modules 依赖
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
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
    https: {},
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
    https: {},
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

