#!/usr/bin/env node

/**
 * 构建所有应用并将产物复制到根目录的 dist 文件夹
 * 按照子域名组织：dist/bellis.com.cn, dist/admin.bellis.com.cn 等
 * 
 * 特性：
 * - 统一清理所有缓存和旧文件
 * - 构建后立即验证，自动修复问题
 * - 自动重试机制（最多2次）
 * - 确保构建产物始终可用且版本统一
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// 应用和子域名的映射关系
const APP_DOMAIN_MAP = {
  'system-app': 'bellis.com.cn',
  'admin-app': 'admin.bellis.com.cn',
  'logistics-app': 'logistics.bellis.com.cn',
  'quality-app': 'quality.bellis.com.cn',
  'production-app': 'production.bellis.com.cn',
  'engineering-app': 'engineering.bellis.com.cn',
  'finance-app': 'finance.bellis.com.cn',
  'mobile-app': 'mobile.bellis.com.cn',
  'layout-app': 'layout.bellis.com.cn',
  'monitor-app': 'monitor.bellis.com.cn',
};

// 应用构建顺序（system-app 应该先构建，因为其他应用可能依赖它）
const BUILD_ORDER = [
  'system-app',
  'layout-app',
  'admin-app',
  'logistics-app',
  'quality-app',
  'production-app',
  'engineering-app',
  'finance-app',
  'mobile-app',
  'monitor-app',
];

// 根目录的 dist 文件夹
const ROOT_DIST_DIR = join(rootDir, 'dist');

// 最大重试次数
const MAX_RETRIES = 2;

/**
 * 彻底清理单个应用的所有缓存和构建产物
 */
