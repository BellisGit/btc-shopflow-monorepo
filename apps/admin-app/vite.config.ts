import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'node:fs';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';
import { btc } from '@btc/vite-plugin';

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
      '@services': withSrc('src/services'),
      '@components': withSrc('src/components'),
      '@utils': withSrc('src/utils'),
      '@auth': withRoot('auth'),
      '@btc/shared-core': withPackages('shared-core/src'),
      '@btc/shared-components': withPackages('shared-components/src'),
      '@btc/shared-utils': withPackages('shared-utils/src'),
      '@btc/subapp-manifests': withPackages('subapp-manifests/dist/index.js'),
      '@btc-common': withPackages('shared-components/src/common'),
      '@btc-components': withPackages('shared-components/src/components'),
      '@btc-styles': withPackages('shared-components/src/styles'),
      '@btc-locales': withPackages('shared-components/src/locales'),
      '@assets': withPackages('shared-components/src/assets'),
      '@plugins': withPackages('shared-components/src/plugins'),
      '@btc-utils': withPackages('shared-components/src/utils'),
      '@btc-crud': withPackages('shared-components/src/crud'),
      'element-plus/es': 'element-plus/es',
      'element-plus/dist': 'element-plus/dist',
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia'],
  },
  plugins: [
    titleInjectPlugin(),
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    btc({
      type: 'admin',
      proxy,
      eps: {
        enable: true,
        dict: false,
        dist: './build/eps',
      },
      svg: {
        skipNames: ['base', 'icons'],
      },
    }),
    VueI18nPlugin({
      include: [
        fileURLToPath(new URL('./src/{modules,plugins}/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url)),
        fileURLToPath(new URL('./src/plugins/user-setting/locales/**', import.meta.url)),
      ],
      runtimeOnly: true,
    }),
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy,
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      '@vueuse/core',
      'axios',
      '@btc/shared-core',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/') && !id.includes('node_modules')) {
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ['access', 'navigation', 'org'].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              return 'module-others';
            }
            if (id.includes('src/pages')) {
              return 'app-pages';
            }
            if (id.includes('src/components')) {
              return 'app-components';
            }
            if (id.includes('src/micro')) {
              return 'app-micro';
            }
            if (id.includes('src/plugins')) {
              return 'app-plugins';
            }
            if (id.includes('src/store')) {
              return 'app-store';
            }
            if (id.includes('src/services')) {
              return 'app-services';
            }
            if (id.includes('src/utils')) {
              return 'app-utils';
            }
            if (id.includes('src/composables')) {
              return 'app-composables';
            }
            if (id.includes('src/bootstrap')) {
              return 'app-bootstrap';
            }
            if (id.includes('src/config')) {
              return 'app-config';
            }
            if (id.includes('src/router')) {
              return 'app-router';
            }
            if (id.includes('src/i18n')) {
              return 'app-i18n';
            }
            if (id.includes('src/assets')) {
              return 'app-assets';
            }
            if (id.includes('src/types')) {
              return 'app-types';
            }
            return 'app-src';
          }

          if (id.includes('@btc/shared-')) {
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            return 'btc-shared';
          }

          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-vendor';
          }

          if (id.includes('node_modules/element-plus')) {
            if (id.includes('/theme') || id.includes('/utils') || id.includes('/locale') || id.includes('/directives')) {
              return 'element-core';
            }
            if (id.includes('/button') || id.includes('/input') || id.includes('/form') || id.includes('/select') || id.includes('/checkbox') || id.includes('/radio') || id.includes('/switch')) {
              return 'element-basic';
            }
            if (id.includes('/layout') || id.includes('/container') || id.includes('/row') || id.includes('/col') || id.includes('/grid') || id.includes('/divider')) {
              return 'element-layout';
            }
            if (id.includes('/table') || id.includes('/pagination') || id.includes('/tree') || id.includes('/calendar') || id.includes('/tag') || id.includes('/badge') || id.includes('/card')) {
              return 'element-data';
            }
            if (id.includes('/dialog') || id.includes('/drawer') || id.includes('/message') || id.includes('/notification') || id.includes('/popover') || id.includes('/tooltip') || id.includes('/alert') || id.includes('/loading')) {
              return 'element-feedback';
            }
            if (id.includes('/menu') || id.includes('/breadcrumb') || id.includes('/tabs') || id.includes('/steps') || id.includes('/affix') || id.includes('/backtop')) {
              return 'element-navigation';
            }
            if (id.includes('/date-picker') || id.includes('/time-picker') || id.includes('/cascader') || id.includes('/upload') || id.includes('/rate') || id.includes('/slider') || id.includes('/color-picker')) {
              return 'element-form';
            }
            return 'element-others';
          }

          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'element-icons';
          }

          if (id.includes('node_modules/axios')) {
            return 'utils-http';
          }
          if (id.includes('node_modules/@vueuse')) {
            return 'utils-vueuse';
          }
          if (id.includes('node_modules/dayjs') || id.includes('node_modules/moment')) {
            return 'utils-date';
          }
          if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
            return 'utils-lodash';
          }

          if (id.includes('node_modules')) {
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'vue-i18n';
            }
            if (id.includes('xlsx')) {
              return 'file-xlsx';
            }
            if (id.includes('file-saver')) {
              return 'file-saver';
            }
            if (id.includes('qiankun')) {
              return 'qiankun';
            }
            if (id.includes('echarts')) {
              return 'lib-echarts';
            }
            if (id.includes('monaco-editor')) {
              return 'lib-monaco';
            }
            if (id.includes('three')) {
              return 'lib-three';
            }
            if (id.includes('unocss') || id.includes('@unocss')) {
              return 'lib-unocss';
            }
            if (id.includes('vite') && !id.includes('vite-plugin')) {
              return 'lib-vite';
            }
            return 'vendor';
          }

          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
