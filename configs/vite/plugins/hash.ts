/**
 * Hash 相关插件
 * 包括强制生成新 hash 和修复动态导入 hash
 */

import type { Plugin } from 'vite';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';

/**
 * 强制生成新 hash 插件
 */
export function forceNewHashPlugin(): Plugin {
  const buildId = Date.now().toString(36);
  const cssFileNameMap = new Map<string, string>();
  const jsFileNameMap = new Map<string, string>();

  return {
    name: 'force-new-hash',
    enforce: 'post',
    buildStart() {
      console.log(`[force-new-hash] 构建 ID: ${buildId}`);
      cssFileNameMap.clear();
    },
    renderChunk(code, chunk) {
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
    generateBundle(options, bundle) {
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

          (chunk as any).fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }

      // 更新所有 chunk 中的引用
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib && (fileName.includes('vue-router') || fileName.includes('vue-core'))) {
            continue;
          }

          let newCode = chunk.code;
          let modified = false;

          for (const [oldFileName, newFileName] of fileNameMap.entries()) {
            const oldRef = oldFileName.replace(/^assets\//, '');
            const newRef = newFileName.replace(/^assets\//, '');
            const oldRefWithoutTrailingDash = oldRef.replace(/-+$/, '');

            const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedOldRefWithoutTrailingDash = oldRefWithoutTrailingDash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
            newCode = newCode.replace(allImportPattern, (match, quote, path, ext, query) => {
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
            chunk.code = newCode;
          }
        }
      }

      console.log(`[force-new-hash] ✅ 已为 ${fileNameMap.size} 个文件添加构建 ID: ${buildId}`);
    },
    writeBundle(options) {
      const outputDir = options.dir || join(process.cwd(), 'dist');
      const indexHtmlPath = join(outputDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        if (cssFileNameMap.size > 0) {
          for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
            const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 更新 <link href> 标签中的 CSS 文件路径（包括查询参数）
            const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(/assets/${escapedOldCssName})(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            const originalHtml = html;
            html = html.replace(linkPattern, (match, prefix, path, query, suffix) => {
              const newPath = `/assets/${newCssName}`;
              const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml) {
              modified = true;
            }
          }
        }

        if (jsFileNameMap.size > 0) {
          for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
            const oldJsNamePrefix = oldJsName.replace(/\.js$/, '').replace(/-[a-zA-Z0-9]{8,}$/, '');
            const escapedOldJsNamePrefix = oldJsNamePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // 1. 更新 import() 动态导入中的路径
            const importPattern = new RegExp(`import\\s*\\(\\s*(["'])(/assets/${escapedOldJsNamePrefix}(?:-[a-zA-Z0-9]{8,})?\\.js)(\\?[^"'\\s]*)?\\1\\s*\\)`, 'g');
            const originalHtml = html;
            html = html.replace(importPattern, (match, quote, path, query) => {
              const newPath = `/assets/${newJsName}`;
              const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `import(${quote}${newPath}${newQuery}${quote})`;
            });
            if (html !== originalHtml) {
              modified = true;
            }
            
            // 2. 更新 <script src> 标签中的路径
            const scriptPattern = new RegExp(`(<script[^>]*\\s+src=["'])(/assets/${escapedOldJsNamePrefix}(?:-[a-zA-Z0-9]{8,})?\\.js)(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            html = html.replace(scriptPattern, (match, prefix, path, query, suffix) => {
              const newPath = `/assets/${newJsName}`;
              const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            
            // 3. 更新 <link href> 标签中的路径（CSS 文件）
            const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(/assets/${escapedOldJsNamePrefix}(?:-[a-zA-Z0-9]{8,})?\\.(js|css|mjs))(\\?[^"'\\s]*)?(["'][^>]*>)`, 'g');
            html = html.replace(linkPattern, (match, prefix, path, ext, query, suffix) => {
              // 只处理 JS 文件，CSS 文件由上面的 cssFileNameMap 处理
              if (ext === 'js' || ext === 'mjs') {
                const newPath = `/assets/${newJsName}`;
                const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                return `${prefix}${newPath}${newQuery}${suffix}`;
              }
              return match;
            });
          }
        }

        const importPatternFallback = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
        html = html.replace(importPatternFallback, (match, quote, path, ext, query) => {
          if (query) {
            return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
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
                content = content.replace(pattern, (match, quote, query) => {
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
          content = content.replace(fallbackImportPattern, (match, quote, path, ext, query) => {
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
  };
}

/**
 * 修复动态导入中的旧 hash 引用插件
 */
export function fixDynamicImportHashPlugin(): Plugin {
  const chunkNameMap = new Map<string, string>();

  return {
    name: 'fix-dynamic-import-hash',
    generateBundle(options, bundle) {
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
        if (chunk.type === 'chunk' && chunk.code) {
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

          let newCode = chunk.code;
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
                const [, namePrefix, , ext] = refMatch;
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
            const fullPath = match[2];
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
            chunk.code = newCode;
          }
        }
      }
    },
    writeBundle(options, bundle) {
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
        if (chunk.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith('assets/')) {
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
              const fullPath = match[2];
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
  };
}

