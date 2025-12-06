import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';
import { copyLogoPlugin } from '@btc/vite-plugin';

// 插件：将构建产物中的绝对路径资源引用转换为相对路径
const relativeAssetsPlugin = (): Plugin => {
  return {
    name: 'relative-assets',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          chunk.code = chunk.code.replace(/(["'`])\/assets\/([^"'`\s]+)/g, '$1./assets/$2');
        }
      }
    },
  };
};

// 确保 script 标签有 type="module" 并将绝对路径转换为相对路径
const ensureModuleScriptsPlugin = (): Plugin => {
  return {
    name: 'ensure-module-scripts',
    transformIndexHtml(html) {
      let processedHtml = html.replace(/(href|src)=["']\/assets\/([^"']+)["']/gi, '$1="./assets/$2"');
      processedHtml = processedHtml.replace(
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
      return processedHtml;
    },
  };
};

export default defineConfig(
  createSubAppViteConfig({
    appName: 'logistics-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'logistics',
    customPlugins: [
      copyLogoPlugin(),
      relativeAssetsPlugin(),
      ensureModuleScriptsPlugin(),
    ],
    customServer: { proxy: mainProxy },
    proxy: mainProxy,
  })
);
