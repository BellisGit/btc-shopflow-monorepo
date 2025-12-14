/**
 * 主应用 Vite 配置工厂
 * 生成主应用的完整 Vite 配置（system-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
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
  ensureBaseUrlPlugin,
  corsPlugin,
  ensureCssPlugin,
  addVersionPlugin,
  replaceIconsWithCdnPlugin,
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

  // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
  // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
  const epsOutputDir = resolve(appDir, 'build', 'eps');

  // 构建插件列表
  const plugins: (Plugin | Plugin[])[] = [
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
        dist: epsOutputDir,
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
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 12. CSS 验证插件
    ensureCssPlugin(),
    // 13. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 16. 确保 base URL 插件（主应用也需要，因为可能有子应用资源引用）
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 17. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 17.5. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
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
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    // terserOptions 已禁用，保留配置以备将来使用
    /* terserOptions: {
      compress: {
        // 只移除 console.log，保留 console.error 和 console.warn，便于生产环境调试
        drop_console: ['log'],
        drop_debugger: true,
        reduce_vars: false,
        reduce_funcs: false,
        passes: 1,
        collapse_vars: false,
        dead_code: false,
        // 关键：禁用可能导致对象属性分隔符丢失的优化
        sequences: false, // 禁用序列优化，避免语句被错误合并
        join_vars: false, // 禁用变量连接，避免变量声明被错误合并
        // 关键：禁用不安全的优化，避免数字字面量和字符串被错误处理
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
        // 关键：禁用可能导致对象属性分隔符丢失的优化
        keep_infinity: true, // 保留 Infinity，避免数字被错误处理
        // 关键：禁用对象属性优化，确保对象属性之间有正确的逗号分隔符
        properties: false, // 禁用对象属性优化，防止属性被错误合并
        // 关键：禁用表达式优化，确保字符串和数字不会被错误连接
        evaluate: false, // 禁用表达式求值，防止字符串和数字被错误处理
        // 关键：禁用纯函数优化，防止对象字面量被错误处理
        pure_funcs: [], // 不将任何函数视为纯函数，防止对象字面量被错误优化
        // 关键：禁用副作用优化，确保对象字面量格式正确
        side_effects: false, // 不禁用副作用，确保对象字面量格式正确
      },
      // 关键：保留函数名和类名，但禁用变量名混淆
      // 这样可以防止导出名称被混淆，同时允许基本的压缩优化
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },

      format: {
        comments: false,
        // 关键：确保代码格式正确，避免数字字面量被错误处理
        preserve_annotations: false,
        // 确保数字字面量格式正确
        ascii_only: false, // 允许非 ASCII 字符，避免数字被错误编码
        beautify: false, // 不美化代码，保持压缩后的格式
        // 关键：确保对象属性之间有正确的分隔符
        semicolons: true, // 使用分号，确保语句正确分隔
        // 关键：确保对象字面量格式正确
        wrap_iife: false, // 不包装立即执行函数
        wrap_func_args: false, // 不包装函数参数
      },
    }, */
    assetsInlineLimit: 10 * 1024,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: false,
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
  // 关键：预先包含所有子应用可能用到的依赖，避免切换应用时触发重新加载
  // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
  const appCacheDir = resolve(appDir, 'node_modules/.vite');
  
  const optimizeDepsConfig: UserConfig['optimizeDeps'] = {
    include: [
      // 核心依赖：所有应用都安装的依赖
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'element-plus/es',
      'element-plus/es/locale/lang/zh-cn',
      'element-plus/es/locale/lang/en',
      'element-plus/es/components/cascader/style/css',
      '@element-plus/icons-vue',
      '@btc/shared-core',
      '@btc/shared-components',
      '@btc/shared-utils',
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      '@vueuse/core',
      // 关键：这些依赖现在已经在所有应用的 package.json 中声明
      // 通过 @btc/shared-components 间接使用，但需要在应用中显式声明以便 Vite 正确解析
      'lodash-es',
      'chardet',
      'xlsx',
      'vue-i18n',
      // 关键：echarts 相关依赖需要被预构建
      // system-app 和部分子应用使用了 echarts
      'echarts/core',
      'echarts',
      'vue-echarts',
    ],
    exclude: [],
    force: false,
    // 关键：指定需要扫描的入口文件，确保扫描到 @btc/shared-components 内部的依赖
    entries: [
      resolve(appDir, 'src/main.ts'),
      resolve(appDir, '../../packages/shared-components/src/index.ts'),
    ],
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
      },
    },
    devSourcemap: false,
    ...customCss,
  };

  // 返回完整配置
  // 注意：publicDir 的配置需要在 vite.config.ts 中根据 command 动态设置
  // 这里始终启用 publicDir，开发环境直接使用，构建环境会在 vite.config.ts 中被覆盖
  const finalPublicDir = publicDir;

  return {
    base: baseUrl,
    publicDir: finalPublicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
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