function cleanSingleApp(appName) {
  const appDistDir = join(rootDir, 'apps', appName, 'dist');
  const viteCachePaths = [
    join(rootDir, 'apps', appName, 'node_modules', '.vite'),
    join(rootDir, 'apps', appName, '.vite'),
    join(rootDir, 'apps', appName, 'node_modules', '.vite', 'build'),
    join(rootDir, 'apps', appName, 'node_modules', '.cache'),
    join(rootDir, 'apps', appName, '.cache'),
  ];

  let cleaned = false;

  // 清理构建产物（但保留 build/eps 目录）
  if (existsSync(appDistDir)) {
    try {
      // 如果存在 build/eps 目录，先保存
      const epsDir = join(rootDir, 'apps', appName, 'build', 'eps');
      let epsBackup = null;
      if (existsSync(epsDir)) {
        const tempBackup = join(rootDir, 'apps', appName, 'build', 'eps.backup');
        if (existsSync(tempBackup)) {
          rmSync(tempBackup, { recursive: true, force: true });
        }
        cpSync(epsDir, tempBackup, { recursive: true });
        epsBackup = tempBackup;
      }

      rmSync(appDistDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

      // 恢复 build/eps 目录
      if (epsBackup && existsSync(epsBackup)) {
        const targetEpsDir = join(rootDir, 'apps', appName, 'build', 'eps');
        if (!existsSync(join(rootDir, 'apps', appName, 'build'))) {
          const fs = require('fs');
          fs.mkdirSync(join(rootDir, 'apps', appName, 'build'), { recursive: true });
        }
        cpSync(epsBackup, targetEpsDir, { recursive: true });
        rmSync(epsBackup, { recursive: true, force: true });
      }

      cleaned = true;
    } catch (error) {
      console.warn(`  ⚠️  清理 ${appName}/dist 失败:`, error.message);
    }
  }

  // 清理所有 Vite 缓存路径
  viteCachePaths.forEach((cachePath) => {
    if (existsSync(cachePath)) {
      try {
        rmSync(cachePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
        cleaned = true;
      } catch (error) {
        // 忽略清理失败，继续清理其他路径
      }
    }
  });

  return cleaned;
}

/**
 * 清理各个应用的 dist 目录和缓存
 */
function cleanAppDistDirs() {
  console.log('🧹 清理各个应用的构建产物和缓存...');
  let cleanedCount = 0;

  for (const appName of BUILD_ORDER) {
    if (cleanSingleApp(appName)) {
      cleanedCount++;
      console.log(`  ✅ 已清理 ${appName} 的构建产物和缓存`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`\n  ✅ 共清理了 ${cleanedCount} 个应用的构建产物和缓存\n`);
  } else {
    console.log('  ℹ️  没有需要清理的构建产物和缓存\n');
  }
}

/**
 * 清理 Turbo 缓存
 */
function cleanTurboCache() {
  console.log('🧹 清理 Turbo 构建缓存...');
  const turboCachePath = join(rootDir, '.turbo');
  if (existsSync(turboCachePath)) {
    try {
      rmSync(turboCachePath, { recursive: true, force: true });
      console.log('  ✅ 已清理 Turbo 构建缓存\n');
    } catch (error) {
      console.warn('  ⚠️  清理 Turbo 缓存失败:', error.message, '\n');
    }
  } else {
    console.log('  ℹ️  Turbo 缓存目录不存在\n');
  }
}

/**
 * 清理共享包的构建产物和缓存
 */
function cleanPackagesCache() {
  console.log('🧹 清理共享包的构建产物和缓存...');
  const packagesToClean = [
    'packages/shared-core',
    'packages/shared-components',
    'packages/shared-utils',
  ];

  packagesToClean.forEach((pkgName) => {
    const pkgDistPath = join(rootDir, pkgName, 'dist');
    const pkgViteCachePath1 = join(rootDir, pkgName, 'node_modules', '.vite');
    const pkgViteCachePath2 = join(rootDir, pkgName, '.vite');

    [pkgDistPath, pkgViteCachePath1, pkgViteCachePath2].forEach((cachePath) => {
      if (existsSync(cachePath)) {
        try {
          rmSync(cachePath, { recursive: true, force: true });
        } catch (error) {
          // 忽略清理失败
        }
      }
    });
  });
  console.log('  ✅ 共享包缓存清理完成\n');
}

/**
 * 清理并创建根目录的 dist 文件夹
 */
function prepareDistDir() {
  console.log('📁 准备根目录的 dist 目录...');
  if (existsSync(ROOT_DIST_DIR)) {
    console.log('  🗑️  清理现有的 dist 目录...');
    rmSync(ROOT_DIST_DIR, { recursive: true, force: true });
  }
  console.log('  ✅ dist 目录已准备就绪\n');
}

/**
 * 构建单个应用
 */
function buildApp(appName) {
  console.log(`🔨 构建应用: ${appName}...`);
  try {
    // system-app 使用特殊的构建命令
    if (appName === 'system-app') {
      execSync('pnpm run build:system', {
        cwd: rootDir,
        stdio: 'inherit',
        env: { ...process.env, BTC_BUILD_TIMESTAMP: process.env.BTC_BUILD_TIMESTAMP },
      });
    } else {
      // 其他应用使用标准的构建命令
      const buildCmd = `pnpm --filter ${appName} build`;
      execSync(buildCmd, {
        cwd: rootDir,
        stdio: 'inherit',
        env: { ...process.env, BTC_BUILD_TIMESTAMP: process.env.BTC_BUILD_TIMESTAMP },
      });
    }
    console.log(`  ✅ ${appName} 构建完成\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${appName} 构建失败:`, error.message);
    return false;
  }
}

/**
 * 从文件中提取所有资源引用
 */
function extractAssetReferences(filePath, content) {
  const references = [];
  const assetsDir = join(dirname(filePath), 'assets');

  // 匹配 import() 动态导入
  // 关键：排除错误消息中的示例代码（如 "import('./MyPage.vue')" 在错误消息中）
  // 这些通常出现在 Vue Router 或 Vue 的错误提示中
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    let ref = match[1];
    
    // 检查是否在错误消息字符串中（通常包含 "Did you write"、"instead of" 等关键词）
    const matchIndex = match.index;
    const beforeMatch = content.substring(Math.max(0, matchIndex - 200), matchIndex);
    const afterMatch = content.substring(matchIndex, Math.min(content.length, matchIndex + match[0].length + 200));
    const context = beforeMatch + afterMatch;
    
    // 如果上下文包含错误消息关键词，跳过这个引用（这是示例代码，不是真正的引用）
    if (context.includes('Did you write') || 
        context.includes('instead of') || 
        context.includes('This will break') ||
        context.includes('is a Promise instead') ||
        context.includes('defineAsyncComponent')) {
      continue;
    }
    
    // 去掉查询参数（如 ?v=xxx）
    const queryIndex = ref.indexOf('?');
    const refWithoutQuery = queryIndex > -1 ? ref.substring(0, queryIndex) : ref;
    
    // 跳过非资源文件的引用（Vue 组件、TypeScript 文件等）
    // 关键：使用更严格的匹配，确保 .vue、.ts、.tsx 文件都被跳过
    if (refWithoutQuery.endsWith('.vue') || 
        refWithoutQuery.endsWith('.ts') || 
        refWithoutQuery.endsWith('.tsx') ||
        refWithoutQuery.match(/\.(vue|ts|tsx)(\?|$)/)) {
      continue;
    }
    
    if (ref.includes('node_modules') || ref.startsWith('virtual:') || ref.startsWith('@')) {
      continue;
    }
    // 只处理资源文件引用（.js, .mjs, .css）或 /assets/ 路径
    if (refWithoutQuery.startsWith('./') || refWithoutQuery.startsWith('../')) {
      // 只处理资源文件扩展名，明确排除 .vue、.ts、.tsx
      if (refWithoutQuery.match(/\.(js|mjs|css)(\?|$)/) && 
          !refWithoutQuery.match(/\.(vue|ts|tsx)(\?|$)/)) {
        const resolvedPath = resolve(dirname(filePath), refWithoutQuery);
        references.push({ type: 'dynamic-import', path: refWithoutQuery, resolvedPath });
      }
    } else if (refWithoutQuery.startsWith('/assets/')) {
      references.push({ type: 'dynamic-import', path: refWithoutQuery, resolvedPath: join(assetsDir, refWithoutQuery.replace('/assets/', '')) });
    }
  }

  // 匹配字符串中的绝对路径
  const absolutePathRegex = /['"](?:\/assets\/[^'"]+\.(?:js|mjs|css)(?:\?[^'"]*)?)['"]/g;
  while ((match = absolutePathRegex.exec(content)) !== null) {
    let ref = match[1] || match[0].slice(1, -1);
    // 去掉查询参数（如 ?v=xxx）
    const queryIndex = ref.indexOf('?');
    const refWithoutQuery = queryIndex > -1 ? ref.substring(0, queryIndex) : ref;
    if (refWithoutQuery.startsWith('/assets/')) {
      references.push({ type: 'runtime-path', path: refWithoutQuery, resolvedPath: join(assetsDir, refWithoutQuery.replace('/assets/', '')) });
    }
  }

  // 匹配 import 语句
  const importRegex = /(?:import|export).*?from\s+['"]([^'"]+)['"]/g;
  while ((match = importRegex.exec(content)) !== null) {
    const ref = match[1];
    
    // 跳过非资源文件的引用（Vue 组件、TypeScript 文件等）
    if (ref.endsWith('.vue') || ref.endsWith('.ts') || ref.endsWith('.tsx')) {
      continue;
    }
    
    if (ref.startsWith('@') || ref.includes('node_modules') || ref.startsWith('virtual:')) {
      continue;
    }
    // 只处理资源文件引用（.js, .mjs, .css）或 /assets/ 路径
    if (ref.startsWith('./') || ref.startsWith('../')) {
      // 只处理资源文件扩展名
      if (ref.match(/\.(js|mjs|css)(\?|$)/)) {
        const resolvedPath = resolve(dirname(filePath), ref);
        references.push({ type: 'import', path: ref, resolvedPath });
      }
    } else if (ref.startsWith('/assets/')) {
      references.push({ type: 'import', path: ref, resolvedPath: join(assetsDir, ref.replace('/assets/', '')) });
    }
  }

  // 匹配 HTML 中的资源引用
  const htmlRegex = /(?:href|src)=["']([^"']+)["']/g;
  while ((match = htmlRegex.exec(content)) !== null) {
    const ref = match[1];
    if (ref.startsWith('data:') || ref.startsWith('blob:') || ref.startsWith('http://') || ref.startsWith('https://')) {
      continue;
    }
    if (ref.startsWith('./') || ref.startsWith('../')) {
      const resolvedPath = resolve(dirname(filePath), ref);
      references.push({ type: 'html', path: ref, resolvedPath });
    } else if (ref.startsWith('/assets/')) {
      references.push({ type: 'html', path: ref, resolvedPath: join(assetsDir, ref.replace('/assets/', '')) });
    }
  }

  return references;
}

/**
 * 验证并修复所有 JS 文件中的资源引用
 */
function verifyAndFixJsReferences(appDistDir, appName) {
  const assetsDir = join(appDistDir, 'assets');
  if (!existsSync(assetsDir)) {
    return { fixed: false, missing: [] };
  }

  // 获取所有实际存在的文件
  function getAllFiles(dir, fileList = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      if (statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.css')) {
        fileList.push({ path: filePath, name: file });
      }
    });
    return fileList;
  }

  const allFiles = getAllFiles(assetsDir);
  
  // 建立文件映射（忽略 hash）
  const fileMap = new Map(); // cleanName.ext -> actualFileName
  
  allFiles.forEach(({ name }) => {
    // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
    // 支持短 hash（至少4个字符）和长 hash（8个字符以上）
    const match = name.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
    if (match) {
      const [, cleanName, , , ext] = match;
      const key = `${cleanName}.${ext}`;
      if (!fileMap.has(key) || name > fileMap.get(key)) {
        fileMap.set(key, name);
      }
    }
  });

  let totalFixed = 0;
  const missing = [];

  // 检查每个 JS 文件中的引用
  allFiles.forEach(({ path: filePath, name: fileName }) => {
    if (!fileName.endsWith('.js') && !fileName.endsWith('.mjs')) {
      return;
    }

    try {
      let content = readFileSync(filePath, 'utf-8');
      let modified = false;
      const replacements = [];
      
      // 调试：检查是否包含旧引用（所有文件）
      const oldHashes = ['CQjIfk82', 'B2xaJ9jT', 'Bob15k_M', 'B9_7Pxt3', 'Ct0QBumG', 'DXiZfgDR', 'CK3kLuZf', 'B6Y4X6Zv'];
      const hasOldRefs = oldHashes.some(hash => content.includes(hash));
      if (hasOldRefs) {
        console.log(`    🔍 检测到 ${fileName} 中包含旧 hash 引用，开始修复...`);
        // 输出具体的旧引用
        oldHashes.forEach(hash => {
          if (content.includes(hash)) {
            const regex = new RegExp(`[^"'\\s]*${hash}[^"'\\s]*`, 'g');
            const matches = content.match(regex);
            if (matches && matches.length > 0) {
              console.log(`      ⚠️  发现旧 hash ${hash} 的引用: ${matches.slice(0, 3).join(', ')}`);
            }
          }
        });
      }

      // 直接使用正则表达式匹配所有可能的引用模式，而不是依赖 extractAssetReferences
      // 这样可以更准确地匹配和替换

      // 1. 匹配 import() 动态导入中的 /assets/xxx.js
      const dynamicImportPattern = /import\s*\(\s*(["'])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
      let match;
      while ((match = dynamicImportPattern.exec(content)) !== null) {
        const quote = match[1];
        const fullPath = match[2]; // /assets/vue-router-B9_7Pxt3.js
        const fileName = match[3]; // vue-router-B9_7Pxt3.js
        const fullMatch = match[0]; // import("/assets/vue-router-B9_7Pxt3.js")

        // 检查文件是否存在
        const fileExists = allFiles.some(f => f.name === fileName);
        if (!fileExists) {
          // 尝试通过文件名（忽略 hash 和 buildId）查找
          // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
          const nameMatch = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
          if (nameMatch) {
            const [, baseName, , , ext] = nameMatch;
            const key = `${baseName}.${ext}`;
            const actualFile = fileMap.get(key);
            
            if (actualFile && actualFile !== fileName) {
              const newPath = `/assets/${actualFile}`;
              replacements.push({
                old: fullMatch,
                new: `import(${quote}${newPath}${quote})`,
                description: `${fileName} -> ${actualFile}`
              });
              modified = true;
            }
          }
        }
      }

      // 2. 匹配字符串中的 /assets/xxx.js（包括在对象、数组等中的引用）
      // 这个模式需要更宽泛，匹配所有可能的引用格式
      const stringPathPattern = /(["'])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
      // 重置正则表达式的 lastIndex
      stringPathPattern.lastIndex = 0;
      while ((match = stringPathPattern.exec(content)) !== null) {
        const quote = match[1];
        const fullPath = match[2]; // /assets/vue-router-B9_7Pxt3.js
        const fileName = match[3]; // vue-router-B9_7Pxt3.js
        const fullMatch = match[0]; // "/assets/vue-router-B9_7Pxt3.js"

        // 检查是否已经被其他规则处理过
        const alreadyFixed = replacements.some(r => r.old === fullMatch);
        if (alreadyFixed) {
          continue;
        }

        // 检查文件是否存在
        const fileExists = allFiles.some(f => f.name === fileName);
        if (!fileExists) {
          // 尝试通过文件名（忽略 hash 和 buildId）查找
          // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
          const nameMatch = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
          if (nameMatch) {
            const [, baseName, , , ext] = nameMatch;
            const key = `${baseName}.${ext}`;
            const actualFile = fileMap.get(key);
            
            if (actualFile && actualFile !== fileName) {
              const newPath = `/assets/${actualFile}`;
              replacements.push({
                old: fullMatch,
                new: `${quote}${newPath}${quote}`,
                description: `${fileName} -> ${actualFile}`
              });
              modified = true;
            } else if (!actualFile) {
              // 如果找不到对应的文件，记录警告
              console.warn(`    ⚠️  ${fileName} 无法找到对应的文件（baseName: ${baseName}）`);
            }
          }
        }
      }

      // 3. 匹配相对路径引用 ./xxx.js
      const relativePathPattern = /(["'])(\.\/)([^"'`\s]+\.(js|mjs|css))\1/g;
      relativePathPattern.lastIndex = 0;
      while ((match = relativePathPattern.exec(content)) !== null) {
        const quote = match[1];
        const relativePrefix = match[2]; // ./
        const fileName = match[3]; // vue-router-B9_7Pxt3.js
        const fullMatch = match[0]; // "./vue-router-B9_7Pxt3.js"

        // 检查是否已经被其他规则处理过
        const alreadyFixed = replacements.some(r => r.old === fullMatch);
        if (alreadyFixed) {
          continue;
        }

        // 检查文件是否存在
        const fileExists = allFiles.some(f => f.name === fileName);
        if (!fileExists) {
          // 尝试通过文件名（忽略 hash 和 buildId）查找
          // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
          const nameMatch = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
          if (nameMatch) {
            const [, baseName, , , ext] = nameMatch;
            const key = `${baseName}.${ext}`;
            const actualFile = fileMap.get(key);
            
            if (actualFile && actualFile !== fileName) {
              replacements.push({
                old: fullMatch,
                new: `${quote}${relativePrefix}${actualFile}${quote}`,
                description: `${fileName} -> ${actualFile}`
              });
              modified = true;
            }
          }
        }
      }

      // 4. 匹配 __vite__mapDeps 数组中的引用（Vite 内部使用的依赖映射）
      const viteMapDepsPattern = /(["'])(assets\/[^"'`\s]+\.(js|mjs|css))\1/g;
      viteMapDepsPattern.lastIndex = 0;
      while ((match = viteMapDepsPattern.exec(content)) !== null) {
        const quote = match[1];
        const fullPath = match[2]; // assets/vue-router-B9_7Pxt3.js
        const fileName = fullPath.split('/').pop(); // vue-router-B9_7Pxt3.js
        const fullMatch = match[0]; // "assets/vue-router-B9_7Pxt3.js"

        // 检查是否已经被其他规则处理过
        const alreadyFixed = replacements.some(r => r.old === fullMatch);
        if (alreadyFixed) {
          continue;
        }

        // 检查文件是否存在
        const fileExists = allFiles.some(f => f.name === fileName);
        if (!fileExists) {
          // 尝试通过文件名（忽略 hash 和 buildId）查找
          // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
          const nameMatch = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
          if (nameMatch) {
            const [, baseName, , , ext] = nameMatch;
            const key = `${baseName}.${ext}`;
            const actualFile = fileMap.get(key);
            
            if (actualFile && actualFile !== fileName) {
              const newPath = `assets/${actualFile}`;
              replacements.push({
                old: fullMatch,
                new: `${quote}${newPath}${quote}`,
                description: `${fileName} -> ${actualFile}`
              });
              modified = true;
            }
          }
        }
      }

      // 应用所有替换（从后往前替换，避免位置偏移）
      if (modified && replacements.length > 0) {
        // 去重，保留最后一个替换
        const uniqueReplacements = [];
        const seen = new Set();
        replacements.reverse().forEach(rep => {
          if (!seen.has(rep.old)) {
            seen.add(rep.old);
            uniqueReplacements.push(rep);
          }
        });
        uniqueReplacements.reverse();

        let replaceCount = 0;
        uniqueReplacements.forEach(({ old, new: newStr, description }) => {
          // 检查是否真的需要替换（避免不必要的替换）
          if (content.includes(old)) {
            // 使用全局替换，替换所有出现
            const escapedOld = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedOld, 'g');
            const beforeCount = (content.match(regex) || []).length;
            content = content.replace(regex, newStr);
            replaceCount += beforeCount;
            console.log(`    🔧 修复 ${fileName}: ${description} (替换了 ${beforeCount} 处)`);
          }
        });
        
        if (replaceCount > 0) {
          writeFileSync(filePath, content, 'utf-8');
          totalFixed++;
          console.log(`    ✅ ${fileName} 修复完成，共替换 ${replaceCount} 处引用`);
        }
      }
    } catch (error) {
      console.warn(`    ⚠️  处理文件失败: ${fileName}`, error.message);
    }
  });

  if (totalFixed > 0) {
    console.log(`  ✅ 已修复 ${totalFixed} 个 JS 文件中的资源引用`);
  }

  return { fixed: totalFixed > 0, missing };
}

/**
 * 验证并修复 index.html 中的资源引用
 */
function verifyAndFixIndexHtml(appDistDir, appName) {
  const indexHtmlPath = join(appDistDir, 'index.html');
  if (!existsSync(indexHtmlPath)) {
    return { fixed: false, missing: [] };
  }

  const assetsDir = join(appDistDir, 'assets');
  if (!existsSync(assetsDir)) {
    return { fixed: false, missing: [] };
  }

  let htmlContent = readFileSync(indexHtmlPath, 'utf-8');
  
  // 检查 HTML 中是否包含旧 hash 引用
  const oldHashes = ['CQjIfk82', 'B2xaJ9jT', 'Bob15k_M', 'B9_7Pxt3', 'Ct0QBumG', 'DXiZfgDR', 'CK3kLuZf', 'B6Y4X6Zv', 'C3806ap7', 'D-vcpc3r', 'COBg3Fmo', 'C-4vWSys', 'u6iSJWLT'];
  const oldHashPattern = new RegExp(oldHashes.join('|'), 'g');
  const hasOldRefs = oldHashPattern.test(htmlContent);
  
  if (hasOldRefs) {
    oldHashPattern.lastIndex = 0; // 重置正则表达式
    const oldRefMatches = htmlContent.match(oldHashPattern);
    if (oldRefMatches && oldRefMatches.length > 0) {
      const uniqueOldRefs = [...new Set(oldRefMatches)];
      console.error(`  ❌ ${appName} 的 index.html 中包含 ${oldRefMatches.length} 个旧 hash 引用！`);
      console.error(`     检测到的旧 hash: ${uniqueOldRefs.slice(0, 5).join(', ')}${uniqueOldRefs.length > 5 ? '...' : ''}`);
      console.error(`     这些引用应该已被 fix-chunk-references 插件删除，但可能由于以下原因残留：`);
      console.error(`     1. 构建时插件未正确执行`);
      console.error(`     2. HTML 文件在插件处理后被其他工具修改`);
      console.error(`     3. 使用了缓存的旧 HTML 文件`);
      console.error(`     建议：清理 dist 目录并重新构建`);
      
      // 尝试自动修复：删除包含旧引用的标签
      let fixed = false;
      const oldScriptPattern = /<script[^>]+src=["'][^"']*(?:CQjIfk82|B2xaJ9jT|Bob15k_M|B9_7Pxt3|Ct0QBumG|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT)[^"']*["'][^>]*>/gi;
      const oldLinkPattern = /<link[^>]+(?:href|src)=["'][^"']*(?:CQjIfk82|B2xaJ9jT|Bob15k_M|B9_7Pxt3|Ct0QBumG|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT)[^"']*["'][^>]*>/gi;
      const oldImportPattern = /import\s*\(\s*["'][^"']*(?:CQjIfk82|B2xaJ9jT|Bob15k_M|B9_7Pxt3|Ct0QBumG|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT)[^"']*["']\s*\)/gi;
      
      let deletedCount = 0;
      htmlContent = htmlContent.replace(oldScriptPattern, () => {
        deletedCount++;
        return '';
      });
      htmlContent = htmlContent.replace(oldLinkPattern, () => {
        deletedCount++;
        return '';
      });
      htmlContent = htmlContent.replace(oldImportPattern, () => {
        deletedCount++;
        return 'Promise.resolve()';
      });
      
      if (deletedCount > 0) {
        writeFileSync(indexHtmlPath, htmlContent, 'utf-8');
        console.log(`  🔧 已自动删除 ${deletedCount} 个包含旧引用的标签`);
        fixed = true;
      }
      
      // 再次检查是否还有残留
      const stillHasOldRefs = oldHashPattern.test(htmlContent);
      if (stillHasOldRefs) {
        console.error(`  ⚠️  仍有旧引用残留，可能需要手动检查 HTML 文件`);
      }
    }
  }
  
  // 获取所有实际存在的 assets 文件
  function getAllFiles(dir, fileList = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      if (statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.mjs')) {
        fileList.push(file);
      }
    });
    return fileList;
  }

  const actualFiles = new Set(getAllFiles(assetsDir));
  
  // 建立文件名映射（忽略 hash 和 buildId）
  const fileMap = new Map();
  actualFiles.forEach(actualFile => {
    // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
    // 支持短 hash（至少4个字符）和长 hash（8个字符以上）
    const match = actualFile.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|css|mjs)$/);
    if (match) {
      const [, name, , , ext] = match;
      const key = `${name}.${ext}`;
      if (!fileMap.has(key) || actualFile > fileMap.get(key)) {
        fileMap.set(key, actualFile);
      }
    }
  });

  // 提取并修复 index.html 中的引用
  // 匹配 src/href 属性和 import() 动态导入
  const refRegex = /(src|href)=["'](\/assets\/[^"']+\.(js|mjs|css)(?:\?[^"']*)?)["']|import\s*\(\s*["'](\/assets\/[^"']+\.(js|mjs|css)(?:\?[^"']*)?)["']\s*\)/g;
  let match;
  const replacements = [];
  const missing = [];

  while ((match = refRegex.exec(htmlContent)) !== null) {
    // match[2] 是 src/href 的值，match[4] 是 import() 中的路径
    const fullPath = match[2] || match[4];
    if (!fullPath) continue;
    
    // 去掉查询参数（如 ?v=xxx）
    const queryIndex = fullPath.indexOf('?');
    const pathWithoutQuery = queryIndex > -1 ? fullPath.substring(0, queryIndex) : fullPath;
    const fileName = pathWithoutQuery.split('/').pop();
    
    // 匹配格式：name-hash-buildId.ext 或 name-hash.ext，提取 name 和 ext
    // 支持短 hash（至少4个字符）和长 hash（8个字符以上）
    const nameMatch = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|css|mjs)$/);
    if (!nameMatch) {
      missing.push(pathWithoutQuery);
      continue;
    }
    const [, cleanName, , , ext] = nameMatch;
    const key = `${cleanName}.${ext}`;
    const actualFile = fileMap.get(key);
    
    if (actualFile) {
      const actualPath = `/assets/${actualFile}`;
      // 如果原始路径有查询参数，保留它
      const queryString = queryIndex > -1 ? fullPath.substring(queryIndex) : '';
      const finalPath = actualPath + queryString;
      
      if (fullPath !== finalPath) {
        replacements.push({ old: fullPath, new: finalPath, match: match[0] });
      }
    } else {
      missing.push(pathWithoutQuery);
    }
  }

  // 应用替换
  if (replacements.length > 0) {
    replacements.forEach(({ old, new: newPath, match: originalMatch }) => {
      htmlContent = htmlContent.replace(originalMatch, originalMatch.replace(old, newPath));
    });
    writeFileSync(indexHtmlPath, htmlContent, 'utf-8');
    console.log(`  ✅ 已修复 index.html 中的 ${replacements.length} 个资源引用`);
  }

  return { fixed: replacements.length > 0, missing };
}

/**
 * 验证并清理构建产物中的重复文件
 */
function verifyAndCleanBuildArtifacts(appDistDir, appName) {
  const assetsDir = join(appDistDir, 'assets');
  if (!existsSync(assetsDir)) {
    return { hasDuplicates: false, duplicates: [], cleaned: false };
  }

  function getAllFiles(dir, baseDir = dir, fileList = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      const relativePath = filePath.replace(baseDir + '/', '').replace(/\\/g, '/');
      if (statSync(filePath).isDirectory()) {
        getAllFiles(filePath, baseDir, fileList);
      } else if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.mjs')) {
        fileList.push({ path: filePath, relative: relativePath, name: file });
      }
    });
    return fileList;
  }

  const files = getAllFiles(assetsDir, assetsDir);
  const fileNames = new Map();

  files.forEach(file => {
    // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
    const match = file.name.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|css|mjs)$/);
    if (match) {
      const [, name, , , ext] = match;
      const key = `${name}.${ext}`;
      if (!fileNames.has(key)) {
        fileNames.set(key, []);
      }
      const mtime = statSync(file.path).mtime.getTime();
      fileNames.get(key).push({ ...file, mtime });
    }
  });

  const duplicates = [];
  let cleaned = false;
  
  fileNames.forEach((fileList, name) => {
    if (fileList.length > 1) {
      fileList.sort((a, b) => b.mtime - a.mtime);
      const latest = fileList[0];
      const oldFiles = fileList.slice(1);
      
      duplicates.push({ name, files: fileList.map(f => f.name), latest: latest.name });
      
      oldFiles.forEach(oldFile => {
        try {
          rmSync(oldFile.path, { force: true });
          cleaned = true;
        } catch (error) {
          // 忽略删除失败
        }
      });
    }
  });

  return { hasDuplicates: duplicates.length > 0, duplicates, cleaned };
}

