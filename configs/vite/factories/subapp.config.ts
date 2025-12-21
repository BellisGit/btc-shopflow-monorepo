/**
 * 子应用 Vite 配置工厂
 * 生成子应用的完整 Vite 配置
 */

import type { UserConfig } from 'vite';
import { resolve } from 'path';
import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

// 延迟加载 VueI18nPlugin，从应用目录解析
// 使用函数内动态导入，确保从调用者的 node_modules 解析
import { pathToFileURL } from 'node:url';
function getVueI18nPlugin(appDir: string) {
  // 使用 createRequire 从应用目录解析包
  // 通过 file:// URL 创建正确的 require 上下文
  const appDirUrl = pathToFileURL(resolve(appDir, 'package.json')).href;
  const require = createRequire(appDirUrl);
  const plugin = require('@intlify/unplugin-vue-i18n/vite');
  return plugin.default || plugin;
}
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getViteAppConfig, getBaseUrl, getPublicDir } from '../../vite-app-config';
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
  resolveLogoPlugin,
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
  // 使用导入的 createPathHelpers
  const { withRoot } = createPathHelpers(appDir);

  // 判断是否为预览构建
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  // 关键：子应用在构建时禁用 publicDir，避免打包图标等静态资源
  // 图标等静态资源应该由 layout-app 统一管理
  // 开发环境仍然需要 publicDir 来服务静态文件
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir) : false;

  // 获取主应用配置
  const mainAppConfig = getViteAppConfig('system-app');
  const mainAppPort = mainAppConfig.prePort.toString();

  // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
  // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
  const epsOutputDir = resolve(appDir, 'build', 'eps');

  // 共享的 EPS 数据源目录（从 system-app 读取）
  // 子应用优先从 system-app 的 build/eps 读取 EPS 数据，实现真正的共享
  const sharedEpsDir = resolve(appDir, '../../apps/system-app/build/eps');

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir),
    // 4. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
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
        dist: epsOutputDir,
        sharedEpsDir: sharedEpsDir,
        ...btcOptions.eps,
      },
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      ...btcOptions,
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir)({
      include: vueI18nOptions?.include || [
        resolve(appDir, 'src/locales/**'),
        resolve(appDir, 'src/{modules,plugins}/**/locales/**'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 16.5. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 17. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 18. Chunk 验证插件
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
        drop_console: true,
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
        // 确保导出名称格式正确
        preserve_annotations: false,
        // 关键：确保代码格式正确，避免数字字面量被错误处理
        ascii_only: false, // 允许非 ASCII 字符，避免数字被错误编码
        beautify: false, // 不美化代码，保持压缩后的格式
        // 关键：确保对象属性之间有正确的分隔符
        semicolons: true, // 使用分号，确保语句正确分隔
      },
    }, */
    assetsInlineLimit: 10 * 1024,
    outDir: 'dist',
    assetsDir: 'assets',
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
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
      'Access-Control-Allow-Origin': appConfig.mainAppOrigin,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  };

  // 优化依赖配置
  // 关键：预先包含所有子应用可能用到的依赖，避免切换应用时触发重新加载
  // 当切换应用时，如果发现新的依赖没有被预构建，Vite 会触发依赖优化并重新加载页面
  // 通过在 include 中预先包含这些依赖，可以避免这个问题
  //
  // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
  // 虽然这会增加一些存储空间，但可以确保每个应用的缓存状态一致，避免频繁重新构建
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
      '@btc/subapp-manifests',
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
      // 虽然只在部分应用中使用，但添加到 include 中可以避免运行时优化
      // 如果应用未安装这些依赖，Vite 会忽略它们（不会报错）
      'echarts/core',
      'echarts',
      'vue-echarts',
      // 关键：lunr 和 file-saver 在切换应用时可能被首次加载，需要预构建避免触发重新加载
      // lunr 用于全局搜索功能（在 shared-components 中）
      'lunr',
      // file-saver 用于导出功能（在 shared-core 和部分应用中）
      'file-saver',
    ],
    // 排除不应该被优化的依赖
    // 注意：exclude 使用包名或文件路径模式
    exclude: [],
    // 关键：设置为 true，强制重新构建所有依赖，确保所有依赖都被预构建
    // 这会在首次启动时构建所有依赖，之后就不会再触发了
    force: false,
    // 关键：指定需要扫描的入口文件，确保扫描到 @btc/shared-components 内部的依赖
    // 这样即使依赖是通过 workspace 包间接导入的，也能被正确识别和预构建
    // 注意：这会增加启动时的扫描时间，但可以避免运行时触发依赖优化
    entries: [
      // 应用的入口文件
      resolve(appDir, 'src/main.ts'),
      // 关键：显式包含 @btc/shared-components 的入口文件，确保其依赖被扫描
      // 这样 lodash-es, chardet, echarts, lunr 等依赖就能在启动时被识别
      resolve(appDir, '../../packages/shared-components/src/index.ts'),
      // 关键：显式包含 @btc/shared-core 的入口文件，确保其依赖被扫描
      // 这样 file-saver 等依赖就能在启动时被识别
      resolve(appDir, '../../packages/shared-core/src/index.ts'),
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
  const baseResolve = createBaseResolve(appDir, appName);
  // 关键：生产/预览构建时，子应用不再使用本地 virtual:eps（由 layout-app 提供共享 EPS 服务）
  // 这样可以避免子应用入口产生对自身 eps-service-xxx.js 的引用，导致共享不生效或 404。
  const shouldUseSharedEps = (process.env.NODE_ENV === 'production') || isPreviewBuild;
  const sharedEpsStub = resolve(appDir, '../../configs/vite/stubs/virtual-eps-empty.ts');
  const finalResolve = shouldUseSharedEps
    ? {
        ...baseResolve,
        alias: {
          ...(baseResolve?.alias as any),
          'virtual:eps': sharedEpsStub,
        },
      }
    : baseResolve;

  return {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    // 虽然这会增加一些存储空间，但可以确保每个应用的缓存状态一致，避免频繁重新构建
    cacheDir: appCacheDir,
    resolve: finalResolve,
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

