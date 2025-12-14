/**
 * 版本号插件
 * 为 HTML 文件中的资源引用添加全局统一的构建时间戳版本号
 * 用于浏览器缓存控制，每次构建都会生成新的时间戳
 */

import type { Plugin } from 'vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取或生成全局构建时间戳版本号
 * 优先从环境变量读取，如果没有则从构建时间戳文件读取，都没有则生成新的
 */
function getBuildTimestamp(): string {
  // 1. 优先从环境变量读取（由构建脚本设置）
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }

  // 2. 从构建时间戳文件读取（如果存在）
  const timestampFile = resolve(__dirname, '../../../.build-timestamp');
  if (existsSync(timestampFile)) {
    try {
      const timestamp = readFileSync(timestampFile, 'utf-8').trim();
      if (timestamp) {
        return timestamp;
      }
    } catch (error) {
      // 忽略读取错误
    }
  }

  // 3. 生成新的时间戳并保存到文件（确保所有应用使用同一个）
  // 使用36进制编码，生成更短的版本号（包含字母和数字，如 l3k2j1h）
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync(timestampFile, timestamp, 'utf-8');
  } catch (error) {
    // 忽略写入错误
  }
  return timestamp;
}

/**
 * 为 HTML 资源引用添加版本号插件
 */
export function addVersionPlugin(): Plugin {
  const buildTimestamp = getBuildTimestamp();

  return {
    // @ts-ignore - Vite Plugin 类型定义可能不完整，name 属性是标准属性
    name: 'add-version',
    apply: 'build',
    buildStart() {
      console.log(`[add-version] 构建时间戳版本号: ${buildTimestamp}`);
    },
    // 关键：使用 transformIndexHtml（Vite 内部是在后置阶段生成/写入 index.html，generateBundle 很容易拿不到最终 HTML）
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let newHtml = html;
        let modified = false;

        // 1) 为 <script src> 添加/更新 v
        newHtml = newHtml.replace(
          /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, src: string, suffix: string) => {
            if (src.includes('?v=') || src.includes('&v=')) {
              const updated = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== src) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (src.startsWith('/assets/') || src.startsWith('./assets/')) {
              modified = true;
              const sep = src.includes('?') ? '&' : '?';
              return `${prefix}${src}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          },
        );

        // 2) 为 <link href> 添加/更新 v
        newHtml = newHtml.replace(
          /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, href: string, suffix: string) => {
            if (href.includes('?v=') || href.includes('&v=')) {
              const updated = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== href) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (href.startsWith('/assets/') || href.startsWith('./assets/')) {
              modified = true;
              const sep = href.includes('?') ? '&' : '?';
              return `${prefix}${href}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          },
        );

        // 3) 关键：修复 qiankun 注入的内联 import('/assets/index-xxx.js')，避免被宿主域名解析
        // 同时追加 v，避免缓存旧入口导致持续请求旧 chunk
        // 关键：在 qiankun sandbox 中更可靠的写法是直接读全局变量 __INJECTED_PUBLIC_PATH_BY_QIANKUN__
        // 而不是 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__（window 可能被 proxy 重写/不包含 location）。
        const originExpr =
          `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)` +
          `?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin` +
          `:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m: string, _q: string, absPath: string) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}' + '?v=${buildTimestamp}'))`;
          },
        );

        if (modified) {
          console.log(`[add-version] 已为 index.html 中的资源引用添加版本号: v=${buildTimestamp}`);
          return newHtml;
        }
        return html;
      },
    },
  };
}

