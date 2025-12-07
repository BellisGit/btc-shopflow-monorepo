/**
 * 主应用 Vite 配置工厂
 * 生成主应用的完整 Vite 配置（system-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

// 使用 ESM 导入 VueI18nPlugin（Vite 配置文件支持 ESM）
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
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
  addVersionPlugin,
  publicImagesToAssetsPlugin,
  resourcePreloadPlugin,
} from '../plugins';

export interface MainAppViteConfigOptions {
  /**
   * 应用名称（如 'system-app'）
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
    type?: 'admin';
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
   * publicImagesToAssetsPlugin 配置（主应用特有）
   */
  publicImagesToAssets?: boolean;
  /**
   * 是否启用资源预加载插件
   */
  enableResourcePreload?: boolean;
}

/**
 * 创建主应用 Vite 配置
 */
export function createMainAppViteConfig(options: MainAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy = {},
    btcOptions = {},
    vueI18nOptions,
    publicImagesToAssets = true,
    enableResourcePreload = true,
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 使用导入的 createPathHelpers
  const { withRoot, withPackages } = createPathHelpers(appDir);

  // 判断是否为预览构建
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const baseUrl = '/'; // 主应用固定使用根路径
  const publicDir = getPublicDir(appName, appDir);

  // 获取主应用配置（用于 ensureBaseUrlPlugin）
  const mainAppConfig = getViteAppConfig('system-app');
  const mainAppPort = mainAppConfig.prePort.toString();

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. Public 图片资源处理插件（如果启用）
    ...(publicImagesToAssets && !isPreviewBuild ? [publicImagesToAssetsPlugin(appDir)] : []),
    // 4. 资源预加载插件（如果启用）
    ...(enableResourcePreload !== false ? [resourcePreloadPlugin()] : []),
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 6. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    // 7. 自动导入插件
    createAutoImportConfig(),
    // 8. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 9. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 10. BTC 业务插件
    btc({
      type: 'admin' as any,
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
    // 11. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, 'src/locales/**'),
        resolve(appDir, 'src/{modules,plugins}/**/locales/**'),
        resolve(appDir, '../../packages/shared-components/src/locales/**'),
        resolve(appDir, '../../packages/shared-components/src/plugins/**/locales/**'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts'),
        resolve(appDir, '../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 12. CSS 验证插件
    ensureCssPlugin(),
    // 13. 强制生成新 hash 插件
    forceNewHashPlugin(),
    // 14. 修复动态导入 hash 插件
    fixDynamicImportHashPlugin(),
    // 15. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 16. 确保 base URL 插件（主应用也需要，因为可能有子应用资源引用）
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 17. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 18. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 19. Chunk 验证插件
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
        // 只移除 console.log，保留 console.error 和 console.warn，便于生产环境调试
        drop_console: ['log'],
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
      'Access-Control-Allow-Origin': '*',
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
  // 关键：如果使用了 publicImagesToAssetsPlugin，在构建时应该禁用 publicDir
  // 避免 Vite 自动复制 public 目录的文件到根目录（与插件处理的文件冲突）
  const finalPublicDir = publicImagesToAssets && !isPreviewBuild ? false : publicDir;
  
  return {
    base: baseUrl,
    publicDir: finalPublicDir,
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

