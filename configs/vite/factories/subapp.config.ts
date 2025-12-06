/**
 * 子应用 Vite 配置工厂
 * 生成子应用的完整 Vite 配置
 */

import type { UserConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { existsSync } from 'node:fs';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getViteAppConfig, getBaseUrl, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { createRollupConfig } from '../build/rollup.config';
import {
  cleanDistPlugin,
  chunkVerifyPlugin,
  optimizeChunksPlugin,
  forceNewHashPlugin,
  fixDynamicImportHashPlugin,
  ensureBaseUrlPlugin,
  corsPlugin,
  ensureCssPlugin,
} from '../plugins';
import type { Plugin } from 'vite';

export interface SubAppViteConfigOptions {
  /**
   * 应用名称（如 'admin-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * Qiankun 应用名称（如 'admin'）
   */
  qiankunName: string;
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
   * 自定义优化依赖配置
   */
  customOptimizeDeps?: Partial<UserConfig['optimizeDeps']>;
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
    type?: 'subapp';
    proxy?: Record<string, any>;
    eps?: {
      enable?: boolean;
      dict?: boolean;
      dist?: string;
    };
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
   * Qiankun 插件配置
   */
  qiankunOptions?: {
    useDevMode?: boolean;
  };
}

/**
 * 创建子应用 Vite 配置
 */
export function createSubAppViteConfig(options: SubAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true },
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 动态导入 path-helpers（避免循环依赖）
  const { createPathHelpers } = require('../utils/path-helpers');
  const { withRoot, withPackages } = createPathHelpers(appDir);

  // 判断是否为预览构建
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  const publicDir = getPublicDir(appName, appDir);

  // 获取主应用配置
  const mainAppConfig = getViteAppConfig('system-app');
  const mainAppPort = mainAppConfig.prePort.toString();

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => require('fs').readFileSync(file, 'utf-8'),
        },
      },
    }),
    // 5. 自动导入插件
    createAutoImportConfig(),
    // 6. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 7. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 8. BTC 业务插件
    btc({
      type: 'subapp' as any,
      proxy,
      eps: {
        enable: true,
        dict: false,
        dist: './build/eps',
        ...btcOptions.eps,
      },
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      ...btcOptions,
    }),
    // 9. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        fileURLToPath(new URL('./src/{modules,plugins}/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/plugins/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url)),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 强制生成新 hash 插件
    forceNewHashPlugin(),
    // 13. 修复动态导入 hash 插件
    fixDynamicImportHashPlugin(),
    // 14. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 17. Chunk 验证插件
    chunkVerifyPlugin(),
  ];

  // 构建配置
  const buildConfig: UserConfig['build'] = {
    target: 'es2020',
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
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },
      format: {
        comments: false,
      },
    },
    assetsInlineLimit: 10 * 1024,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: createRollupConfig(appName.replace('-app', '')),
    chunkSizeWarningLimit: 1000,
    ...customBuild,
  };

  // 服务器配置
  const serverConfig: UserConfig['server'] = {
    port: appConfig.devPort,
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      host: appConfig.devHost,
      port: appConfig.devPort,
      overlay: false,
    },
    proxy,
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
        withPackages('.'),
        withPackages('shared-components/src'),
      ],
      cachedChecks: true,
    },
    ...customServer,
  };

  // 预览服务器配置
  const previewConfig: UserConfig['preview'] = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: '0.0.0.0',
    proxy,
    headers: {
      'Access-Control-Allow-Origin': appConfig.mainAppOrigin,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  };

  // 优化依赖配置
  const optimizeDepsConfig: UserConfig['optimizeDeps'] = {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'dayjs',
      'element-plus',
      '@element-plus/icons-vue',
      '@btc/shared-core',
      '@btc/shared-components',
      '@btc/shared-utils',
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      'single-spa',
    ],
    exclude: [],
    force: false,
    esbuildOptions: {
      plugins: [],
    },
    ...customOptimizeDeps,
  };

  // CSS 配置
  const cssConfig: UserConfig['css'] = {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
        includePaths: [
          withPackages('shared-components/src/styles'),
        ],
      },
    },
    devSourcemap: false,
    ...customCss,
  };

  // 返回完整配置
  return {
    base: baseUrl,
    publicDir,
    resolve: createBaseResolve(appDir, appName),
    plugins,
    esbuild: {
      charset: 'utf8',
    },
    server: serverConfig,
    preview: previewConfig,
    optimizeDeps: optimizeDepsConfig,
    css: cssConfig,
    build: buildConfig,
  };
}