/**
 * 验证应用构建产物
 */
function verifyAppBuild(appName) {
  const appDistDir = join(rootDir, 'apps', appName, 'dist');
  
  if (!existsSync(appDistDir)) {
    return { valid: false, errors: ['构建产物目录不存在'] };
  }

  const errors = [];
  const assetsDir = join(appDistDir, 'assets');
  
  // layout-app 的资源文件在 assets/layout/ 目录下
  const isLayoutApp = appName === 'layout-app';
  const actualAssetsDir = isLayoutApp ? join(assetsDir, 'layout') : assetsDir;

  // 收集所有实际存在的文件
  const existingFileNames = new Set();
  const fileHashMap = new Map();

  function collectFiles(dir, basePath = '') {
    if (!existsSync(dir)) {
      return;
    }
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        collectFiles(fullPath, relativePath);
      } else if (entry.isFile()) {
        existingFileNames.add(entry.name);
        // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
        // 也支持短 hash（如 module-platform-CqEuto-b.js）
        const match = entry.name.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
        if (match) {
          const [, baseName, hash, buildId, ext] = match;
          // 提取基础名称（去掉可能的短 hash 部分）
          // 例如：module-platform-CqEuto-b -> module-platform
          const baseNameParts = baseName.split('-');
          // 如果最后一部分看起来像 hash（短 hash），也提取出来
          let cleanBaseName = baseName;
          if (baseNameParts.length > 1) {
            // 尝试多种格式：module-platform-CqEuto-b 或 module-platform
            // 如果最后一部分是短 hash，去掉它
            const lastPart = baseNameParts[baseNameParts.length - 1];
            if (lastPart.length <= 8 && /^[A-Za-z0-9]+$/.test(lastPart)) {
              cleanBaseName = baseNameParts.slice(0, -1).join('-');
            }
          }
          const key = `${cleanBaseName}.${ext}`;
          if (!fileHashMap.has(key)) {
            fileHashMap.set(key, []);
          }
          fileHashMap.get(key).push({ hash, buildId, fullName: entry.name });
          // 也使用完整 baseName 作为 key（兼容性）
          if (cleanBaseName !== baseName) {
            const fullKey = `${baseName}.${ext}`;
            if (!fileHashMap.has(fullKey)) {
              fileHashMap.set(fullKey, []);
            }
            fileHashMap.get(fullKey).push({ hash, buildId, fullName: entry.name });
          }
        }
      }
    }
  }

  collectFiles(actualAssetsDir, '');

  // 检查是否有重复的 qiankun 文件
  const qiankunFiles = Array.from(existingFileNames).filter(name => name.startsWith('qiankun-'));
  if (qiankunFiles.length > 1) {
    errors.push({
      file: 'assets',
      error: `发现多个 qiankun 文件: ${qiankunFiles.join(', ')}`,
    });
  }

  // 验证所有 JS 文件中的引用
  function scanDirectory(dir, basePath = '') {
    if (!existsSync(dir)) {
      return;
    }
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const references = extractAssetReferences(fullPath, content);
          
          for (const ref of references) {
            let fileExists = false;
            
            // 首先尝试通过 resolvedPath 检查（对于相对路径）
            if (ref.resolvedPath && existsSync(ref.resolvedPath)) {
              fileExists = true;
            } else {
              // 去掉查询参数（如 ?v=xxx）
              let pathWithoutQuery = ref.path;
              const queryIndex = pathWithoutQuery.indexOf('?');
              if (queryIndex > -1) {
                pathWithoutQuery = pathWithoutQuery.substring(0, queryIndex);
              }
              
              // layout-app 的特殊处理：如果引用路径是 /assets/xxx，也检查 /assets/layout/xxx
              if (isLayoutApp && pathWithoutQuery.startsWith('/assets/') && !pathWithoutQuery.startsWith('/assets/layout/')) {
                const layoutPath = pathWithoutQuery.replace('/assets/', '/assets/layout/');
                const layoutResolvedPath = join(actualAssetsDir, layoutPath.replace('/assets/layout/', ''));
                if (existsSync(layoutResolvedPath)) {
                  fileExists = true;
                }
              }
              
              const fileName = pathWithoutQuery.split('/').pop();
              if (fileName) {
                // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
                // 关键：需要处理两种情况：
                // 1. 旧文件名（没有构建 ID）：vue-core-CXAVbLNX.js -> 提取 vue-core
                // 2. 新文件名（有构建 ID）：vue-core-CXAVbLNX-miq4m7r1.js -> 提取 vue-core
                const match = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
                if (match) {
                  const [, baseName, , , ext] = match;
                  const key = `${baseName}.${ext}`;
                  const possibleFiles = fileHashMap.get(key);
                  if (possibleFiles && possibleFiles.length > 0) {
                    fileExists = true;
                  } else {
                    // 如果通过 baseName 找不到，尝试通过文件名前缀匹配
                    // 例如：vue-core-CXAVbLNX.js 应该匹配 vue-core-CXAVbLNX-miq4m7r1.js
                    const fileNameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, '');
                    for (const existingName of existingFileNames) {
                      if (existingName.startsWith(fileNameWithoutExt + '-') && existingName.endsWith('.' + ext)) {
                        fileExists = true;
                        break;
                      }
                    }
                  }
                } else {
                  // 如果正则不匹配，可能是文件名格式不标准（如 module-platform-CqEuto-b.js）
                  // 尝试通过文件名前缀匹配（忽略 hash 和 buildId）
                  const fileNameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, '');
                  const ext = fileName.split('.').pop();
                  
                  // 尝试多种匹配策略
                  // 1. 尝试匹配短 hash 格式（如 module-platform-CqEuto-b）
                  const shortHashMatch = fileNameWithoutExt.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?$/);
                  if (shortHashMatch) {
                    const [, baseName, , ] = shortHashMatch;
                    // 提取基础名称（去掉可能的短 hash 部分）
                    const baseNameParts = baseName.split('-');
                    let cleanBaseName = baseName;
                    if (baseNameParts.length > 1) {
                      const lastPart = baseNameParts[baseNameParts.length - 1];
                      if (lastPart.length <= 8 && /^[A-Za-z0-9]+$/.test(lastPart)) {
                        cleanBaseName = baseNameParts.slice(0, -1).join('-');
                      }
                    }
                    const key = `${cleanBaseName}.${ext}`;
                    const possibleFiles = fileHashMap.get(key);
                    if (possibleFiles && possibleFiles.length > 0) {
                      fileExists = true;
                    } else {
                      // 也尝试使用完整 baseName
                      const fullKey = `${baseName}.${ext}`;
                      const fullPossibleFiles = fileHashMap.get(fullKey);
                      if (fullPossibleFiles && fullPossibleFiles.length > 0) {
                        fileExists = true;
                      }
                    }
                  }
                  
                  // 2. 如果还没找到，尝试直接查找文件名（完全匹配）
                  if (!fileExists && existingFileNames.has(fileName)) {
                    fileExists = true;
                  }
                  
                  // 3. 如果还没找到，尝试通过文件名前缀查找
                  if (!fileExists) {
                    // 提取前缀（去掉可能的 hash 部分）
                    const parts = fileNameWithoutExt.split('-');
                    // 尝试不同的前缀长度
                    for (let i = Math.max(1, parts.length - 3); i < parts.length; i++) {
                      const prefix = parts.slice(0, i).join('-');
                      for (const existingName of existingFileNames) {
                        if (existingName.startsWith(prefix + '-') && existingName.endsWith('.' + ext)) {
                          fileExists = true;
                          break;
                        }
                      }
                      if (fileExists) break;
                    }
                  }
                }
              }
            }
            
            if (!fileExists) {
              errors.push({
                file: relativePath,
                reference: ref.path,
                type: ref.type,
              });
            }
          }
        } catch (error) {
          errors.push({
            file: relativePath,
            error: `读取文件失败: ${error.message}`,
          });
        }
      } else if (entry.isFile() && entry.name === 'index.html') {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const references = extractAssetReferences(fullPath, content);
          
          for (const ref of references) {
            let fileExists = false;
            
            if (ref.resolvedPath && existsSync(ref.resolvedPath)) {
              fileExists = true;
            } else {
              // 去掉查询参数（如 ?v=xxx）
              let pathWithoutQuery = ref.path;
              const queryIndex = pathWithoutQuery.indexOf('?');
              if (queryIndex > -1) {
                pathWithoutQuery = pathWithoutQuery.substring(0, queryIndex);
              }
              
              // layout-app 的特殊处理：如果引用路径是 /assets/xxx，也检查 /assets/layout/xxx
              if (isLayoutApp && pathWithoutQuery.startsWith('/assets/') && !pathWithoutQuery.startsWith('/assets/layout/')) {
                const layoutPath = pathWithoutQuery.replace('/assets/', '/assets/layout/');
                const layoutResolvedPath = join(actualAssetsDir, layoutPath.replace('/assets/layout/', ''));
                if (existsSync(layoutResolvedPath)) {
                  fileExists = true;
                }
              }
              
              const fileName = pathWithoutQuery.split('/').pop();
              if (fileName) {
                // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
                // 关键：需要处理两种情况：
                // 1. 旧文件名（没有构建 ID）：vue-core-CXAVbLNX.js -> 提取 vue-core
                // 2. 新文件名（有构建 ID）：vue-core-CXAVbLNX-miq4m7r1.js -> 提取 vue-core
                const match = fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
                if (match) {
                  const [, baseName, , , ext] = match;
                  const key = `${baseName}.${ext}`;
                  const possibleFiles = fileHashMap.get(key);
                  if (possibleFiles && possibleFiles.length > 0) {
                    fileExists = true;
                  } else {
                    // 如果通过 baseName 找不到，尝试通过文件名前缀匹配
                    // 例如：vue-core-CXAVbLNX.js 应该匹配 vue-core-CXAVbLNX-miq4m7r1.js
                    const fileNameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, '');
                    for (const existingName of existingFileNames) {
                      if (existingName.startsWith(fileNameWithoutExt + '-') && existingName.endsWith('.' + ext)) {
                        fileExists = true;
                        break;
                      }
                    }
                  }
                } else {
                  // 如果正则不匹配，尝试直接查找文件名
                  if (existingFileNames.has(fileName)) {
                    fileExists = true;
                  } else {
                    // 也尝试通过文件名前缀匹配（去掉可能的构建 ID）
                    const fileNameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, '');
                    const ext = fileName.split('.').pop();
                    // 尝试去掉最后一个连字符后的部分（可能是构建 ID）
                    const parts = fileNameWithoutExt.split('-');
                    for (let i = parts.length - 1; i >= Math.max(1, parts.length - 2); i--) {
                      const prefix = parts.slice(0, i).join('-');
                      for (const existingName of existingFileNames) {
                        if (existingName.startsWith(prefix + '-') && existingName.endsWith('.' + ext)) {
                          fileExists = true;
                          break;
                        }
                      }
                      if (fileExists) break;
                    }
                  }
                }
              }
            }
            
            if (!fileExists) {
              errors.push({
                file: 'index.html',
                reference: ref.path,
                type: ref.type,
              });
            }
          }
        } catch (error) {
          errors.push({
            file: 'index.html',
            error: `读取文件失败: ${error.message}`,
          });
        }
      }
    }
  }

  scanDirectory(appDistDir);

  return { valid: errors.length === 0, errors };
}

