/**
 * 布局应用 Vite 配置工厂
 * 生成布局应用的完整 Vite 配置（layout-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { existsSync } from 'node:fs';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc } from '@btc/vite-plugin';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { corsPlugin } from '../plugins';

export interface LayoutAppViteConfigOptions {
  /**
   * 应用名称（如 'layout-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * Qiankun 应用名称（如 'layout'）
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
   * 自定义 CSS 配置
   */
  customCss?: Partial<UserConfig['css']>;
  /**
   * BTC 插件配置
   */
  btcOptions?: {
    type?: 'admin';
    svg?: {
      skipNames?: string[];
    };
    eps?: {
      enable?: boolean;
      dist?: string;
      api?: string;
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
 * 创建布局应用 Vite 配置
 */
export function createLayoutAppViteConfig(options: LayoutAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customCss,
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true },
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  const { createPathHelpers } = require('../utils/path-helpers');
  const { withRoot, withPackages } = createPathHelpers(appDir);

  // 布局应用固定使用根路径
  const baseUrl = '/';
  const publicDir = getPublicDir(appName, appDir);

  // 扩展别名配置（布局应用特有）
  const baseResolve = createBaseResolve(appDir, appName);
  const layoutAliases = {
    '@layout': resolve(appDir, 'src'),
    '@system': resolve(appDir, '../system-app/src'),
    '@': resolve(appDir, '../system-app/src'),
    '@services': resolve(appDir, '../system-app/src/services'),
  };

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. CORS 插件
    corsPlugin(),
    // 2. 自定义插件
    ...customPlugins,
    // 3. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => require('fs').readFileSync(file, 'utf-8'),
        },
      },
    }),
    // 4. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 5. BTC 业务插件
    btc({
      type: 'admin' as any,
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
        ...btcOptions.eps,
      },
      ...btcOptions,
    }),
    // 6. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, '../system-app/src/locales/**'),
        resolve(appDir, '../system-app/src/{modules,plugins}/**/locales/**'),
        resolve(appDir, '../../packages/shared-components/src/locales/**'),
        resolve(appDir, '../../packages/shared-components/src/plugins/**/locales/**'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 7. 自动导入插件
    createAutoImportConfig(),
    // 8. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 9. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 10. 确保 script 标签有 type="module"
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            if (!match.includes('src=')) {
              return match;
            }
            if (attrs && attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      },
    } as Plugin,
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
    assetsInlineLimit: 0,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
          return;
        }
        warn(warning);
      },
      output: {
        format: 'esm',
        inlineDynamicImports: false,
        manualChunks(id) {
          if (id.includes('virtual:eps') ||
              id.includes('\\0virtual:eps') ||
              id.includes('services/eps') ||
              id.includes('services\\eps')) {
            return 'eps-service';
          }
          if (id.includes('packages/subapp-manifests') ||
              id.includes('packages/shared-components/src/store/menuRegistry') ||
              id.includes('configs/layout-bridge') ||
              id.includes('@btc/subapp-manifests') ||
              id.includes('@configs/layout-bridge')) {
            return 'menu-registry';
          }
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender') ||
              id.includes('node_modules/vue-echarts')) {
            return 'echarts-vendor';
          }
          if (id.includes('node_modules/monaco-editor')) {
            return 'lib-monaco';
          }
          if (id.includes('node_modules/three')) {
            return 'lib-three';
          }
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/element-plus') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vueuse') ||
              id.includes('node_modules/@element-plus') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/lodash') ||
              id.includes('node_modules/@vue') ||
              id.includes('packages/shared-components') ||
              id.includes('packages/shared-core') ||
              id.includes('packages/shared-utils')) {
            return 'vendor';
          }
          return undefined;
        },
        preserveModules: false,
        generatedCode: {
          constBindings: false,
        },
        // 布局应用使用 assets/layout/ 前缀
        chunkFileNames: 'assets/layout/[name]-[hash].js',
        entryFileNames: 'assets/layout/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/layout/[name]-[hash].css';
          }
          return 'assets/layout/[name]-[hash].[ext]';
        },
      },
    },
    ...customBuild,
  };

  // 服务器配置
  const serverConfig: UserConfig['server'] = {
    port: appConfig.devPort,
    host: appConfig.devHost,
    strictPort: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    fs: {
      allow: [
        resolve(appDir, '..'),
        resolve(appDir, '../system-app'),
        resolve(appDir, '../../'),
      ],
    },
    ...customServer,
  };

  // 预览服务器配置
  const previewConfig: UserConfig['preview'] = {
    port: appConfig.prePort,
    host: appConfig.preHost,
    strictPort: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  };

  // CSS 配置
  const cssConfig: UserConfig['css'] = {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
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
        ...layoutAliases,
      },
    },
    plugins,
    server: serverConfig,
    preview: previewConfig,
    css: cssConfig,
    build: buildConfig,
  };
}

