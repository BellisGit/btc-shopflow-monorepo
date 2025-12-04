/**
 * 修复 chunk 引用关系插件
 *
 * 只修复 chunk 之间的动态导入引用，不修改文件名，不修改第三方库代码
 * 这个插件解决了移除 forceNewHashPlugin 和 fixDynamicImportHashPlugin 后出现的 404 问题
 * 同时避免了修改第三方库代码导致的 __vccOpts 未定义错误
 */

import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// 用于检查旧引用的正则表达式（在 TypeScript 中定义，在运行时使用）
// 这些是旧的 chunk hash 和文件名，如果检测到这些引用，说明需要删除
// 注意：匹配 hash 和完整文件名，确保能检测到所有旧引用
const OLD_REF_PATTERN = /B2xaJ9jT|CQjIfk82|Ct0QBumG|B9_7Pxt3|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT|element-plus-CQjIfk82|vue-core-Ct0QBumG|vendor-B2xaJ9jT|vue-router-B9_7Pxt3|app-src-C3806ap7|app-src-COBg3Fmo|index-D-vcpc3r|index-C-4vWSys|index-u6iSJWLT/g;

export function fixChunkReferencesPlugin(): Plugin {
  const chunkNameMap = new Map<string, string>(); // 文件名前缀 -> 实际文件名
  const buildId = Date.now().toString(36); // 生成构建 ID（时间戳的 36 进制表示）

  return {
    name: 'fix-chunk-references',
    generateBundle(options, bundle) {
      // 第一步：检测并修复异常文件名（末尾有连字符或下划线）
      // Rollup 的 [hash] 在某些情况下可能生成异常文件名，需要在生成阶段就修复
      const fileNameMap = new Map<string, string>(); // 旧文件名 -> 新文件名

      // 先收集所有文件名，用于调试
      const allFileNames = Object.keys(bundle).filter(f =>
        (f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.css')) && f.startsWith('assets/')
      );
      console.log(`[fix-chunk-references] generateBundle: 检查 ${allFileNames.length} 个文件...`);

      for (const fileName of Object.keys(bundle)) {
        if ((fileName.endsWith('.js') || fileName.endsWith('.mjs') || fileName.endsWith('.css')) && fileName.startsWith('assets/')) {
          const baseName = fileName.replace(/^assets\//, '').replace(/\.(js|mjs|css)$/, '');
          const ext = fileName.match(/\.(js|mjs|css)$/)?.[0] || '';

          // 检测末尾有连字符或下划线的情况（如 index-Dd-XhCK-.js、index-B2jkFyZ_.js、index-CExg17b_.js）
          // Rollup 的 [hash] 占位符应该生成十六进制字符（0-9a-f），不应该包含下划线或末尾有连字符
          // 如果出现这种情况，说明 Rollup 的 hash 生成有问题，需要修复
          // 使用更严格的检测：匹配末尾的一个或多个连字符或下划线
          // 也检测中间有连续连字符的情况（如 index--ygJoKxK.js）
          const hasTrailingDashOrUnderscore = /[-_]+$/.test(baseName);
          const hasDoubleDash = baseName.includes('--');

          if (hasTrailingDashOrUnderscore || hasDoubleDash) {
            // 清理末尾的连字符或下划线，以及中间的连续连字符
            let cleanBaseName = baseName.replace(/[-_]+$/, ''); // 先清理末尾
            cleanBaseName = cleanBaseName.replace(/--+/g, '-'); // 再清理中间的连续连字符
            const newFileName = `assets/${cleanBaseName}${ext}`;

            if (hasTrailingDashOrUnderscore) {
              console.warn(`[fix-chunk-references] generateBundle: ⚠️  检测到异常文件名（末尾有连字符或下划线）: ${fileName} (baseName: ${baseName})`);
            } else if (hasDoubleDash) {
              console.warn(`[fix-chunk-references] generateBundle: ⚠️  检测到异常文件名（中间有连续连字符）: ${fileName} (baseName: ${baseName})`);
            }
            console.warn(`[fix-chunk-references] generateBundle: 🔧 修复为: ${newFileName}`);

            // 记录文件名映射
            fileNameMap.set(fileName, newFileName);

            // 更新 chunk 的文件名
            const chunk = bundle[fileName];
            if (chunk) {
              // 关键：同时更新 chunk 的 fileName 属性和 bundle 中的键
              // 确保 Rollup 使用修复后的文件名
              (chunk as any).fileName = newFileName;
              // 如果新文件名已存在，先删除（避免冲突）
              if (bundle[newFileName]) {
                console.warn(`[fix-chunk-references] generateBundle: ⚠️  新文件名已存在，合并内容: ${newFileName}`);
                // 合并内容（通常不会发生，但如果发生，保留新文件名的内容）
              } else {
                bundle[newFileName] = chunk;
              }
              delete bundle[fileName];
              console.log(`[fix-chunk-references] generateBundle: ✅ 已修复文件名: ${fileName} -> ${newFileName}`);
            }
          }
        }
      }

      // 第二步：收集所有 chunk 文件名（包括修复后的），建立映射
      chunkNameMap.clear();

      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          // 提取文件名前缀（如 vendor、vue-core、app-src 等）
          // 文件名格式：name-hash.js
          const baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');

          // 提取名称前缀（去掉 hash 部分）
          // 匹配格式：name-hash，提取 name 部分
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            // 如果还没有映射，则添加映射
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }

      // 更新所有 chunk 中的引用（如果文件名被修复了）
      if (fileNameMap.size > 0) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && chunk.code) {
            let newCode = chunk.code;
            let modified = false;

            for (const [oldFileName, newFileName] of fileNameMap.entries()) {
              const oldRef = oldFileName.replace(/^assets\//, '');
              const newRef = newFileName.replace(/^assets\//, '');

              // 修复所有引用（包括动态导入和字符串引用）
              const patterns = [
                // 动态导入：import('/assets/xxx.js')
                new RegExp(`import\\s*\\(\\s*(["'\`])([^"'\`]*${oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\`]*)(["'\`])\\s*\\)`, 'g'),
                // 字符串引用："assets/xxx.js" 或 '/assets/xxx.js'
                new RegExp(`(["'\`])([^"'\`]*${oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\`]*)(["'\`])`, 'g'),
              ];

              for (const pattern of patterns) {
                if (pattern.test(newCode)) {
                  newCode = newCode.replace(pattern, (match, quote1, path, quote2) => {
                    return match.replace(oldRef, newRef);
                  });
                  modified = true;
                }
              }
            }

            if (modified) {
              chunk.code = newCode;
            }
          }
        }
      }

      console.log(`[fix-chunk-references] 收集到 ${chunkNameMap.size} 个 chunk 映射`);

      // 输出映射关系（调试用）
      if (chunkNameMap.size > 0) {
        const sampleEntries = Array.from(chunkNameMap.entries()).slice(0, 10);
        console.log(`[fix-chunk-references] generateBundle: 示例映射: ${sampleEntries.map(([k, v]) => `${k} -> ${v.replace(/^assets\//, '')}`).join(', ')}`);
      }

      // 检查 chunk 的 imports 和 dynamicImports 属性
      const chunkImports = new Map<string, string[]>(); // chunk 文件名 -> 引用的 chunk 文件名列表
      let totalImports = 0;
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          const imports: string[] = [];
          if ((chunk as any).imports) {
            imports.push(...(chunk as any).imports);
          }
          if ((chunk as any).dynamicImports) {
            imports.push(...(chunk as any).dynamicImports);
          }
          if (imports.length > 0) {
            chunkImports.set(fileName, imports);
            totalImports += imports.length;
          }
        }
      }

      if (chunkImports.size > 0) {
        console.log(`[fix-chunk-references] generateBundle: 发现 ${chunkImports.size} 个 chunk 有导入依赖，共 ${totalImports} 个引用`);
        // 检查是否有不匹配的引用
        for (const [fileName, imports] of chunkImports.entries()) {
          for (const imported of imports) {
            const exists = Object.keys(bundle).some(f => f === imported || f.endsWith(`/${imported}`));
            if (!exists) {
              console.warn(`[fix-chunk-references] generateBundle: ⚠️  ${fileName} 引用了不存在的 chunk: ${imported}`);
              // 尝试通过文件名前缀找到实际文件
              const importedBaseName = imported.replace(/^assets\//, '').replace(/\.js$/, '');
              const cleanImportedBaseName = importedBaseName.replace(/-+$/, '');
              const nameMatch = cleanImportedBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
              if (nameMatch) {
                const namePrefix = nameMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);
                if (actualFile) {
                  console.log(`[fix-chunk-references] generateBundle: 💡 建议修复: ${imported} -> ${actualFile}`);
                }
              }
            }
          }
        }
      } else {
        console.log(`[fix-chunk-references] generateBundle: ℹ️  未发现 chunk.imports 或 chunk.dynamicImports 属性`);
      }

      // 第二步：修复所有 chunk 中的动态导入引用（包括第三方库）
      // 注意：只修复文件路径引用，不修改代码结构，避免 __vccOpts 未定义错误
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.code) {
          continue;
        }

        // 标记是否为第三方库（用于日志，但不跳过）
        const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                 fileName.includes('element-plus') ||
                                 fileName.includes('vue-core') ||
                                 fileName.includes('vue-router') ||
                                 fileName.includes('vendor');

        // 不再跳过第三方库，但只修复文件路径引用，不修改其他代码

        let newCode = chunk.code;
        let modified = false;
        const replacements: Array<{ old: string; new: string }> = [];

        // 首先：强制删除所有旧引用（在 generateBundle 阶段就删除，避免生成包含旧引用的代码）
        // 检查是否包含旧引用（使用更宽泛的匹配，包括文件名和 hash）
        const hasOldRefs = OLD_REF_PATTERN.test(newCode);
        if (hasOldRefs) {
          // 重新匹配以获取所有旧引用
          OLD_REF_PATTERN.lastIndex = 0; // 重置正则表达式
          const oldRefMatches = newCode.match(OLD_REF_PATTERN);
          if (oldRefMatches && oldRefMatches.length > 0) {
            console.log(`[fix-chunk-references] generateBundle: ⚠️  ${fileName} 中检测到 ${oldRefMatches.length} 个旧引用，将强制删除`);
            console.log(`[fix-chunk-references] generateBundle: 检测到的旧引用: ${oldRefMatches.slice(0, 5).join(', ')}`);
            // 强制删除所有包含旧引用的路径字符串
            for (const oldRef of oldRefMatches) {
              // 转义特殊字符
              const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // 匹配包含旧引用的完整路径字符串（在引号中）
              const oldRefPattern = new RegExp('(["\'`])([^"\'`]*' + escapedOldRef + '[^"\'`]*)(["\'`])', 'g');
              let match;
              while ((match = oldRefPattern.exec(newCode)) !== null) {
                const fullMatch = match[0];
                const quote = match[1];
                // 如果这个引用还没有被处理，删除它
                if (!replacements.some(r => r.old === fullMatch)) {
                  console.log(`[fix-chunk-references] generateBundle: 🗑️  强制删除旧引用: ${fullMatch} (在 ${fileName} 中)`);
                  replacements.push({
                    old: fullMatch,
                    new: quote + quote
                  });
                }
              }
              // 也匹配动态导入中的旧引用
              const oldImportPattern = new RegExp('import\\s*\\(\\s*(["\'`])([^"\'`]*' + escapedOldRef + '[^"\'`]*)(["\'`])\\s*\\)', 'g');
              let importMatch;
              while ((importMatch = oldImportPattern.exec(newCode)) !== null) {
                const fullImportMatch = importMatch[0];
                if (!replacements.some(r => r.old === fullImportMatch)) {
                  console.log(`[fix-chunk-references] generateBundle: 🗑️  强制删除旧动态导入: ${fullImportMatch} (在 ${fileName} 中)`);
                  replacements.push({
                    old: fullImportMatch,
                    new: 'Promise.resolve()'
                  });
                }
              }
            }
          }
        }

        // 修复动态导入中的引用
        // 匹配格式：import('/assets/xxx-hash.js') 或 import("./assets/xxx-hash.js") 或 import(`/assets/xxx-hash.js`)
        // 注意：必须匹配查询参数（如 ?v=xxx），以便正确处理已有版本号的情况
        const importPattern = /import\s*\(\s*(["'`])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))(\?[^"'`\s]*)?\1\s*\)/g;
        let match;
        importPattern.lastIndex = 0;
        let importCount = 0;

        while ((match = importPattern.exec(newCode)) !== null) {
          importCount++;
          const quote = match[1];
          const fullPath = match[2]; // /assets/vendor-B2xaJ9jT.js 或 ./assets/vue-core-Ct0QBumG.js
          const referencedFile = match[3]; // vendor-B2xaJ9jT.js
          const existingQuery = match[5] || ''; // ?v=xxx 或 ''
          const fullMatch = match[0]; // import("/assets/vendor-B2xaJ9jT.js") 或 import("/assets/vendor-B2xaJ9jT.js?v=xxx")

          // 检查引用的文件是否存在于 bundle 中
          const existsInBundle = Object.keys(bundle).some(f =>
            f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`)
          );

          // 无论文件是否存在，都通过文件名前缀找到实际文件，确保引用正确
          // 处理末尾有连字符或下划线的情况（如 vue-core-3nfEKAw-.js、index-CExg17b_.js）
          const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs|css)$/, '.$1');
          const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs|css)$/);

          if (refMatch) {
            const [, namePrefix] = refMatch;
            const actualFile = chunkNameMap.get(namePrefix);

            if (actualFile) {
              const actualFileName = actualFile.replace(/^assets\//, '');

              // 如果引用的文件名与实际文件名不一致，需要修复
              if (referencedFile !== actualFileName) {
                let newPath = fullPath;

                // 根据原始路径格式更新为新路径
                if (fullPath.startsWith('/assets/')) {
                  newPath = `/assets/${actualFileName}`;
                } else if (fullPath.startsWith('./assets/')) {
                  newPath = `./assets/${actualFileName}`;
                } else if (fullPath.startsWith('assets/')) {
                  newPath = `assets/${actualFileName}`;
                } else {
                  newPath = actualFileName;
                }

                // 添加或更新版本号查询参数
                // 如果已有查询参数，替换版本号部分；否则添加新的版本号
                const newPathWithVersion = existingQuery && existingQuery.includes('v=')
                  ? newPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
                  : newPath + `?v=${buildId}`;

                // 记录替换
                replacements.push({
                  old: fullMatch,
                  new: `import(${quote}${newPathWithVersion}${quote})`
                });
                console.log(`[fix-chunk-references] generateBundle: 修复 ${fileName} 中的引用: ${referencedFile} -> ${actualFileName}，并添加版本号`);
              } else {
                // 文件名正确，但需要添加或更新版本号
                const newPathWithVersion = existingQuery && existingQuery.includes('v=')
                  ? fullPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
                  : fullPath + `?v=${buildId}`;
                replacements.push({
                  old: fullMatch,
                  new: `import(${quote}${newPathWithVersion}${quote})`
                });
              }
            } else if (!existsInBundle) {
              // 文件不存在且找不到映射
              // 检查是否是旧引用（包含在OLD_REF_PATTERN中）
              const isOldRef = OLD_REF_PATTERN.test(referencedFile);
              if (isOldRef) {
                // 这是旧引用，尝试找到对应的新文件
                // 旧引用可能是：element-plus-CQjIfk82.js、vue-core-Ct0QBumG.js、vendor-B2xaJ9jT.js 等
                // 现在这些库已经合并到 vendor chunk 中
                // 优先查找 vendor chunk，如果找不到则查找主文件
                let targetChunk = chunkNameMap.get('vendor');
                if (!targetChunk) {
                  targetChunk = chunkNameMap.get('index');
                }

                if (targetChunk) {
                  const targetFileName = targetChunk.replace(/^assets\//, '');
                  let newPath = fullPath;
                  if (fullPath.startsWith('/assets/')) {
                    newPath = `/assets/${targetFileName}`;
                  } else if (fullPath.startsWith('./assets/')) {
                    newPath = `./assets/${targetFileName}`;
                  } else if (fullPath.startsWith('assets/')) {
                    newPath = `assets/${targetFileName}`;
                  } else {
                    newPath = targetFileName;
                  }
                  const newPathWithVersion = newPath + `?v=${buildId}`;
                  replacements.push({
                    old: fullMatch,
                    new: `import(${quote}${newPathWithVersion}${quote})`
                  });
                  console.log(`[fix-chunk-references] generateBundle: 🔄 将旧引用 ${referencedFile} 替换为 ${targetFileName}`);
                } else {
                  // 找不到目标文件，删除这个旧引用
                  console.warn(`[fix-chunk-references] generateBundle: 🗑️  删除旧引用（找不到对应文件）: ${referencedFile}`);
                  replacements.push({
                    old: fullMatch,
                    new: `Promise.resolve()`
                  });
                }
              } else {
                // 不是旧引用，输出警告
                console.warn(`[fix-chunk-references] generateBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile}`);
                // 输出所有可用的映射，帮助调试
                const availablePrefixes = Array.from(chunkNameMap.keys()).filter(k => k.includes(namePrefix.split('-')[0]));
                if (availablePrefixes.length > 0) {
                  console.log(`[fix-chunk-references] generateBundle: 💡 可用的类似前缀: ${availablePrefixes.slice(0, 5).join(', ')}`);
                }
              }
            } else {
              // 文件存在且文件名正确，但需要添加或更新版本号
              const newPathWithVersion = existingQuery && existingQuery.includes('v=')
                ? fullPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
                : fullPath + `?v=${buildId}`;
              replacements.push({
                old: fullMatch,
                new: `import(${quote}${newPathWithVersion}${quote})`
              });
            }
          } else {
            // 无法解析文件名前缀，但文件存在，也需要添加或更新版本号
            if (existsInBundle) {
              const newPathWithVersion = existingQuery && existingQuery.includes('v=')
                ? fullPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
                : fullPath + `?v=${buildId}`;
              replacements.push({
                old: fullMatch,
                new: `import(${quote}${newPathWithVersion}${quote})`
              });
            }
          }
        }

        // 修复字符串中的路径引用（如 "/assets/xxx.js" 或 "./assets/xxx.js"），并添加版本号
        const stringPathPattern = /(["'`])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))(\?[^"'`\s]*)?\1/g;
        stringPathPattern.lastIndex = 0;
        let stringRefCount = 0;

        while ((match = stringPathPattern.exec(newCode)) !== null) {
          stringRefCount++;
          const quote = match[1];
          let fullPath = match[2]; // /assets/vendor-B2xaJ9jT.js 或 ./assets/vue-core-Ct0QBumG.js
          const referencedFile = match[3]; // vendor-B2xaJ9jT.js
          const existingQuery = match[4] || '';
          const fullMatch = match[0]; // "/assets/vendor-B2xaJ9jT.js" 或 "./assets/vue-core-Ct0QBumG.js"

          // 检查是否已经被其他规则处理过
          const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
          if (alreadyFixed) {
            continue;
          }

          // 无论文件是否存在，都通过文件名前缀找到实际文件，确保引用正确
          // 处理末尾有连字符或下划线的情况（如 vue-core-3nfEKAw-.js、index-CExg17b_.js）
          const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs|css)$/, '.$1');
          const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs|css)$/);

          if (refMatch) {
            const [, namePrefix] = refMatch;
            const actualFile = chunkNameMap.get(namePrefix);

            if (actualFile) {
              const actualFileName = actualFile.replace(/^assets\//, '');

              // 如果引用的文件名与实际文件名不一致，需要修复
              if (referencedFile !== actualFileName) {
                // 根据原始路径格式更新为新路径
                if (fullPath.startsWith('/assets/')) {
                  fullPath = `/assets/${actualFileName}`;
                } else if (fullPath.startsWith('./assets/')) {
                  fullPath = `./assets/${actualFileName}`;
                } else if (fullPath.startsWith('assets/')) {
                  fullPath = `assets/${actualFileName}`;
                } else {
                  fullPath = actualFileName;
                }

                console.log(`[fix-chunk-references] generateBundle: 修复 ${fileName} 中的字符串引用: ${referencedFile} -> ${actualFileName}`);
              } else {
                // 文件名正确，但需要添加版本号
                // fullPath 已经正确，继续处理版本号
              }
            } else {
              // 检查引用的文件是否存在于 bundle 中
              const existsInBundle = Object.keys(bundle).some(f =>
                f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`)
              );
              if (!existsInBundle) {
                // 如果引用的 chunk 不存在，且当前文件是主文件（index），则删除这个引用
                // 因为代码已经内联到主文件了，不需要动态导入
                if (fileName.includes('index') || fileName.includes('assets/index')) {
                  console.log(`[fix-chunk-references] generateBundle: 🗑️  删除主文件中的无效引用: ${referencedFile} (代码已内联)`);
                  // 删除这个引用：将 import() 替换为空，或者删除整个动态导入语句
                  // 注意：这里需要更精确的匹配，避免误删
                  continue; // 跳过这个引用，不添加到 replacements
                } else {
                  console.warn(`[fix-chunk-references] generateBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${fileName} 中)`);
                }
              }
            }
          }

          // 添加或更新版本号（如果已有查询参数且包含版本号，更新版本号；否则添加新的版本号）
          const newPath = existingQuery && existingQuery.includes('v=')
            ? fullPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
            : fullPath + `?v=${buildId}`;
          replacements.push({
            old: fullMatch,
            new: `${quote}${newPath}${quote}`
          });
        }

        // 应用所有替换（从后往前替换，避免位置偏移问题）
        if (replacements.length > 0) {
          replacements.reverse().forEach(({ old, new: newStr }) => {
            newCode = newCode.replace(old, newStr);
          });
          modified = true;
        }

        if (modified) {
          chunk.code = newCode;
          console.log(`[fix-chunk-references] ✅ 已修复 ${fileName} 中的引用 (${replacements.length} 个修复)`);
        } else if (isThirdPartyLib && (importCount > 0 || stringRefCount > 0)) {
          console.log(`[fix-chunk-references] generateBundle: ℹ️  第三方库 ${fileName} 有 ${importCount} 个动态导入和 ${stringRefCount} 个字符串引用，但都正确`);
        }
      }

      if (chunkNameMap.size > 0) {
        console.log(`[fix-chunk-references] ✅ 已修复所有 chunk 引用关系`);
      }
    },
    // 在 writeBundle 阶段再次修复，确保所有引用都被修复
    writeBundle(options) {
      const outputDir = options.dir || process.cwd();
      const assetsDir = join(outputDir, 'assets');

      if (!existsSync(assetsDir)) {
        return;
      }

      // 第一步：检测并重命名异常文件名（末尾有连字符或下划线）
      // Rollup 可能在写入文件时仍然生成了异常文件名，需要在文件系统层面修复
      const actualFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.css'));
      const fileRenameMap = new Map<string, string>(); // 旧文件名 -> 新文件名

      for (const file of actualFiles) {
        const baseName = file.replace(/\.(js|mjs|css)$/, '');
        const ext = file.match(/\.(js|mjs|css)$/)?.[0] || '';

        // 检测末尾有连字符或下划线的情况（如 index-Dd-XhCK-.js、index-B2jkFyZ_.js、index-CExg17b_.js）
        // Rollup 的 [hash] 占位符应该生成十六进制字符（0-9a-f），不应该包含下划线或末尾有连字符
        // 使用更严格的检测：匹配末尾的一个或多个连字符或下划线
        if (baseName.match(/[-_]+$/)) {
          const cleanBaseName = baseName.replace(/[-_]+$/, '');
          const newFileName = `${cleanBaseName}${ext}`;

          console.warn(`[fix-chunk-references] writeBundle: ⚠️  检测到异常文件名（末尾有连字符或下划线）: ${file}`);
          console.warn(`[fix-chunk-references] writeBundle: 🔧 重命名为: ${newFileName}`);

          // 重命名文件
          const oldFilePath = join(assetsDir, file);
          const newFilePath = join(assetsDir, newFileName);

          try {
            if (existsSync(newFilePath)) {
              // 如果新文件名已存在，删除旧文件（说明可能是重复的）
              unlinkSync(oldFilePath);
              console.warn(`[fix-chunk-references] writeBundle: ⚠️  新文件名已存在，删除旧文件: ${file}`);
            } else {
              // 重命名文件
              writeFileSync(newFilePath, readFileSync(oldFilePath, 'utf-8'), 'utf-8');
              unlinkSync(oldFilePath);
              fileRenameMap.set(file, newFileName);
              console.log(`[fix-chunk-references] writeBundle: ✅ 已重命名: ${file} -> ${newFileName}`);
            }
          } catch (error) {
            console.error(`[fix-chunk-references] writeBundle: ❌ 重命名文件失败: ${file} -> ${newFileName}`, error);
          }
        }
      }

      // 第二步：重新收集所有实际生成的文件名（包括重命名后的）
      // 注意：如果文件被重命名了，需要重新读取目录，因为文件列表可能已经改变
      let finalFiles: string[] = [];

      if (fileRenameMap.size > 0) {
        // 等待文件系统同步
        // 在某些文件系统上，重命名操作可能需要一点时间才能反映在 readdirSync 中
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
          finalFiles = readdirSync(assetsDir).filter((f: string) => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.css'));
          // 检查是否还有异常文件名
          const hasAbnormalFiles = finalFiles.some((f: string) => {
            const baseName = f.replace(/\.(js|mjs|css)$/, '');
            return baseName.match(/[-_]+$/);
          });

          if (!hasAbnormalFiles) {
            break; // 没有异常文件名了，可以继续
          }

          retries++;
          if (retries < maxRetries) {
            // 等待一小段时间后重试
            const startTime = Date.now();
            while (Date.now() - startTime < 10) {
              // 等待 10ms
            }
          }
        }

        // 如果还有异常文件名，再次尝试修复
        for (const file of finalFiles) {
          const baseName = file.replace(/\.(js|mjs|css)$/, '');
          const ext = file.match(/\.(js|mjs|css)$/)?.[0] || '';

          if (baseName.match(/[-_]+$/)) {
            const cleanBaseName = baseName.replace(/[-_]+$/, '');
            const newFileName = `${cleanBaseName}${ext}`;

            console.warn(`[fix-chunk-references] writeBundle: ⚠️  再次检测到异常文件名: ${file}`);
            console.warn(`[fix-chunk-references] writeBundle: 🔧 再次重命名为: ${newFileName}`);

            const oldFilePath = join(assetsDir, file);
            const newFilePath = join(assetsDir, newFileName);

            try {
              if (!existsSync(newFilePath)) {
                writeFileSync(newFilePath, readFileSync(oldFilePath, 'utf-8'), 'utf-8');
                unlinkSync(oldFilePath);
                fileRenameMap.set(file, newFileName);
                console.log(`[fix-chunk-references] writeBundle: ✅ 再次重命名成功: ${file} -> ${newFileName}`);
              } else {
                unlinkSync(oldFilePath);
                console.warn(`[fix-chunk-references] writeBundle: ⚠️  新文件名已存在，删除旧文件: ${file}`);
              }
            } catch (error) {
              console.error(`[fix-chunk-references] writeBundle: ❌ 再次重命名失败: ${file} -> ${newFileName}`, error);
            }
          }
        }

        // 重新读取最终文件列表
        finalFiles = readdirSync(assetsDir).filter((f: string) => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.css'));
      } else {
        finalFiles = readdirSync(assetsDir).filter((f: string) => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.css'));
      }

      chunkNameMap.clear();
      for (const file of finalFiles) {
        const baseName = file.replace(/\.(js|mjs|css)$/, '');
        // 提取名称前缀（去掉 hash 部分）
        const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
        if (nameMatch) {
          const namePrefix = nameMatch[1];
          // 如果还没有映射，则添加映射
          if (!chunkNameMap.has(namePrefix)) {
            chunkNameMap.set(namePrefix, file);
          }
        }
      }

      // 如果文件被重命名了，需要更新所有引用
      if (fileRenameMap.size > 0) {
        console.log(`[fix-chunk-references] writeBundle: 需要更新 ${fileRenameMap.size} 个文件重命名后的引用`);
      }

      console.log(`[fix-chunk-references] writeBundle: 收集到 ${chunkNameMap.size} 个实际文件映射`);
      // 输出映射关系（调试用）
      if (chunkNameMap.size > 0) {
        const sampleEntries = Array.from(chunkNameMap.entries()).slice(0, 10);
        console.log(`[fix-chunk-references] writeBundle: 示例映射: ${sampleEntries.map(([k, v]) => `${k} -> ${v}`).join(', ')}`);
      }

      // 修复所有 JS 文件中的引用（使用重命名后的文件列表）
      const jsFiles = finalFiles.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
      let totalFixed = 0;
      let totalChecked = 0;
      let totalReferences = 0;

      for (const jsFile of jsFiles) {
        // 注意：现在也修复第三方库中的文件路径引用
        // 只修复文件路径，不修改代码结构，避免 __vccOpts 未定义错误
        const isThirdPartyLib = jsFile.includes('lib-echarts') ||
                                 jsFile.includes('element-plus') ||
                                 jsFile.includes('vue-core') ||
                                 jsFile.includes('vue-router') ||
                                 jsFile.includes('vendor');

        // 不再跳过第三方库，但会小心处理，只修复文件路径引用

        const jsFilePath = join(assetsDir, jsFile);
        const content = readFileSync(jsFilePath, 'utf-8');
        const replacements: Array<{ old: string; new: string }> = [];

        // 如果文件被重命名了，需要更新所有引用
        if (fileRenameMap.size > 0) {
          let modifiedContent = content;
          let hasRenameRefs = false;

          for (const [oldFileName, newFileName] of fileRenameMap.entries()) {
            // 修复所有引用（包括动态导入和字符串引用）
            const patterns = [
              // 动态导入：import('/assets/xxx.js')
              new RegExp(`import\\s*\\(\\s*(["'\`])([^"'\`]*${oldFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\`]*)(["'\`])\\s*\\)`, 'g'),
              // 字符串引用："assets/xxx.js" 或 '/assets/xxx.js'
              new RegExp(`(["'\`])([^"'\`]*${oldFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\`]*)(["'\`])`, 'g'),
            ];

            for (const pattern of patterns) {
              if (pattern.test(modifiedContent)) {
                modifiedContent = modifiedContent.replace(pattern, (match) => {
                  return match.replace(oldFileName, newFileName);
                });
                hasRenameRefs = true;
              }
            }
          }

          if (hasRenameRefs) {
            writeFileSync(jsFilePath, modifiedContent, 'utf-8');
            console.log(`[fix-chunk-references] writeBundle: ✅ 已更新 ${jsFile} 中的文件重命名引用`);
          }
        }

        // 检查是否有旧引用（用于诊断和强制删除）
        const oldRefMatches = content.match(OLD_REF_PATTERN);
        if (oldRefMatches && oldRefMatches.length > 0) {
          console.log(`[fix-chunk-references] writeBundle: ⚠️  ${jsFile} 中检测到 ${oldRefMatches.length} 个旧引用，将强制删除`);
          // 强制删除所有包含旧引用的路径字符串
          for (const oldRef of oldRefMatches) {
            // 转义特殊字符
            const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 匹配包含旧引用的完整路径字符串（在引号中）
            const oldRefPattern = new RegExp('(["\'`])([^"\'`]*' + escapedOldRef + '[^"\'`]*)(["\'`])', 'g');
            let match;
            while ((match = oldRefPattern.exec(content)) !== null) {
              const fullMatch = match[0];
              const quote = match[1];
              // 如果这个引用还没有被处理，删除它
              if (!replacements.some(r => r.old === fullMatch)) {
                console.log(`[fix-chunk-references] writeBundle: 🗑️  强制删除旧引用: ${fullMatch}`);
                replacements.push({
                  old: fullMatch,
                  new: quote + quote
                });
              }
            }
            // 也匹配动态导入中的旧引用
            const oldImportPattern = new RegExp('import\\s*\\(\\s*(["\'`])([^"\'`]*' + escapedOldRef + '[^"\'`]*)(["\'`])\\s*\\)', 'g');
            let importMatch;
            while ((importMatch = oldImportPattern.exec(content)) !== null) {
              const fullImportMatch = importMatch[0];
              if (!replacements.some(r => r.old === fullImportMatch)) {
                console.log(`[fix-chunk-references] writeBundle: 🗑️  强制删除旧动态导入: ${fullImportMatch}`);
                replacements.push({
                  old: fullImportMatch,
                  new: 'Promise.resolve()'
                });
              }
            }
          }
        }

        // 修复动态导入中的引用，并添加版本号
        // 匹配格式：import('/assets/xxx.js') 或 import("./assets/xxx.js") 或 import("assets/xxx.js")
        const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))(\?[^"'`\s]*)?\1\s*\)/g;
        let match;
        importPattern.lastIndex = 0;

        while ((match = importPattern.exec(content)) !== null) {
          totalReferences++;
          const quote = match[1];
          let fullPath = match[2];
          const referencedFile = match[3];
          const existingQuery = match[4] || '';
          const fullMatch = match[0];

          // 检查引用的文件是否存在
          const exists = actualFiles.includes(referencedFile);

          // 无论文件是否存在，都通过文件名前缀找到实际文件，确保引用正确
          // 处理末尾有连字符或下划线的情况（如 vue-core-3nfEKAw-.js、index-CExg17b_.js）
          const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs|css)$/, '.$1');
          const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs|css)$/);

          if (refMatch) {
            const [, namePrefix] = refMatch;
            const actualFile = chunkNameMap.get(namePrefix);

            if (actualFile) {
              // 获取实际文件名（去掉assets/前缀）
              const actualFileName = actualFile.replace(/^assets\//, '');
              // 如果引用的文件名与实际文件名不一致，需要修复
              if (referencedFile !== actualFileName) {
                console.log(`[fix-chunk-references] writeBundle: 发现不匹配的引用: ${referencedFile} -> ${actualFileName} (在 ${jsFile} 中)`);

                if (fullPath.startsWith('/assets/')) {
                  fullPath = `/assets/${actualFileName}`;
                } else if (fullPath.startsWith('./assets/')) {
                  fullPath = `./assets/${actualFileName}`;
                } else if (fullPath.startsWith('assets/')) {
                  fullPath = `assets/${actualFileName}`;
                } else {
                  fullPath = actualFileName;
                }
              }
            } else if (!exists) {
              // 文件不存在且找不到映射
              // 检查是否是旧引用（包含在OLD_REF_PATTERN中）
              const isOldRef = OLD_REF_PATTERN.test(referencedFile);
              if (isOldRef) {
                // 这是旧引用，尝试找到对应的新文件
                // 旧引用可能是：element-plus-CQjIfk82.js、vue-core-Ct0QBumG.js、vendor-B2xaJ9jT.js 等
                // 现在这些库已经合并到 vendor chunk 中
                // 优先查找 vendor chunk，如果找不到则查找主文件
                let targetChunk = chunkNameMap.get('vendor');
                if (!targetChunk) {
                  targetChunk = chunkNameMap.get('index');
                }

                if (targetChunk) {
                  const targetFileName = targetChunk.replace(/^assets\//, '');
                  let newPath = fullPath;
                  if (fullPath.startsWith('/assets/')) {
                    newPath = `/assets/${targetFileName}`;
                  } else if (fullPath.startsWith('./assets/')) {
                    newPath = `./assets/${targetFileName}`;
                  } else if (fullPath.startsWith('assets/')) {
                    newPath = `assets/${targetFileName}`;
                  } else {
                    newPath = targetFileName;
                  }
                  const newPathWithVersion = newPath + `?v=${buildId}`;
                  replacements.push({
                    old: fullMatch,
                    new: `import(${quote}${newPathWithVersion}${quote})`
                  });
                  console.log(`[fix-chunk-references] writeBundle: 🔄 将旧引用 ${referencedFile} 替换为 ${targetFileName} (在 ${jsFile} 中)`);
                } else {
                  // 找不到目标文件，删除这个旧引用
                  console.log(`[fix-chunk-references] writeBundle: 🗑️  删除旧引用动态导入: ${referencedFile} (在 ${jsFile} 中)`);
                  replacements.push({
                    old: fullMatch,
                    new: `Promise.resolve()`
                  });
                }
                continue; // 跳过后续处理
              } else if (jsFile.includes('index')) {
                // 如果是主文件（index），说明代码已经内联，删除这个无效引用
                console.log(`[fix-chunk-references] writeBundle: 🗑️  删除主文件中的无效动态导入: ${referencedFile} (代码已内联)`);
                replacements.push({
                  old: fullMatch,
                  new: `Promise.resolve()`
                });
                continue; // 跳过后续处理
              } else {
                console.warn(`[fix-chunk-references] writeBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${jsFile} 中)`);
              }
            }
          }

          // 如果文件存在，添加或更新版本号
          const fileExists = actualFiles.includes(referencedFile) || (refMatch && chunkNameMap.has(refMatch[1]));
          if (fileExists) {
            // 如果已有查询参数且包含版本号，更新版本号；否则添加新的版本号
            const newPath = existingQuery && existingQuery.includes('v=')
              ? fullPath + existingQuery.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)
              : fullPath + `?v=${buildId}`;
            replacements.push({
              old: fullMatch,
              new: `import(${quote}${newPath}${quote})`
            });
          }
        }

        // 修复字符串中的路径引用，并添加版本号
        // 注意：需要匹配可能已经包含查询参数的路径，但要避免匹配已经错误的路径（如 .jsjs）
        // 关键：先匹配没有查询参数的路径，再匹配有查询参数的路径，避免重复处理
        const stringPathPatternNoQuery = /(["'`])(\.?\/?assets\/([^"'`\s?]+\.(js|mjs|css)))(?!\?)\1/g;
        stringPathPatternNoQuery.lastIndex = 0;

        while ((match = stringPathPatternNoQuery.exec(content)) !== null) {
          totalReferences++;
          const quote = match[1];
          let fullPath = match[2]; // 例如: assets/app-pages-DCvlQJpv.js
          const referencedFile = match[3]; // 例如: app-pages-DCvlQJpv.js
          const fullMatch = match[0]; // 完整的匹配，包括引号

          // 检查是否已经被其他规则处理过
          const alreadyFixed = replacements.some(r => r.old === fullMatch);
          if (alreadyFixed) {
            continue;
          }

          // 检查引用的文件是否存在
          const exists = actualFiles.includes(referencedFile);

          // 无论文件是否存在，都通过文件名前缀找到实际文件，确保引用正确
          // 处理末尾有连字符或下划线的情况（如 vue-core-3nfEKAw-.js、index-CExg17b_.js）
          const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs|css)$/, '.$1');
          const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs|css)$/);

          if (refMatch) {
            const [, namePrefix] = refMatch;
            const actualFile = chunkNameMap.get(namePrefix);

            if (actualFile) {
              // 如果引用的文件名与实际文件名不一致，需要修复
              if (referencedFile !== actualFile) {
                console.log(`[fix-chunk-references] writeBundle: 发现不匹配的字符串引用: ${referencedFile} -> ${actualFile} (在 ${jsFile} 中)`);

                // 更新 fullPath，保持路径前缀不变
                if (fullPath.startsWith('/assets/')) {
                  fullPath = `/assets/${actualFile}`;
                } else if (fullPath.startsWith('./assets/')) {
                  fullPath = `./assets/${actualFile}`;
                } else if (fullPath.startsWith('assets/')) {
                  fullPath = `assets/${actualFile}`;
                } else {
                  fullPath = actualFile;
                }
              }
            } else if (!exists) {
              // 文件不存在且找不到映射
              // 检查是否是旧引用（包含在OLD_REF_PATTERN中）
              const isOldRef = OLD_REF_PATTERN.test(referencedFile);
              if (isOldRef) {
                // 这是旧引用，尝试找到对应的新文件
                // 旧引用可能是：element-plus-CQjIfk82.js、vue-core-Ct0QBumG.js、vendor-B2xaJ9jT.js 等
                // 现在这些库已经合并到 vendor chunk 中
                // 优先查找 vendor chunk，如果找不到则查找主文件
                let targetChunk = chunkNameMap.get('vendor');
                if (!targetChunk) {
                  targetChunk = chunkNameMap.get('index');
                }

                if (targetChunk) {
                  const targetFileName = targetChunk.replace(/^assets\//, '');
                  let newPath = fullPath;
                  if (fullPath.startsWith('/assets/')) {
                    newPath = `/assets/${targetFileName}`;
                  } else if (fullPath.startsWith('./assets/')) {
                    newPath = `./assets/${targetFileName}`;
                  } else if (fullPath.startsWith('assets/')) {
                    newPath = `assets/${targetFileName}`;
                  } else {
                    newPath = targetFileName;
                  }
                  const newPathWithVersion = newPath + `?v=${buildId}`;
                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${newPathWithVersion}${quote}`
                  });
                  console.log(`[fix-chunk-references] writeBundle: 🔄 将旧引用 ${referencedFile} 替换为 ${targetFileName} (在 ${jsFile} 中)`);
                  continue; // 跳过后续处理
                } else {
                  // 找不到目标文件，删除这个旧引用
                  console.log(`[fix-chunk-references] writeBundle: 🗑️  删除主文件中的无效字符串引用: ${referencedFile} (代码已内联)`);
                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${quote}`
                  });
                  continue; // 跳过后续处理
                }
              } else if (jsFile.includes('index')) {
                // 如果是主文件（index），说明代码已经内联，删除这个无效引用
                console.log(`[fix-chunk-references] writeBundle: 🗑️  删除主文件中的无效字符串引用: ${referencedFile} (代码已内联)`);
                // 删除这个引用：将字符串替换为空字符串
                replacements.push({
                  old: fullMatch,
                  new: `${quote}${quote}`
                });
                continue; // 跳过后续处理
              } else {
                const prefix = refMatch ? refMatch[1] : '未知';
                console.warn(`[fix-chunk-references] writeBundle: ⚠️  无法找到 ${prefix} 对应的文件，引用: ${referencedFile} (在 ${jsFile} 中)`);
              }
            }
          } else if (!refMatch) {
            // 无法解析文件名前缀，检查文件是否存在
            if (!exists && jsFile.includes('index')) {
              // 文件不存在且是主文件，删除这个无效引用
              console.log(`[fix-chunk-references] writeBundle: 🗑️  删除主文件中的无效字符串引用（无法解析前缀）: ${referencedFile} (代码已内联)`);
              replacements.push({
                old: fullMatch,
                new: `${quote}${quote}`
              });
              continue; // 跳过后续处理
            }
          }

          // 如果文件存在，添加版本号
          const fileExists = actualFiles.includes(referencedFile) || (refMatch && chunkNameMap.has(refMatch[1]));
          if (fileExists) {
            const newPath = fullPath + `?v=${buildId}`;
            replacements.push({
              old: fullMatch,
              new: `${quote}${newPath}${quote}`
            });
          } else if (jsFile.includes('index')) {
            // 文件不存在且是主文件，删除这个无效引用
            console.log(`[fix-chunk-references] writeBundle: 🗑️  删除主文件中的无效字符串引用: ${referencedFile} (代码已内联)`);
            replacements.push({
              old: fullMatch,
              new: `${quote}${quote}`
            });
          } else {
            // 文件不存在且不是主文件，输出警告
            console.warn(`[fix-chunk-references] writeBundle: ⚠️  文件不存在且无法找到映射: ${referencedFile} (在 ${jsFile} 中)`);
          }
        }

        // 修复已经有查询参数但版本号不对的路径
        const stringPathPatternWithQuery = /(["'`])(\.?\/?assets\/([^"'`\s?]+\.(js|mjs|css)))(\?[^"'`\s]*)\1/g;
        stringPathPatternWithQuery.lastIndex = 0;

        while ((match = stringPathPatternWithQuery.exec(content)) !== null) {
          totalReferences++;
          const quote = match[1];
          const fullPath = match[2]; // 例如: assets/app-pages-DCvlQJpv.js
          const referencedFile = match[3]; // 例如: app-pages-DCvlQJpv.js
          const existingQuery = match[4]; // 例如: ?v=xxx
          const fullMatch = match[0]; // 完整的匹配，包括引号

          // 检查是否已经被其他规则处理过
          const alreadyFixed = replacements.some(r => r.old === fullMatch);
          if (alreadyFixed) {
            continue;
          }

          // 检查引用的文件是否存在
          const exists = actualFiles.includes(referencedFile);

          // 无论文件是否存在，都通过文件名前缀找到实际文件，确保引用正确
          // 处理末尾有连字符或下划线的情况（如 vue-core-3nfEKAw-.js、index-CExg17b_.js）
          const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs|css)$/, '.$1');
          const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs|css)$/);

          let finalFullPath = fullPath;
          if (refMatch) {
            const [, namePrefix] = refMatch;
            const actualFile = chunkNameMap.get(namePrefix);

            if (actualFile) {
              // 如果引用的文件名与实际文件名不一致，需要修复
              if (referencedFile !== actualFile) {
                console.log(`[fix-chunk-references] writeBundle: 发现不匹配的字符串引用（有查询参数）: ${referencedFile} -> ${actualFile} (在 ${jsFile} 中)`);

                // 更新 fullPath，保持路径前缀不变
                if (fullPath.startsWith('/assets/')) {
                  finalFullPath = `/assets/${actualFile}`;
                } else if (fullPath.startsWith('./assets/')) {
                  finalFullPath = `./assets/${actualFile}`;
                } else if (fullPath.startsWith('assets/')) {
                  finalFullPath = `assets/${actualFile}`;
                } else {
                  finalFullPath = actualFile;
                }
              }
            } else if (!exists) {
              // 文件不存在且找不到映射，输出警告
              console.warn(`[fix-chunk-references] writeBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${jsFile} 中)`);
            }
          }

          // 直接添加版本号（版本号是我们自己添加的，不需要检查是否已有）
          // 注意：如果文件名被修复了，使用 finalFullPath；否则使用 fullPath
          const pathToUse = finalFullPath !== fullPath ? finalFullPath : fullPath;
          const newPath = pathToUse + `?v=${buildId}`;
          replacements.push({
            old: fullMatch,
            new: `${quote}${newPath}${quote}`
          });
        }

        // 应用所有替换（从后往前替换，避免位置偏移问题）
        if (replacements.length > 0) {
          // 先按位置排序，从后往前替换
          replacements.sort((a, b) => {
            const aIndex = content.lastIndexOf(a.old);
            const bIndex = content.lastIndexOf(b.old);
            return bIndex - aIndex;
          });

          let modifiedContent = content;
          replacements.forEach(({ old, new: newStr }) => {
            // 使用 replace 只替换第一个匹配项，避免重复替换
            modifiedContent = modifiedContent.replace(old, newStr);
          });

          // 验证替换是否成功
          const oldRefMatches = modifiedContent.match(OLD_REF_PATTERN);
          if (oldRefMatches && oldRefMatches.length > 0) {
            console.warn(`[fix-chunk-references] writeBundle: ⚠️  ${jsFile} 中仍有 ${oldRefMatches.length} 个旧引用未被修复`);
            // 输出一些上下文帮助调试
            const firstMatch = modifiedContent.match(OLD_REF_PATTERN);
            if (firstMatch) {
              const matchIndex = modifiedContent.indexOf(firstMatch[0]);
              const context = modifiedContent.substring(Math.max(0, matchIndex - 100), Math.min(modifiedContent.length, matchIndex + 200));
              console.warn(`[fix-chunk-references] writeBundle: 示例上下文: ...${context}...`);
            }
          }

          writeFileSync(jsFilePath, modifiedContent, 'utf-8');
          totalFixed++;
          console.log(`[fix-chunk-references] writeBundle: 修复了 ${jsFile} 中的 ${replacements.length} 个引用`);
        } else if (isThirdPartyLib) {
          // 对于第三方库，即使没有替换，也检查是否有旧引用
          const oldRefMatches = content.match(OLD_REF_PATTERN);
          if (oldRefMatches && oldRefMatches.length > 0) {
            console.warn(`[fix-chunk-references] writeBundle: ⚠️  ${jsFile} 中检测到 ${oldRefMatches.length} 个旧引用，但未被正则表达式匹配到`);
          }
        }
        totalChecked++;
      }

      console.log(`[fix-chunk-references] writeBundle: 检查了 ${totalChecked} 个文件，共 ${totalReferences} 个引用`);
      if (totalFixed > 0) {
        console.log(`[fix-chunk-references] writeBundle: ✅ 共修复了 ${totalFixed} 个文件中的引用`);
      } else {
        console.log(`[fix-chunk-references] writeBundle: ℹ️  所有引用都正确，无需修复`);
      }

      // 修复 index.html 中的引用
      const indexHtmlPath = join(outputDir, 'index.html');
      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let htmlModified = false;
        const htmlReplacements: Array<{ old: string; new: string }> = [];

        // 修复 script src 引用，并添加版本号
        const scriptPattern = /<script[^>]+src=["']([^"']+\.(js|mjs))(\?[^"']*)?["'][^>]*>/g;
        let match;
        scriptPattern.lastIndex = 0;

        while ((match = scriptPattern.exec(html)) !== null) {
          let src = match[1];
          const existingQuery = match[3] || '';
          const fileName = src.replace(/^\/?assets\//, '');

          // 先修复文件名（如果不存在或包含异常字符）
          // 处理末尾有连字符或下划线的情况（如 index-Dd-XhCK-.js、index-B2jkFyZ_.js、index-CExg17b_.js）
          if (fileName && (!actualFiles.includes(fileName) || fileName.match(/[-_]+\.(js|mjs)$/))) {
            const cleanFileName = fileName.replace(/[-_]+\.(js|mjs)$/, '.$1');
            const refMatch = cleanFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs)$/);
            if (refMatch) {
              const [, namePrefix] = refMatch;
              const actualFile = chunkNameMap.get(namePrefix);

              if (actualFile && actualFile !== fileName) {
                src = src.replace(fileName, actualFile);
                console.log(`[fix-chunk-references] writeBundle: 修复 index.html 中的 script 引用: ${fileName} -> ${actualFile}`);
              } else if (!actualFile) {
                // 如果找不到对应的chunk，尝试从index chunk中找到
                const indexChunk = actualFiles.find(f => f.includes('index-'));
                if (indexChunk) {
                  // 删除这个不存在的引用，因为内容已经合并到index chunk中
                  console.log(`[fix-chunk-references] writeBundle: ⚠️  删除 index.html 中不存在的 script 引用: ${fileName} (内容已合并到 ${indexChunk})`);
                  htmlReplacements.push({
                    old: match[0],
                    new: '' // 删除这个引用
                  });
                  continue; // 跳过后续处理
                } else {
                  console.warn(`[fix-chunk-references] writeBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，且没有 index chunk，引用: ${fileName}`);
                }
              }
            }
          }

          // 直接添加版本号（版本号是我们自己添加的，不需要检查是否已有）
          const newSrc = src + `?v=${buildId}`;
          htmlReplacements.push({
            old: match[0],
            new: match[0].replace(match[1] + existingQuery, newSrc)
          });
        }

        // 修复 link rel="modulepreload" 引用，并添加版本号
        const modulepreloadPattern = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.(js|mjs))(\?[^"']*)?["'][^>]*>/g;
        modulepreloadPattern.lastIndex = 0;

        while ((match = modulepreloadPattern.exec(html)) !== null) {
          let href = match[1];
          const existingQuery = match[3] || '';
          const fileName = href.replace(/^\/?assets\//, '');

          // 先修复文件名（如果不存在或包含异常字符）
          // 处理末尾有连字符或下划线的情况（如 index-Dd-XhCK-.js、index-B2jkFyZ_.js、index-CExg17b_.js）
          if (fileName && (!actualFiles.includes(fileName) || fileName.match(/[-_]+\.(js|mjs)$/))) {
            const cleanFileName = fileName.replace(/[-_]+\.(js|mjs)$/, '.$1');
            const refMatch = cleanFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs)$/);
            if (refMatch) {
              const [, namePrefix] = refMatch;
              const actualFile = chunkNameMap.get(namePrefix);

              if (actualFile && actualFile !== fileName) {
                href = href.replace(fileName, actualFile);
                console.log(`[fix-chunk-references] writeBundle: 修复 index.html 中的 modulepreload 引用: ${fileName} -> ${actualFile}`);
              } else if (!actualFile) {
                // 如果找不到对应的chunk，尝试从index chunk中找到
                const indexChunk = actualFiles.find(f => f.includes('index-'));
                if (indexChunk) {
                  // 删除这个不存在的引用，因为内容已经合并到index chunk中
                  console.log(`[fix-chunk-references] writeBundle: ⚠️  删除 index.html 中不存在的 modulepreload 引用: ${fileName} (内容已合并到 ${indexChunk})`);
                  htmlReplacements.push({
                    old: match[0],
                    new: '' // 删除这个引用
                  });
                  continue; // 跳过后续处理
                } else {
                  console.warn(`[fix-chunk-references] writeBundle: ⚠️  无法找到 ${namePrefix} 对应的文件，且没有 index chunk，引用: ${fileName}`);
                }
              }
            }
          }

          // 添加或更新版本号查询参数
          const newHref = href + (existingQuery ? existingQuery.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`);
          if (href + existingQuery !== newHref) {
            htmlReplacements.push({
              old: match[0],
              new: match[0].replace(match[1] + existingQuery, newHref)
            });
          }
        }

        // 修复 link rel="stylesheet" 引用，并添加版本号
        const stylesheetPattern = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+\.css)(\?[^"']*)?["'][^>]*>/g;
        stylesheetPattern.lastIndex = 0;

        while ((match = stylesheetPattern.exec(html)) !== null) {
          let href = match[1];
          const existingQuery = match[2] || '';
          const fileName = href.replace(/^\/?assets\//, '');

          // 先修复文件名（如果不存在或包含异常字符）
          // 处理末尾有连字符或下划线的情况
          if (fileName && (!actualFiles.includes(fileName) || fileName.match(/[-_]+\.css$/))) {
            const cleanFileName = fileName.replace(/[-_]+\.css$/, '.css');
            const refMatch = cleanFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.css$/);
            if (refMatch) {
              const [, namePrefix] = refMatch;
              const actualFile = chunkNameMap.get(namePrefix);

              if (actualFile && actualFile !== fileName) {
                href = href.replace(fileName, actualFile);
                console.log(`[fix-chunk-references] writeBundle: 修复 index.html 中的 stylesheet 引用: ${fileName} -> ${actualFile}`);
              }
            }
          }

          // 直接添加版本号（版本号是我们自己添加的，不需要检查是否已有）
          const newHref = href + `?v=${buildId}`;
          htmlReplacements.push({
            old: match[0],
            new: match[0].replace(match[1] + existingQuery, newHref)
          });
        }

        // 修复 import() 动态导入，并添加版本号（只处理 JS 文件，CSS 文件应该用 link 标签）
        const htmlImportPattern = /import\s*\(\s*(["'])(\/?assets\/([^"'`\s]+\.(js|mjs)))(\?[^"'`\s]*)?\1\s*\)/g;
        htmlImportPattern.lastIndex = 0;

        while ((match = htmlImportPattern.exec(html)) !== null) {
          const quote = match[1];
          let fullPath = match[2];
          const referencedFile = match[3];
          const existingQuery = match[4] || '';
          const fullMatch = match[0];

          // 先修复文件名（如果不存在或包含异常字符）
          // 处理末尾有连字符或下划线的情况（如 index-Dd-XhCK-.js、index-B2jkFyZ_.js、index-CExg17b_.js）
          if (!actualFiles.includes(referencedFile) || referencedFile.match(/[-_]+\.(js|mjs)$/)) {
            const cleanReferencedFile = referencedFile.replace(/[-_]+\.(js|mjs)$/, '.$1');
            const refMatch = cleanReferencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?\.(js|mjs)$/);
            if (refMatch) {
              const [, namePrefix] = refMatch;
              const actualFile = chunkNameMap.get(namePrefix);

              if (actualFile && actualFile !== referencedFile) {
                fullPath = fullPath.replace(referencedFile, actualFile);
                console.log(`[fix-chunk-references] writeBundle: 修复 index.html 中的 import() 引用: ${referencedFile} -> ${actualFile}`);
              }
            }
          }

          // 直接添加版本号（版本号是我们自己添加的，不需要检查是否已有）
          const newPath = fullPath + `?v=${buildId}`;
          htmlReplacements.push({
            old: fullMatch,
            new: `import(${quote}${newPath}${quote})`
          });
        }

        // 确保所有包含 import() 的 script 标签都有 type="module" 属性
        const scriptWithImportPattern = /<script([^>]*)>([^<]*import\s*\([^<]*)<\/script>/g;
        scriptWithImportPattern.lastIndex = 0;
        let scriptMatch;
        while ((scriptMatch = scriptWithImportPattern.exec(html)) !== null) {
          const attrs = scriptMatch[1];
          const content = scriptMatch[2];
          const fullScript = scriptMatch[0];

          // 如果 script 标签中没有 type="module"，添加它
          if (!attrs.includes('type=') || (!attrs.includes('type="module"') && !attrs.includes("type='module'"))) {
            const newAttrs = attrs.trim() ? `${attrs} type="module"` : 'type="module"';
            const newScript = `<script${newAttrs}>${content}</script>`;
            htmlReplacements.push({
              old: fullScript,
              new: newScript
            });
            console.log(`[fix-chunk-references] writeBundle: 为包含 import() 的 script 标签添加 type="module"`);
          }
        }

        // 应用所有替换
        if (htmlReplacements.length > 0) {
          htmlReplacements.reverse().forEach(({ old, new: newStr }) => {
            html = html.replace(old, newStr);
          });
          writeFileSync(indexHtmlPath, html, 'utf-8');
          htmlModified = true;
          console.log(`[fix-chunk-references] writeBundle: ✅ 修复了 index.html 中的 ${htmlReplacements.length} 个引用，并添加了版本号 v=${buildId}`);
        } else {
          // 即使没有需要修复的引用，也要添加版本号
          let needsVersionUpdate = false;

          // 为所有资源添加版本号（如果还没有）
          html = html.replace(/(<script[^>]+src=["'])([^"']+\.(js|mjs))(\?[^"']*)?(["'][^>]*>)/g, (match, prefix, path, ext, query) => {
            if (!query || !query.includes('v=')) {
              needsVersionUpdate = true;
              return `${prefix}${path}?v=${buildId}${match.slice(prefix.length + path.length + (query || '').length)}`;
            }
            return match;
          });

          html = html.replace(/(<link[^>]+rel=["']modulepreload["'][^>]+href=["'])([^"']+\.(js|mjs))(\?[^"']*)?(["'][^>]*>)/g, (match, prefix, path, ext, query) => {
            if (!query || !query.includes('v=')) {
              needsVersionUpdate = true;
              return `${prefix}${path}?v=${buildId}${match.slice(prefix.length + path.length + (query || '').length)}`;
            }
            return match;
          });

          html = html.replace(/(<link[^>]+rel=["']stylesheet["'][^>]+href=["'])([^"']+\.css)(\?[^"']*)?(["'][^>]*>)/g, (match, prefix, path, query) => {
            if (!query || !query.includes('v=')) {
              needsVersionUpdate = true;
              return `${prefix}${path}?v=${buildId}${match.slice(prefix.length + path.length + (query || '').length)}`;
            }
            return match;
          });

          html = html.replace(/import\s*\(\s*(["'])(\/?assets\/[^"'`\s]+\.(js|mjs|css))(\?[^"'`\s]*)?\1\s*\)/g, (match, quote, path, ext, query) => {
            if (!query || !query.includes('v=')) {
              needsVersionUpdate = true;
              return `import(${quote}${path}?v=${buildId}${quote})`;
            }
            return match;
          });

          if (needsVersionUpdate) {
            writeFileSync(indexHtmlPath, html, 'utf-8');
            console.log(`[fix-chunk-references] writeBundle: ✅ 为 index.html 中的所有资源添加了版本号 v=${buildId}`);
          }
        }
      }

      // 清理未使用的文件
      const allAssetFiles = readdirSync(assetsDir);
      const referencedFiles = new Set<string>();

      // 从 index.html 中收集引用的文件（包括 JS、CSS 和图片等资源文件）
      if (existsSync(join(outputDir, 'index.html'))) {
        const htmlContent = readFileSync(join(outputDir, 'index.html'), 'utf-8');
        // 匹配所有 assets 目录下的资源文件（js、mjs、css、png、jpg、jpeg、gif、webp、svg、ico 等）
        const htmlRefs = htmlContent.match(/assets\/([^"'\s<>]+\.(js|mjs|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot))/g);
        if (htmlRefs) {
          htmlRefs.forEach(ref => {
            const fileName = ref.replace('assets/', '');
            referencedFiles.add(fileName);
          });
        }
      }

      // 从所有 JS 文件中收集引用的文件（包括 __vite__mapDeps 和动态导入）
      const allJsFiles = allAssetFiles.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
      for (const jsFile of allJsFiles) {
        const jsFilePath = join(assetsDir, jsFile);
        const jsContent = readFileSync(jsFilePath, 'utf-8');

        // 收集 __vite__mapDeps 中的引用
        const mapDepsMatches = jsContent.match(/assets\/([^"']+\.(js|mjs|css))\?v=[^"']+/g);
        if (mapDepsMatches) {
          mapDepsMatches.forEach(ref => {
            const fileName = ref.replace(/assets\//, '').replace(/\?v=[^"']+/, '');
            referencedFiles.add(fileName);
          });
        }

        // 收集动态导入中的引用
        const importMatches = jsContent.match(/import\s*\(\s*["']([^"']*assets\/[^"']+\.(js|mjs|css))[^"']*["']/g);
        if (importMatches) {
          importMatches.forEach(ref => {
            const match = ref.match(/assets\/([^"']+\.(js|mjs|css))/);
            if (match) {
              referencedFiles.add(match[1]);
            }
          });
        }

        // 文件本身也被引用
        referencedFiles.add(jsFile);
      }

      // 收集 CSS 文件引用
      // CSS 文件可能被以下方式引用：
      // 1. HTML 中的 <link> 标签
      // 2. JS 文件中的 import() 动态导入
      // 3. __vite__mapDeps 中的引用
      // 4. JS 文件中的字符串引用（如 import './xxx.css'）
      const cssFiles = allAssetFiles.filter(f => f.endsWith('.css'));
      for (const cssFile of cssFiles) {
        let isReferenced = false;

        // 检查 HTML 文件中的引用（已经在前面收集过了，但这里再次确认）
        if (referencedFiles.has(cssFile)) {
          isReferenced = true;
        }

        // 检查所有 JS 文件中的引用
        if (!isReferenced) {
          for (const jsFile of allJsFiles) {
            const jsContent = readFileSync(join(assetsDir, jsFile), 'utf-8');
            // 检查多种引用方式
            if (jsContent.includes(cssFile) ||
                jsContent.includes(`assets/${cssFile}`) ||
                jsContent.match(new RegExp(`["']([^"']*${cssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^"']*["']`))) {
              isReferenced = true;
              break;
            }
          }
        }

        // 如果仍然没有被引用，检查是否是 Vite 自动生成的 CSS（通常会被 HTML 引用）
        // 对于这种情况，我们保守处理：如果文件存在且不是明显未使用的，就保留
        // 但实际上，如果 HTML 中已经收集了引用，这里应该已经被标记为引用了
        if (isReferenced) {
          referencedFiles.add(cssFile);
        }
      }

      // 收集图片和其他资源文件的引用（从 JS 文件中）
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
      const imageFiles = allAssetFiles.filter(f => imageExtensions.some(ext => f.endsWith(ext)));
      for (const imageFile of imageFiles) {
        // 检查 HTML 文件中的引用（已经在前面收集过了）
        if (referencedFiles.has(imageFile)) {
          continue;
        }

        // 检查所有 JS 文件中的引用
        let isReferenced = false;
        for (const jsFile of allJsFiles) {
          const jsContent = readFileSync(join(assetsDir, jsFile), 'utf-8');
          // 检查多种引用方式
          if (jsContent.includes(imageFile) ||
              jsContent.includes(`assets/${imageFile}`) ||
              jsContent.match(new RegExp(`["']([^"']*${imageFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^"']*["']`))) {
            isReferenced = true;
            referencedFiles.add(imageFile);
            break;
          }
        }
      }

      // 删除未引用的文件（排除图片文件，因为图片文件可能通过其他方式引用）
      // 只删除明显未使用的 JS/CSS 文件
      const unusedFiles = allAssetFiles.filter(f => {
        if (!referencedFiles.has(f)) {
          // 对于图片文件，保守处理：不删除，除非明确知道未被引用
          const isImage = imageExtensions.some(ext => f.endsWith(ext));
          if (isImage) {
            return false; // 不删除图片文件
          }
          return true; // 删除未引用的 JS/CSS 文件
        }
        return false;
      });

      if (unusedFiles.length > 0) {
        console.log(`[fix-chunk-references] writeBundle: 🗑️  发现 ${unusedFiles.length} 个未使用的文件，开始清理...`);
        let deletedCount = 0;
        for (const file of unusedFiles) {
          try {
            unlinkSync(join(assetsDir, file));
            deletedCount++;
          } catch (error) {
            console.warn(`[fix-chunk-references] writeBundle: ⚠️  删除未使用文件失败: ${file}`, error);
          }
        }
        console.log(`[fix-chunk-references] writeBundle: ✅ 已清理 ${deletedCount} 个未使用的文件`);
      }
    },
    // 在 closeBundle 阶段最后检查，确保所有异常文件名都被修复
    closeBundle() {
      // 这个钩子在所有文件写入完成后执行，用于最终验证和修复
      // 注意：此时 outputDir 可能已经不可用，所以主要做验证
      console.log(`[fix-chunk-references] closeBundle: ✅ 构建完成，所有异常文件名应在 writeBundle 阶段已修复`);
    },
  };
}

