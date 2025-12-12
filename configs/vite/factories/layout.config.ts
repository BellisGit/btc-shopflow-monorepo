/**
 * 布局应用 Vite 配置工厂
 * 生成布局应用的完整 Vite 配置（layout-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import { createPathHelpers } from '../utils/path-helpers';

// 使用 ESM 导入 VueI18nPlugin（Vite 配置文件支持 ESM）
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc } from '@btc/vite-plugin';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { cleanDistPlugin, corsPlugin, addVersionPlugin, forceNewHashPlugin } from '../plugins';

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
  // 使用导入的 createPathHelpers
  const { withRoot } = createPathHelpers(appDir);

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
  const plugins: any[] = [
    // 1. 清理插件（在构建前清理 dist 目录，包括旧的 assets 和 assets/layout 目录）
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 自定义插件
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
    // 5. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 6. BTC 业务插件
    btc({
      type: 'admin' as any,
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      eps: {
        enable: true,
        // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
        // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
        dist: resolve(appDir, 'build', 'eps'),
        // 共享的 EPS 数据源目录（从 system-app 读取）
        // layout-app 优先从 system-app 的 build/eps 读取 EPS 数据，实现真正的共享
        sharedEpsDir: resolve(appDir, '../system-app/build/eps'),
        api: '/api/login/eps/contract',
        ...btcOptions.eps,
      },
      ...btcOptions,
    }),
    // 7. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, '../system-app/src/locales/**'),
        resolve(appDir, '../system-app/src/{modules,plugins}/**/locales/**'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 8. 自动导入插件
    createAutoImportConfig(),
    // 9. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 10. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 11. 确保 script 标签有 type="module"
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match: string, attrs: string = '') => {
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
    // 12. 强制生成新 hash 插件（在文件名中添加时间戳，确保 HTML 和 manifest 中的文件名一致）
    forceNewHashPlugin(),
    // 13. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 14. 构建后清理插件：删除 .vite 目录（Vite 缓存目录不应出现在构建产物中）
    {
      name: 'clean-vite-dir-plugin',
      closeBundle() {
        const viteDir = resolve(appDir, 'dist', '.vite');
        if (existsSync(viteDir)) {
          try {
            rmSync(viteDir, { recursive: true, force: true });
            console.log('[clean-vite-dir-plugin] ✅ 已删除 dist/.vite 目录');
          } catch (error: any) {
            console.warn('[clean-vite-dir-plugin] ⚠️  无法删除 dist/.vite 目录:', error.message);
          }
        }
      },
    } as Plugin,
    // 15. 确保 manifest.json 生成插件（包含所有 chunk，不仅仅是入口文件）
    {
      name: 'ensure-manifest-plugin',
      writeBundle(_options: any, bundle: Record<string, any>) {
        // 从 bundle 中提取所有 chunk 信息
        const manifest: Record<string, { file: string; src?: string; isEntry?: boolean }> = {};
        const allChunks: Array<{ key: string; file: string; isEntry: boolean; priority: number }> = [];

        // 构建 manifest 对象（包含所有 chunk）
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
            // 查找对应的源文件路径
            const sourceFile = (chunk as any).facadeModuleId || (chunk as any).moduleIds?.[0] || fileName;
            let relativeSource = fileName.replace(/^assets\//, ''); // 使用文件名作为默认 key

            if (sourceFile && typeof sourceFile === 'string') {
              // 尝试从源文件路径中提取相对路径
              const srcPath = sourceFile.replace(resolve(appDir, 'src'), 'src').replace(/\\/g, '/');
              if (srcPath.startsWith('src/')) {
                relativeSource = srcPath;
              } else {
                // 如果无法提取相对路径，使用文件名作为 key
                relativeSource = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
              }
            }

            // 确定是否为入口文件
            const isEntry = (chunk as any).isEntry === true ||
                           fileName.includes('index-') ||
                           fileName.includes('main-');

            // 确定加载优先级（用于排序）
            let priority = 999;
            if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
              priority = 1; // vendor 最先加载
            } else if (fileName.includes('echarts-vendor')) {
              priority = 2; // echarts-vendor 其次
            } else if (fileName.includes('menu-registry') ||
                       fileName.includes('eps-service') ||
                       fileName.includes('auth-api')) {
              priority = 3; // 其他依赖
            } else if (isEntry) {
              priority = 4; // 入口文件最后加载
            }

            allChunks.push({
              key: relativeSource,
              file: fileName,
              isEntry,
              priority,
            });
          }
        }

        // 按优先级排序
        allChunks.sort((a, b) => a.priority - b.priority);

        // 构建最终的 manifest 对象
        allChunks.forEach(chunk => {
          manifest[chunk.key] = {
            file: chunk.file,
            src: chunk.key,
            isEntry: chunk.isEntry,
          };
        });

        // 如果没有找到任何 chunk，使用回退逻辑
        if (Object.keys(manifest).length === 0) {
          const firstChunk = Object.entries(bundle).find(([_, chunk]) => chunk.type === 'chunk');
          if (firstChunk) {
            manifest['src/main.ts'] = {
              file: firstChunk[0],
              src: 'src/main.ts',
              isEntry: true,
            };
          }
        }

        // 写入 manifest.json 文件
        const manifestPath = resolve(appDir, 'dist', 'manifest.json');
        try {
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
          console.log(`[ensure-manifest-plugin] ✅ 已生成 manifest.json，包含 ${Object.keys(manifest).length} 个 chunk`);
        } catch (error: any) {
          console.warn('[ensure-manifest-plugin] ⚠️  无法写入 manifest.json:', error.message);
        }
      },
    } as Plugin,
  ];

  // 构建配置
  const buildConfig: UserConfig['build'] = {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    assetsInlineLimit: 0,
    outDir: 'dist',
    assetsDir: 'assets',
    // 关键：启用 manifest 文件生成，用于动态加载入口文件
    manifest: true,
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      onwarn(warning: any, warn: (warning: any) => void) {
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
        manualChunks(id: string) {
          // 关键：先处理 Vue 核心依赖，确保 vendor chunk 在 echarts-vendor 之前加载
          // 这样可以避免 echarts-vendor 在 vendor 之前加载导致的模块初始化顺序问题
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
          // 关键：vue-echarts 依赖于 Vue，所以应该放在 vendor 之后处理
          // 但为了保持分离，我们仍然将其放在 echarts-vendor 中
          // 注意：这要求 vendor 在 echarts-vendor 之前加载（通过 HTML 中的顺序保证）
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender') ||
              id.includes('node_modules/vue-echarts')) {
            return 'echarts-vendor';
          }
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
          if (id.includes('node_modules/monaco-editor')) {
            return 'lib-monaco';
          }
          if (id.includes('node_modules/three')) {
            return 'lib-three';
          }
          return undefined;
        },
        preserveModules: false,
        generatedCode: {
          constBindings: false,
        },
        // 布局应用使用标准的 assets/ 目录，不需要单独的 layout 子目录
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
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

  // 优化依赖配置
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
      '@element-plus/icons-vue',
      '@btc/shared-core',
      '@btc/shared-components',
      '@btc/shared-utils',
      '@btc/subapp-manifests',
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      '@vueuse/core',
      // layout-app 实际安装的依赖
      'vue-i18n',
      'axios',
      'echarts',
      'vue-echarts',
      'mitt',
      'nprogress',
      // 注意：以下依赖不是所有应用都直接安装，它们通过 @btc/shared-components 间接使用
      // Vite 会在运行时自动发现并优化这些依赖，不需要在 include 中显式声明
    ],
    exclude: [],
    force: false,
    entries: [
      resolve(appDir, 'src/main.ts'),
      resolve(appDir, '../../packages/shared-components/src/index.ts'),
    ],
    esbuildOptions: {
      plugins: [],
    },
  };

  // 返回完整配置
  return {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
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
    optimizeDeps: optimizeDepsConfig,
  };
}

