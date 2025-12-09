/**
 * 资源预加载插件
 * 为关键资源（index.js、eps-service.js、CSS）添加 preload/modulepreload 链接
 */

import type { Plugin } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';

export function resourcePreloadPlugin(): Plugin {
  const criticalResources: Array<{ href: string; as?: string; rel: string }> = [];

  return {
    name: 'resource-preload',
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      const getResourceHref = (chunkName: string): string => {
        if (chunkName.startsWith('assets/')) {
          return `/${chunkName}`;
        } else {
          return `/assets/${chunkName}`;
        }
      };

      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      if (indexChunk) {
        criticalResources.push({
          href: getResourceHref(indexChunk),
          rel: 'modulepreload',
        });
      }

      const epsServiceChunk = jsChunks.find(jsChunk => jsChunk.includes('eps-service-'));
      if (epsServiceChunk) {
        criticalResources.push({
          href: getResourceHref(epsServiceChunk),
          rel: 'modulepreload',
        });
      }

      cssChunks.forEach(cssChunk => {
        criticalResources.push({
          href: getResourceHref(cssChunk),
          rel: 'preload',
          as: 'style',
        });
      });
    },
    transformIndexHtml(html) {
      if (criticalResources.length === 0) {
        return html;
      }

      const preloadLinks = criticalResources
        .map(resource => {
          if (resource.rel === 'modulepreload') {
            return `    <link rel="modulepreload" href="${resource.href}" />`;
          } else {
            return `    <link rel="preload" href="${resource.href}" as="${resource.as || 'script'}" />`;
          }
        })
        .join('\n');

      if (html.includes('</head>')) {
        return html.replace('</head>', `${preloadLinks}\n</head>`);
      }

      return html;
    },
  } as Plugin;
}

