/**
 * Hash 相关插件
 * 包括强制生成新 hash 和修复动态导入 hash
 */

import type { Plugin } from 'vite';
import type { ChunkInfo, OutputOptions, OutputBundle } from 'rollup';
import { join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取或生成全局构建时间戳版本号（与 addVersionPlugin 保持一致）
 * 优先从环境变量读取，如果没有则从构建时间戳文件读取，都没有则生成新的
 */
function getBuildTimestamp(): string {
  // 1. 优先从环境变量读取（由构建脚本设置）
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }

  // 2. 从构建时间戳文件读取（如果存在）
  const timestampFile = join(__dirname, '../../../.build-timestamp');
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
 * 强制生成新 hash 插件
 */
export function forceNewHashPlugin(): Plugin {
  const buildId = getBuildTimestamp();
  const cssFileNameMap = new Map<string, string>();
  const jsFileNameMap = new Map<string, string>();

  return {
    name: 'force-new-hash',
    enforce: 'post',
    buildStart() {
      console.log(`[force-new-hash] 构建 ID: ${buildId}`);
      cssFileNameMap.clear();
      jsFileNameMap.clear();
    },
    renderChunk(code: string, chunk: ChunkInfo) {
      const isThirdPartyLib = chunk.fileName?.includes('lib-echarts') ||
                               chunk.fileName?.includes('element-plus') ||
                               chunk.fileName?.includes('vue-core') ||
                               chunk.fileName?.includes('vue-router') ||
                               chunk.fileName?.includes('vendor');

      if (isThirdPartyLib) {
        return null;
      }

      return `/* build-id: ${buildId} */\n${code}`;
    },
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const fileNameMap = new Map<string, string>();

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          let baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
          if (baseName.endsWith('-')) {
            console.warn(`[force-new-hash] ⚠️  检测到 Rollup 生成的异常文件名（末尾有连字符）: ${fileName}`);
            baseName = baseName.replace(/-+$/, '');
          }

          const newFileName = `assets/${baseName}-${buildId}.js`;
          fileNameMap.set(fileName, newFileName);
          const oldRef = fileName.replace(/^assets\//, '');
          const newRef = newFileName.replace(/^assets\//, '');
          jsFileNameMap.set(oldRef, newRef);

          (chunk as any).fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        } else if (chunk.type === 'asset' && fileName.endsWith('.css') && fileName.startsWith('assets/')) {
          let baseName = fileName.replace(/^assets\//, '').replace(/\.css$/, '');
          baseName = baseName.replace(/-+$/, '');
          const newFileName = `assets/${baseName}-${buildId}.css`;

          fileNameMap.set(fileName, newFileName);
          const oldCssName = fileName.replace(/^assets\//, '');
          const newCssName = newFileName.replace(/^assets\//, '');
          cssFileNameMap.set(oldCssName, newCssName);
          
          console.log(`[force-new-hash] CSS 文件映射: ${oldCssName} -> ${newCssName}`);

          (chunk as any).fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }

      // 更新所有 chunk 中的引用
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'chunk' && chunkAny.code) {
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib && (fileName.includes('vue-router') || fileName.includes('vue-core'))) {
            continue;
          }

          let newCode = chunkAny.code;
          let modified = false;

          for (const [oldFileName, newFileName] of fileNameMap.entries()) {
            const oldRef = oldFileName.replace(/^assets\//, '');
            const newRef = newFileName.replace(/^assets\//, '');
            const oldRefWithoutTrailingDash = oldRef.replace(/-+$/, '');

            // 未使用的转义变量，保留以备将来使用
            // const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // const escapedOldRefWithoutTrailingDash = oldRefWithoutTrailingDash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const replacePatterns = [
              [`/assets/${oldRef}`, `/assets/${newRef}`],
              [`./${oldRef}`, `./${newRef}`],
              [`"${oldRef}"`, `"${newRef}"`],
              [`'${oldRef}'`, `'${newRef}'`],
              [`\`${oldRef}\``, `\`${newRef}\``],
              [`import('/assets/${oldRef}')`, `import('/assets/${newRef}?v=${buildId}')`],
              [`import("/assets/${oldRef}")`, `import("/assets/${newRef}?v=${buildId}")`],
              [`import(\`/assets/${oldRef}\`)`, `import(\`/assets/${newRef}?v=${buildId}\`)`],
            ];

            if (oldRef !== oldRefWithoutTrailingDash) {
              replacePatterns.push(
                [`/assets/${oldRefWithoutTrailingDash}`, `/assets/${newRef}`],
                [`./${oldRefWithoutTrailingDash}`, `./${newRef}`],
                [`"${oldRefWithoutTrailingDash}"`, `"${newRef}"`],
                [`'${oldRefWithoutTrailingDash}'`, `'${newRef}'`],
                [`\`${oldRefWithoutTrailingDash}\``, `\`${newRef}\``],
                [`import('/assets/${oldRefWithoutTrailingDash}')`, `import('/assets/${newRef}?v=${buildId}')`],
                [`import("/assets/${oldRefWithoutTrailingDash}")`, `import("/assets/${newRef}?v=${buildId}")`],
                [`import(\`/assets/${oldRefWithoutTrailingDash}\`)`, `import(\`/assets/${newRef}?v=${buildId}\`)`],
              );
            }

            replacePatterns.forEach(([oldPattern, newPattern]) => {
              const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(escapedOldPattern, 'g');
              if (regex.test(newCode)) {
                newCode = newCode.replace(regex, newPattern);
                modified = true;
              }
            });

            // 为所有 import() 添加版本号
            const allImportPattern = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
            newCode = newCode.replace(allImportPattern, (_match: string, quote: string, path: string, _ext: string, query: string) => {
              if (query && query.includes('v=')) {
                return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
              } else {
                return `import(${quote}${path}?v=${buildId}${quote})`;
              }
            });
          }

          // 更新 __vite__mapDeps 中的 CSS 引用
          if (newCode.includes('__vite__mapDeps') && cssFileNameMap.size > 0) {
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const cssPattern = new RegExp(`(["'])assets/${escapedOldCssName}\\1`, 'g');
              if (cssPattern.test(newCode)) {
                newCode = newCode.replace(cssPattern, `$1assets/${newCssName}$1`);
                modified = true;
              }
            }
          }

          if (modified) {
            chunkAny.code = newCode;
          }
        }
      }

      // 关键：在 generateBundle 阶段也更新 HTML 中的 CSS 引用
      // 这样可以在其他插件（如 addVersionPlugin）处理之前就更新文件名
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'asset' && fileName === 'index.html') {
          let htmlContent = chunkAny.source as string;
          let htmlModified = false;

          if (cssFileNameMap.size > 0) {
            console.log(`[force-new-hash] 开始更新 HTML 中的 CSS 引用，映射表大小: ${cssFileNameMap.size}`);
            // 先打印 HTML 中所有 CSS 引用，用于调试
            const cssRefs = htmlContent.match(/<link[^>]*\s+href=["']([^"']+\.css[^"']*)["'][^>]*>/g);
            if (cssRefs) {
              console.log(`[force-new-hash] HTML 中的 CSS 引用:`, cssRefs);
            }
            
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // 更新 <link href> 标签中的 CSS 文件路径（包括查询参数）
              // 关键：同时匹配 /assets/ 和 ./assets/ 开头的路径
              const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedOldCssName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
              const originalHtml = htmlContent;
              htmlContent = htmlContent.replace(linkPattern, (_match, prefix, path, query, suffix) => {
                // 保持原有的路径前缀（/assets/ 或 ./assets/）
                const pathPrefix = path.startsWith('./') ? './' : '/';
                const newPath = `${pathPrefix}assets/${newCssName}`;
                // 如果已有查询参数，更新版本号；否则添加版本号
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] 匹配到 CSS 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml) {
                htmlModified = true;
                console.log(`[force-new-hash] ✅ 已在 generateBundle 阶段更新 HTML 中的 CSS 引用: ${oldCssName} -> ${newCssName}`);
              } else {
                console.log(`[force-new-hash] ⚠️  未找到匹配的 CSS 引用: ${oldCssName}`);
              }
            }
          }

          if (jsFileNameMap.size > 0) {
            console.log(`[force-new-hash] 开始更新 HTML 中的 JS 引用，映射表大小: ${jsFileNameMap.size}`);
            // 先打印 HTML 中所有 import() 语句，用于调试
            const importRefs = htmlContent.match(/import\s*\(['"]([^'"]+\.js[^'"]*)['"]\)/g);
            if (importRefs) {
              console.log(`[force-new-hash] HTML 中的 import() 引用:`, importRefs);
            }
            
            for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
              const escapedOldJsName = oldJsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              // 1. 更新 <script src> 标签中的 JS 文件路径（包括查询参数）
              const scriptPattern = new RegExp(`(<script[^>]*\\s+src=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
              const originalHtml1 = htmlContent;
              htmlContent = htmlContent.replace(scriptPattern, (_match, prefix, path, query, suffix) => {
                // 保持原有的路径前缀（/assets/ 或 ./assets/）
                const pathPrefix = path.startsWith('./') ? './' : '/';
                const newPath = `${pathPrefix}assets/${newJsName}`;
                // 如果已有查询参数，更新版本号；否则添加版本号
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/g, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] 匹配到 <script src> 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml1) {
                htmlModified = true;
                console.log(`[force-new-hash] ✅ 已更新 <script src> 引用: ${oldJsName} -> ${newJsName}`);
              }
              
              // 2. 更新 import() 动态导入语句中的 JS 文件路径（包括查询参数）
              // 匹配格式：import('./assets/xxx.js') 或 import('/assets/xxx.js')
              const importPattern = new RegExp(`(import\\s*\\(\\s*['"])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(['"]\\s*\\))`, 'g');
              const originalHtml2 = htmlContent;
              htmlContent = htmlContent.replace(importPattern, (_match, prefix, path, query, suffix) => {
                // 保持原有的路径前缀（/assets/ 或 ./assets/）
                const pathPrefix = path.startsWith('./') ? './' : '/';
                const newPath = `${pathPrefix}assets/${newJsName}`;
                // 如果已有查询参数，更新版本号；否则添加版本号
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/g, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] 匹配到 import() 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml2) {
                htmlModified = true;
                console.log(`[force-new-hash] ✅ 已更新 import() 引用: ${oldJsName} -> ${newJsName}`);
              }
              
              // 3. 更新 <link rel="modulepreload"> 标签中的 JS 文件路径（包括查询参数）
              // 匹配格式：<link rel="modulepreload" href="/assets/xxx.js"> 或 <link rel="modulepreload" href="./assets/xxx.js">
              const modulepreloadPattern = new RegExp(`(<link[^>]*\\s+rel=["']modulepreload["'][^>]*\\s+href=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
              const originalHtml3 = htmlContent;
              htmlContent = htmlContent.replace(modulepreloadPattern, (_match, prefix, path, query, suffix) => {
                // 保持原有的路径前缀（/assets/ 或 ./assets/）
                const pathPrefix = path.startsWith('./') ? './' : '/';
                const newPath = `${pathPrefix}assets/${newJsName}`;
                // 如果已有查询参数，更新版本号；否则添加版本号
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] 匹配到 <link rel="modulepreload"> 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml3) {
                htmlModified = true;
                console.log(`[force-new-hash] ✅ 已更新 <link rel="modulepreload"> 引用: ${oldJsName} -> ${newJsName}`);
              }
            }
            
            if (htmlModified) {
              console.log(`[force-new-hash] ✅ 已在 generateBundle 阶段更新 HTML 中的 JS 引用`);
            }
          }

          if (htmlModified) {
            chunk.source = htmlContent;
          }
        }
      }

      console.log(`[force-new-hash] ✅ 已为 ${fileNameMap.size} 个文件添加构建 ID: ${buildId}`);
    },
    writeBundle(options: OutputOptions) {
      const outputDir = options.dir || join(process.cwd(), 'dist');
      const indexHtmlPath = join(outputDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        if (cssFileNameMap.size > 0) {
          for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
            const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 更新 <link href> 标签中的 CSS 文件路径（包括查询参数）
            // 关键：同时匹配 /assets/ 和 ./assets/ 开头的路径
            // 注意：oldCssName 是文件名（不含路径），如 "style-Cot0_1aZ.css"
            const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedOldCssName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            const originalHtml = html;
            html = html.replace(linkPattern, (_match, prefix, path, query, suffix) => {
              // 保持原有的路径前缀（/assets/ 或 ./assets/）
              const pathPrefix = path.startsWith('./') ? './' : '/';
              const newPath = `${pathPrefix}assets/${newCssName}`;
              const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml) {
              modified = true;
              console.log(`[force-new-hash] 已更新 HTML 中的 CSS 引用: ${oldCssName} -> ${newCssName}`);
            }
          }
          
          // 关键：如果 cssFileNameMap 有数据但 HTML 没有被修改，说明匹配失败
          // 可能是 HTML 中的路径格式与预期不符，尝试更宽松的匹配
          if (!modified && cssFileNameMap.size > 0) {
            // 尝试匹配任何包含旧文件名的路径（更宽松的匹配）
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              // 提取文件名（不含扩展名和 hash），用于模糊匹配
              const baseNameMatch = oldCssName.match(/^(.+?)-([A-Za-z0-9]{4,})\.css$/);
              if (baseNameMatch) {
                const [, baseName] = baseNameMatch;
                const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // 匹配任何包含 baseName 的 CSS 文件路径
                const loosePattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedBaseName}-[^"'\\s]+\\.css)(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
                const originalHtml = html;
                let matchedPath = '';
                html = html.replace(loosePattern, (_match, prefix, path, query, suffix) => {
                  // 保持原有的路径前缀（/assets/ 或 ./assets/）
                  const pathPrefix = path.startsWith('./') ? './' : '/';
                  const newPath = `${pathPrefix}assets/${newCssName}`;
                  const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                  matchedPath = path; // 保存匹配的路径用于日志
                  return `${prefix}${newPath}${newQuery}${suffix}`;
                });
                if (html !== originalHtml) {
                  modified = true;
                  console.log(`[force-new-hash] 已通过模糊匹配更新 HTML 中的 CSS 引用: ${matchedPath} -> ${newCssName}`);
                  break; // 只更新第一个匹配的，避免重复更新
                }
              }
            }
          }
        }

        if (jsFileNameMap.size > 0) {
          for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
            const escapedOldJsName = oldJsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // 1. 更新 import() 动态导入中的路径（同时匹配 /assets/ 和 ./assets/）
            const importPattern = new RegExp(`(import\\s*\\(\\s*['"])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(['"]\\s*\\))`, 'g');
            const originalHtml1 = html;
            html = html.replace(importPattern, (_match, prefix, path, query, suffix) => {
              // 保持原有的路径前缀（/assets/ 或 ./assets/）
              const pathPrefix = path.startsWith('./') ? './' : '/';
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              console.log(`[force-new-hash] writeBundle 阶段匹配到 import() 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml1) {
              modified = true;
              console.log(`[force-new-hash] ✅ writeBundle 阶段已更新 import() 引用: ${oldJsName} -> ${newJsName}`);
            }
            
            // 2. 更新 <script src> 标签中的路径（同时匹配 /assets/ 和 ./assets/）
            const scriptPattern = new RegExp(`(<script[^>]*\\s+src=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            const originalHtml2 = html;
            html = html.replace(scriptPattern, (_match, prefix, path, query, suffix) => {
              // 保持原有的路径前缀（/assets/ 或 ./assets/）
              const pathPrefix = path.startsWith('./') ? './' : '/';
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml2) {
              modified = true;
              console.log(`[force-new-hash] ✅ writeBundle 阶段已更新 <script src> 引用: ${oldJsName} -> ${newJsName}`);
            }
            
            // 3. 更新 <link rel="modulepreload"> 标签中的路径（同时匹配 /assets/ 和 ./assets/）
            const modulepreloadPattern = new RegExp(`(<link[^>]*\\s+rel=["']modulepreload["'][^>]*\\s+href=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            const originalHtml3 = html;
            html = html.replace(modulepreloadPattern, (_match, prefix, path, query, suffix) => {
              // 保持原有的路径前缀（/assets/ 或 ./assets/）
              const pathPrefix = path.startsWith('./') ? './' : '/';
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              console.log(`[force-new-hash] writeBundle 阶段匹配到 <link rel="modulepreload"> 引用: ${path}${query || ''} -> ${newPath}${newQuery}`);
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml3) {
              modified = true;
              console.log(`[force-new-hash] ✅ writeBundle 阶段已更新 <link rel="modulepreload"> 引用: ${oldJsName} -> ${newJsName}`);
            }
          }
        }

        // 备用方案：匹配所有 import() 语句（包括 /assets/ 和 ./assets/），但只更新版本号，不更新文件名
        // 注意：文件名更新应该已经在 generateBundle 阶段完成，这里只是确保版本号正确
        const importPatternFallback = /import\s*\(\s*(["'])(\.?\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
        html = html.replace(importPatternFallback, (_match, quote, path, _ext, query) => {
          if (query) {
            return `import(${quote}${path}${query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
          } else {
            return `import(${quote}${path}?v=${buildId}${quote})`;
          }
        });

        if (modified) {
          writeFileSync(indexHtmlPath, html, 'utf-8');
        }
      }

      // 更新所有 JS 文件中的引用
      const assetsDir = join(outputDir, 'assets');
      if (existsSync(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
        let totalFixed = 0;

        const allFileNameMap = new Map<string, string>();
        for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
          allFileNameMap.set(oldJsName, newJsName);
        }
        for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
          allFileNameMap.set(oldCssName, newCssName);
        }

        for (const jsFile of jsFiles) {
          const isThirdPartyLib = jsFile.includes('lib-echarts') ||
                                   jsFile.includes('element-plus') ||
                                   jsFile.includes('vue-core') ||
                                   jsFile.includes('vue-router') ||
                                   jsFile.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

          const jsFilePath = join(assetsDir, jsFile);
          let content = readFileSync(jsFilePath, 'utf-8');
          let modified = false;

          for (const [oldFileName, newFileName] of allFileNameMap.entries()) {
            const escapedOldFileName = oldFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const patterns = [
              new RegExp(`import\\s*\\(\\s*(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1\\s*\\)`, 'g'),
              new RegExp(`(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, 'g'),
              new RegExp(`(["'\`])\\./${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, 'g'),
              new RegExp(`(["'\`])assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, 'g'),
            ];

            patterns.forEach(pattern => {
              const originalContent = content;
              if (pattern.source.includes('import\\s*\\(')) {
                content = content.replace(pattern, (_match, quote, query) => {
                  const newPath = `/assets/${newFileName}`;
                  const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                  return `import(${quote}${newPath}${newQuery}${quote})`;
                });
                if (content !== originalContent) {
                  modified = true;
                }
              } else {
                if (newFileName.endsWith('.js') || newFileName.endsWith('.mjs')) {
                  content = content.replace(pattern, (match, quote, query) => {
                    let newPath: string;
                    if (pattern.source.includes('/assets/')) {
                      newPath = `/assets/${newFileName}`;
                    } else if (pattern.source.includes('./')) {
                      newPath = `./${newFileName}`;
                    } else if (pattern.source.includes('assets/')) {
                      newPath = `assets/${newFileName}`;
                    } else {
                      return match;
                    }
                    const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                    return `${quote}${newPath}${newQuery}${quote}`;
                  });
                  if (content !== originalContent) {
                    modified = true;
                  }
                } else {
                  content = content.replace(pattern, (match, quote, _query) => {
                    let newPath: string;
                    if (pattern.source.includes('/assets/')) {
                      newPath = `/assets/${newFileName}`;
                    } else if (pattern.source.includes('./')) {
                      newPath = `./${newFileName}`;
                    } else if (pattern.source.includes('assets/')) {
                      newPath = `assets/${newFileName}`;
                    } else {
                      return match;
                    }
                    return `${quote}${newPath}${quote}`;
                  });
                  if (content !== originalContent) {
                    modified = true;
                  }
                }
              }
            });
          }

          const fallbackImportPattern = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
          content = content.replace(fallbackImportPattern, (_match: string, quote: string, path: string, _ext: string, query: string) => {
            if (query && query.includes('v=')) {
              return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
            } else {
              return `import(${quote}${path}?v=${buildId}${quote})`;
            }
          });

          if (modified) {
            writeFileSync(jsFilePath, content, 'utf-8');
            totalFixed++;
          }
        }

        if (totalFixed > 0) {
          console.log(`[force-new-hash] ✅ 已在 writeBundle 阶段更新 ${totalFixed} 个 JS 文件中的引用`);
        }
      }
    },
  } as Plugin;
}

/**
 * 修复动态导入中的旧 hash 引用插件
 */
export function fixDynamicImportHashPlugin(): Plugin {
  const chunkNameMap = new Map<string, string>();

  return {
    name: 'fix-dynamic-import-hash',
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      chunkNameMap.clear();

      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          const baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) ||
                           baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }

      console.log(`[fix-dynamic-import-hash] 收集到 ${chunkNameMap.size} 个 chunk 映射`);

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'chunk' && chunkAny.code) {
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

          let newCode = chunkAny.code;
          let modified = false;
          const replacements: Array<{ old: string; new: string }> = [];

          const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
          let match;
          importPattern.lastIndex = 0;
          while ((match = importPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const fullPath = match[2];
            const referencedFile = match[3];
            const fullMatch = match[0];

            const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

            if (!existsInBundle) {
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const [, namePrefix] = refMatch;
                const actualFile = chunkNameMap.get(namePrefix);

                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, '');
                  let newPath = fullPath;
                  if (fullPath.startsWith('/assets/')) {
                    newPath = `/assets/${actualFileName}`;
                  } else if (fullPath.startsWith('./assets/')) {
                    newPath = `./assets/${actualFileName}`;
                  } else if (fullPath.startsWith('assets/')) {
                    newPath = `assets/${actualFileName}`;
                  } else {
                    newPath = actualFileName;
                  }

                  replacements.push({
                    old: fullMatch,
                    new: `import(${quote}${newPath}${quote})`
                  });
                }
              }
            }
          }

          const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
          stringPathPattern.lastIndex = 0;
          while ((match = stringPathPattern.exec(newCode)) !== null) {
            const quote = match[1];
            // const fullPath = match[2]; // 未使用
            const referencedFile = match[3];
            const fullMatch = match[0];

            const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
            if (alreadyFixed) {
              continue;
            }

            const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

            if (!existsInBundle) {
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                               referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const namePrefix = refMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);

                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, '');
                  const newPath = `/assets/${actualFileName}`;

                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${newPath}${quote}`
                  });
                }
              }
            }
          }

          if (replacements.length > 0) {
            replacements.reverse().forEach(({ old, new: newStr }) => {
              newCode = newCode.replace(old, newStr);
            });
            modified = true;
          }

          if (modified) {
            chunkAny.code = newCode;
          }
        }
      }
    },
    writeBundle(options: OutputOptions, bundle: OutputBundle) {
      const outputDir = options.dir || join(process.cwd(), 'dist');
      chunkNameMap.clear();

      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          const baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
          const cleanBaseName = baseName.replace(/-+$/, '');
          const nameMatch = cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) ||
                           cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }

      let totalFixed = 0;
      const thirdPartyChunks = ['lib-echarts', 'element-plus', 'vue-core', 'vue-router', 'vendor'];

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          const isThirdPartyLib = thirdPartyChunks.some(lib => fileName.includes(lib));
          const isEChartsLib = fileName.includes('lib-echarts');

          if (isThirdPartyLib && !isEChartsLib) {
            continue;
          }

          const filePath = join(outputDir, fileName);
          if (existsSync(filePath)) {
            let content = readFileSync(filePath, 'utf-8');
            const replacements: Array<{ old: string; new: string }> = [];

            const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
            let match;
            importPattern.lastIndex = 0;
            while ((match = importPattern.exec(content)) !== null) {
              const quote = match[1];
              const fullPath = match[2];
              const referencedFile = match[3];
              const fullMatch = match[0];

              const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

              if (!existsInBundle) {
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, '.$1');
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                                 referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);

                  if (!actualFile) {
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, '').replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith('.js') && existingFileName.startsWith('assets/')) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, '').replace(/\.js$/, '');
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, '');
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }

                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, '');
                    let newPath = fullPath;
                    if (fullPath.startsWith('/assets/')) {
                      newPath = `/assets/${actualFileName}`;
                    } else if (fullPath.startsWith('./assets/')) {
                      newPath = `./assets/${actualFileName}`;
                    } else if (fullPath.startsWith('assets/')) {
                      newPath = `assets/${actualFileName}`;
                    } else {
                      newPath = actualFileName;
                    }

                    replacements.push({
                      old: fullMatch,
                      new: `import(${quote}${newPath}${quote})`
                    });
                  }
                }
              }
            }

            const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
            stringPathPattern.lastIndex = 0;
            while ((match = stringPathPattern.exec(content)) !== null) {
              const quote = match[1];
              // const fullPath = match[2]; // 未使用
              const referencedFile = match[3];
              const fullMatch = match[0];

              const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
              if (alreadyFixed) {
                continue;
              }

              const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

              if (!existsInBundle) {
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, '.$1');
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                                 referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);

                  if (!actualFile) {
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, '').replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith('.js') && existingFileName.startsWith('assets/')) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, '').replace(/\.js$/, '');
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, '');
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }

                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, '');
                    const newPath = `/assets/${actualFileName}`;

                    replacements.push({
                      old: fullMatch,
                      new: `${quote}${newPath}${quote}`
                    });
                  }
                }
              }
            }

            if (replacements.length > 0) {
              replacements.reverse().forEach(({ old, new: newStr }) => {
                content = content.replace(old, newStr);
              });
              writeFileSync(filePath, content, 'utf-8');
              totalFixed++;
            }
          }
        }
      }

      if (totalFixed > 0) {
        console.log(`[fix-dynamic-import-hash] ✅ writeBundle 阶段共修复 ${totalFixed} 个文件`);
      }
    },
  } as Plugin;
}