/**
 * 验证并自动修复应用构建产物
 */
function verifyAndAutoFixApp(appName) {
  const appDistDir = join(rootDir, 'apps', appName, 'dist');
  
  if (!existsSync(appDistDir)) {
    return { valid: false, fixed: false, errors: ['构建产物目录不存在'] };
  }

  console.log(`  🔍 开始验证和修复 ${appName}...`);

  // 1. 清理重复文件
  const verification = verifyAndCleanBuildArtifacts(appDistDir, appName);
  if (verification.hasDuplicates) {
    console.log(`  ⚠️  ${appName} 构建产物有重复文件，已自动清理`);
    if (verification.cleaned) {
      // 清理后修复引用
      verifyAndFixJsReferences(appDistDir, appName);
      verifyAndFixIndexHtml(appDistDir, appName);
    }
  }

  // 2. 修复引用（始终执行，确保所有引用都正确）
  // 关键：即使构建时插件已经修复了，这里也要再次修复，因为可能有遗漏
  console.log(`  🔧 检查并修复 ${appName} 中的资源引用...`);
  const fixResult = verifyAndFixJsReferences(appDistDir, appName);
  const fixHtmlResult = verifyAndFixIndexHtml(appDistDir, appName);
  
  const wasFixed = fixResult.fixed || fixHtmlResult.fixed;
  if (wasFixed) {
    console.log(`  ✅ ${appName} 已自动修复引用问题`);
  } else {
    console.log(`  ℹ️  ${appName} 未发现需要修复的引用`);
  }

  // 3. 验证（修复后重新验证）
  const result = verifyAppBuild(appName);
  
  if (!result.valid) {
    if (wasFixed) {
      console.log(`  ⚠️  ${appName} 修复后仍有 ${result.errors.length} 个问题，可能需要重新构建`);
    } else {
      console.log(`  ❌ ${appName} 发现 ${result.errors.length} 个问题，但无法自动修复`);
    }
  }
  
  return result;
}

