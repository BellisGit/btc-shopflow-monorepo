/**
 * 版本号插件
 * 为 HTML 文件中的资源引用添加全局统一的构建时间戳版本号
 * 用于浏览器缓存控制，每次构建都会生成新的时间戳
 */

import type { Plugin } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';
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
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName === 'index.html') {
          let htmlContent = (chunk as any).source as string;
          let modified = false;

          // 为 script 标签的 src 属性添加版本号
          const scriptRegex = /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g;
          htmlContent = htmlContent.replace(scriptRegex, (match: string, prefix: string, src: string, suffix: string) => {
            // 跳过已有版本号的资源（避免重复添加）
            if (src.includes('?v=') || src.includes('&v=')) {
              // 如果已有版本号，更新为当前构建时间戳
              const updatedSrc = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updatedSrc !== src) {
                modified = true;
                return `${prefix}${updatedSrc}${suffix}`;
              }
              return match;
            }
            // 只为 /assets/ 路径的资源添加版本号
            if (src.startsWith('/assets/') || src.startsWith('./assets/')) {
              modified = true;
              const separator = src.includes('?') ? '&' : '?';
              return `${prefix}${src}${separator}v=${buildTimestamp}${suffix}`;
            }
            return match;
          });

          // 为 link 标签的 href 属性添加版本号
          const linkRegex = /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g;
          htmlContent = htmlContent.replace(linkRegex, (match, prefix, href, suffix) => {
            // 跳过已有版本号的资源（避免重复添加）
            if (href.includes('?v=') || href.includes('&v=')) {
              // 如果已有版本号，更新为当前构建时间戳
              const updatedHref = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updatedHref !== href) {
                modified = true;
                return `${prefix}${updatedHref}${suffix}`;
              }
              return match;
            }
            // 只为 /assets/ 路径的资源添加版本号
            if (href.startsWith('/assets/') || href.startsWith('./assets/')) {
              modified = true;
              const separator = href.includes('?') ? '&' : '?';
              return `${prefix}${href}${separator}v=${buildTimestamp}${suffix}`;
            }
            return match;
          });

          if (modified) {
            (chunk as any).source = htmlContent;
            console.log(`[add-version] 已为 index.html 中的资源引用添加版本号: v=${buildTimestamp}`);
          }
        }
      }
    },
  };
}