/**
 * 构建并验证单个应用（带重试机制）
 */
function buildAndVerifyApp(appName, retryCount = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 处理应用: ${appName}${retryCount > 0 ? ` (重试 ${retryCount}/${MAX_RETRIES})` : ''}`);
  console.log('='.repeat(60));

  // 构建应用
  const buildSuccess = buildApp(appName);
  if (!buildSuccess) {
    if (retryCount < MAX_RETRIES) {
      console.log(`\n🔄 ${appName} 构建失败，清理缓存并重试...`);
      cleanSingleApp(appName);
      return buildAndVerifyApp(appName, retryCount + 1);
    } else {
      console.error(`\n❌ ${appName} 构建失败，已达到最大重试次数`);
      return { success: false, valid: false };
    }
  }

  // 构建后立即验证
  console.log(`\n🔍 验证 ${appName} 构建产物...`);
  const verifyResult = verifyAndAutoFixApp(appName);

  if (!verifyResult.valid) {
    if (retryCount < MAX_RETRIES) {
      console.log(`\n🔄 ${appName} 验证失败，清理缓存并重新构建...`);
      console.log(`   错误: ${verifyResult.errors.length} 个问题`);
      cleanSingleApp(appName);
      return buildAndVerifyApp(appName, retryCount + 1);
    } else {
      console.error(`\n❌ ${appName} 验证失败，已达到最大重试次数`);
      console.error(`   错误详情:`);
      verifyResult.errors.slice(0, 5).forEach((error, index) => {
        console.error(`     ${index + 1}. ${error.file}: ${error.reference || error.error}`);
      });
      if (verifyResult.errors.length > 5) {
        console.error(`     ... 还有 ${verifyResult.errors.length - 5} 个错误`);
      }
      return { success: true, valid: false, errors: verifyResult.errors };
    }
  }

  console.log(`\n✅ ${appName} 构建和验证通过`);
  return { success: true, valid: true };
}

/**
 * 复制应用构建产物到 dist 目录
 */
function copyAppDist(appName, domain) {
  const appDistDir = join(rootDir, 'apps', appName, 'dist');
  
  if (!existsSync(appDistDir)) {
    console.error(`  ⚠️  警告: ${appName} 的构建产物目录不存在`);
    return false;
  }

  const targetDir = join(ROOT_DIST_DIR, domain);

  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }

  console.log(`  📦 复制 ${appName} 产物到 dist/${domain}...`);
  try {
    cpSync(appDistDir, targetDir, {
      recursive: true,
      force: true,
    });
    
    // 检查并复制 EPS 数据到 dist 目录（如果存在）
    const epsDir = join(rootDir, 'apps', appName, 'build', 'eps');
    if (existsSync(epsDir) && readdirSync(epsDir).length > 0) {
      const targetEpsDir = join(targetDir, 'build', 'eps');
      if (!existsSync(join(targetDir, 'build'))) {
        const fs = require('fs');
        fs.mkdirSync(join(targetDir, 'build'), { recursive: true });
      }
      cpSync(epsDir, targetEpsDir, {
        recursive: true,
        force: true,
      });
      console.log(`  ✅ EPS 数据已复制到 dist/${domain}/build/eps`);
    }
    
    console.log(`  ✅ ${appName} 产物已复制到 dist/${domain}\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ 复制 ${appName} 产物失败:`, error.message);
    return false;
  }
}

/**
 * 使用 Turbo 构建所有包和应用（包括共享包）
 */
function buildAllPackages() {
  console.log('🔨 使用 Turbo 构建所有包和应用（包括共享包）...\n');
  console.log('  ⚠️  使用 --force --no-cache 强制重新构建，不使用缓存\n');
  try {
    const turboScript = join(rootDir, 'scripts', 'turbo.js');
    execSync(`node ${turboScript} run build --force --no-cache`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('  ✅ 所有包和应用构建完成\n');
    return true;
  } catch (error) {
    console.error('  ❌ Turbo 构建失败:', error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始构建所有应用并复制到 dist 目录...\n');
  console.log('='.repeat(60));
  console.log('');

  // 生成全局构建时间戳（所有应用共享）
  // 使用36进制编码，生成更短的版本号（包含字母和数字，如 l3k2j1h）
  const buildTimestamp = Date.now().toString(36);
  process.env.BTC_BUILD_TIMESTAMP = buildTimestamp;
  console.log(`📅 全局构建时间戳: ${buildTimestamp}\n`);

  // 第一步：统一清理所有缓存和旧文件
  cleanAppDistDirs();
  cleanTurboCache();
  cleanPackagesCache();
  prepareDistDir();

  const results = {
    built: [],
    failed: [],
    copied: [],
    copyFailed: [],
    validationErrors: [],
  };

  // 第二步：先构建共享包（使用 Turbo）
  console.log('\n' + '='.repeat(60));
  console.log('📦 构建共享包...');
  console.log('='.repeat(60));
  
  try {
    const turboScript = join(rootDir, 'scripts', 'turbo.js');
    execSync(`node ${turboScript} run build --force --no-cache --filter=@btc/vite-plugin --filter=@btc/shared-utils --filter=@btc/shared-core --filter=@btc/shared-components --filter=@btc/subapp-manifests`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('  ✅ 共享包构建完成\n');
  } catch (error) {
    console.error('  ❌ 共享包构建失败:', error.message);
    process.exit(1);
  }

  // 第三步：逐个构建、验证和修复每个应用
  // 关键：每个应用构建后立即验证和修复，而不是一次性构建所有应用
  console.log('\n' + '='.repeat(60));
  console.log('📋 逐个构建、验证和修复应用...');
  console.log('='.repeat(60));

  for (const appName of BUILD_ORDER) {
    if (!APP_DOMAIN_MAP[appName]) {
      continue;
    }

    const result = buildAndVerifyApp(appName);
    
    if (result.success && result.valid) {
      results.built.push(appName);
    } else {
      results.failed.push(appName);
      if (result.errors) {
        results.validationErrors.push({ app: appName, errors: result.errors });
      }
    }
  }

  // 第四步：复制验证通过的应用到 dist 目录
  console.log('\n' + '='.repeat(60));
  console.log('📋 复制构建产物到 dist 目录...');
  console.log('='.repeat(60));

  for (const appName of BUILD_ORDER) {
    const domain = APP_DOMAIN_MAP[appName];
    if (!domain) {
      continue;
    }

    if (results.built.includes(appName)) {
      const success = copyAppDist(appName, domain);
      if (success) {
        results.copied.push(appName);
      } else {
        results.copyFailed.push(appName);
      }
    }
  }

  // 输出总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 构建总结');
  console.log('='.repeat(60));
  console.log(`✅ 成功构建: ${results.built.length} 个应用`);
  if (results.built.length > 0) {
    console.log(`   ${results.built.join(', ')}`);
  }
  console.log(`📦 成功复制: ${results.copied.length} 个应用`);
  if (results.copied.length > 0) {
    console.log(`   ${results.copied.map(app => `${app} → dist/${APP_DOMAIN_MAP[app]}`).join(', ')}`);
  }
  if (results.failed.length > 0) {
    console.log(`\n❌ 构建失败: ${results.failed.length} 个应用`);
    console.log(`   ${results.failed.join(', ')}`);
  }
  if (results.copyFailed.length > 0) {
    console.log(`\n⚠️  复制失败: ${results.copyFailed.length} 个应用`);
    console.log(`   ${results.copyFailed.join(', ')}`);
  }
  if (results.validationErrors.length > 0) {
    console.log(`\n❌ 验证失败: ${results.validationErrors.length} 个应用`);
    results.validationErrors.forEach(({ app, errors }) => {
      console.log(`   ${app}: ${errors.length} 个错误`);
    });
  }
  console.log('\n' + '='.repeat(60));
  console.log(`\n📁 所有产物已复制到: ${ROOT_DIST_DIR}\n`);

  // 如果有失败，退出码为 1
  if (results.failed.length > 0 || results.copyFailed.length > 0 || results.validationErrors.length > 0) {
    console.error('\n❌ 构建过程中发现问题，请检查上述错误信息');
    process.exit(1);
  }

  console.log('✅ 所有应用构建、验证和复制完成！\n');
}

// 运行主函数
main();
