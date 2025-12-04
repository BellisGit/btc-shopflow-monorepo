#!/usr/bin/env node

/**
 * 验证构建产物中的资源引用
 * 检查所有引用的文件是否存在，如果不存在则报错并退出
 */

import { existsSync, readFileSync, readdirSync, rmSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

/**
 * 从文件中提取所有资源引用
 */
function extractAssetReferences(filePath, content) {
  const references = [];
  const assetsDir = join(dirname(filePath), 'assets');
  
  // 匹配 import() 动态导入（包括单引号和双引号）
  // 也匹配字符串中的路径（可能是运行时动态加载）
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const ref = match[1];
    // 跳过 node_modules 和虚拟模块
    if (ref.includes('node_modules') || ref.startsWith('virtual:') || ref.startsWith('@')) {
      continue;
    }
    // 处理相对路径
    if (ref.startsWith('./') || ref.startsWith('../')) {
      const resolvedPath = resolve(dirname(filePath), ref);
      references.push({ type: 'dynamic-import', path: ref, resolvedPath });
    } else if (ref.startsWith('/assets/')) {
      references.push({ type: 'dynamic-import', path: ref, resolvedPath: join(assetsDir, ref.replace('/assets/', '')) });
    }
  }
  
  // 匹配字符串中的绝对路径（可能是运行时动态加载）
  // 例如：fetch('/assets/xxx.js') 或 new URL('/assets/xxx.js')
  const absolutePathRegex = /['"](?:\/assets\/[^'"]+\.(?:js|mjs|css))['"]/g;
  while ((match = absolutePathRegex.exec(content)) !== null) {
    const ref = match[1] || match[0].slice(1, -1); // 提取路径
    if (ref.startsWith('/assets/')) {
      references.push({ type: 'runtime-path', path: ref, resolvedPath: join(assetsDir, ref.replace('/assets/', '')) });
    }
  }
  
  // 匹配 import 语句（包括 export from）
  const importRegex = /(?:import|export).*?from\s+['"]([^'"]+)['"]/g;
  while ((match = importRegex.exec(content)) !== null) {
    const ref = match[1];
    // 跳过 node_modules 和虚拟模块
    if (ref.startsWith('@') || ref.includes('node_modules') || ref.startsWith('virtual:')) {
      continue;
    }
    // 处理相对路径
    if (ref.startsWith('./') || ref.startsWith('../')) {
      const resolvedPath = resolve(dirname(filePath), ref);
      references.push({ type: 'import', path: ref, resolvedPath });
    } else if (ref.startsWith('/assets/')) {
      references.push({ type: 'import', path: ref, resolvedPath: join(assetsDir, ref.replace('/assets/', '')) });
    }
  }
  
  // 匹配 HTML 中的资源引用（href 和 src）
  const htmlRegex = /(?:href|src)=["']([^"']+)["']/g;
  while ((match = htmlRegex.exec(content)) !== null) {
    const ref = match[1];
    // 跳过 data: 和 blob: URL
    if (ref.startsWith('data:') || ref.startsWith('blob:') || ref.startsWith('http://') || ref.startsWith('https://')) {
      continue;
    }
    // 处理相对路径
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
 * 验证单个应用的构建产物
 */
function verifyAppBuild(appName) {
  const appDistDir = join(rootDir, 'apps', appName, 'dist');
  
  if (!existsSync(appDistDir)) {
    console.error(`❌ ${appName}: 构建产物目录不存在: ${appDistDir}`);
    return { valid: false, errors: [`构建产物目录不存在`] };
  }
  
  const errors = [];
  const assetsDir = join(appDistDir, 'assets');
  
  // 读取所有 JS 文件
  const jsFiles = [];
  const htmlFiles = [];
  
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
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
          jsFiles.push({ path: fullPath, relativePath });
        } else if (entry.name === 'index.html') {
          htmlFiles.push({ path: fullPath, relativePath });
        }
      }
    }
  }
  
  scanDirectory(appDistDir);
  
  // 收集所有实际存在的文件（包括文件名和 hash）
  const existingFiles = new Set();
  const existingFileNames = new Set(); // 用于快速查找
  const fileHashMap = new Map(); // baseName -> [all hashes]
  
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
        existingFiles.add(fullPath);
        existingFileNames.add(entry.name);
        // 也记录相对路径（从 dist 目录开始）
        const relativeFromDist = join('assets', relativePath).replace(/\\/g, '/');
        existingFiles.add(relativeFromDist);
        
        // 提取文件名和 hash，建立映射
        const match = entry.name.match(/^(.+?)-([A-Za-z0-9]{8,})\.(js|mjs|css)$/);
        if (match) {
          const [, baseName, hash, ext] = match;
          const key = `${baseName}.${ext}`;
          if (!fileHashMap.has(key)) {
            fileHashMap.set(key, []);
          }
          fileHashMap.get(key).push({ hash, fullName: entry.name });
        }
      }
    }
  }
  
  collectFiles(assetsDir, '');
  
  // 检查是否有重复的 qiankun 文件（不同 hash）
  // 如果有多个 qiankun 文件，说明可能有旧的构建产物残留
  const qiankunFiles = Array.from(existingFileNames).filter(name => name.startsWith('qiankun-'));
  if (qiankunFiles.length > 1) {
    errors.push({
      file: 'assets',
      error: `发现多个 qiankun 文件（可能是旧的构建产物）: ${qiankunFiles.join(', ')}`,
      message: `请清理旧的构建产物并重新构建。运行: cd apps/${appName} && pnpm clean && pnpm build`,
    });
  }
  
  // 注意：不再硬编码检查特定的 hash，因为如果文件内容没有变化，hash 相同是正常的
  // 验证脚本应该检查的是文件引用是否正确，而不是 hash 是否"旧"
  
  // 验证所有 JS 文件中的引用
  for (const jsFile of jsFiles) {
    try {
      const content = readFileSync(jsFile.path, 'utf-8');
      const references = extractAssetReferences(jsFile.path, content);
      
      for (const ref of references) {
        // 检查文件是否存在
        let fileExists = false;
        let actualFileName = null;
        
        if (ref.resolvedPath) {
          // 检查绝对路径
          if (existsSync(ref.resolvedPath)) {
            fileExists = true;
            actualFileName = ref.resolvedPath.split(/[/\\]/).pop();
          } else {
            // 检查相对路径（从 assets 目录开始）
            const relativeFromAssets = ref.path.replace(/^\.\//, '').replace(/^\/assets\//, '');
            const assetPath = join(assetsDir, relativeFromAssets);
            if (existsSync(assetPath)) {
              fileExists = true;
              actualFileName = relativeFromAssets.split(/[/\\]/).pop();
            } else {
              // 尝试通过文件名（忽略 hash）查找
              const fileName = relativeFromAssets.split(/[/\\]/).pop();
              if (fileName) {
                // 提取文件名（不含 hash）
                const match = fileName.match(/^(.+?)-([A-Za-z0-9]{8,})\.(js|mjs|css)$/);
                if (match) {
                  const [, baseName, , ext] = match;
                  // 查找所有匹配的文件
                  for (const existingName of existingFileNames) {
                    if (existingName.startsWith(`${baseName}-`) && existingName.endsWith(`.${ext}`)) {
                      fileExists = true;
                      actualFileName = existingName;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        
        if (!fileExists) {
          errors.push({
            file: jsFile.relativePath,
            reference: ref.path,
            type: ref.type,
            message: actualFileName 
              ? `引用的文件不存在: ${ref.path}（实际文件可能是: ${actualFileName}）`
              : `引用的文件不存在: ${ref.path}`,
          });
        }
      }
    } catch (error) {
      errors.push({
        file: jsFile.relativePath,
        error: `读取文件失败: ${error.message}`,
      });
    }
  }
  
  // 验证 HTML 文件中的引用
  for (const htmlFile of htmlFiles) {
    try {
      const content = readFileSync(htmlFile.path, 'utf-8');
      const references = extractAssetReferences(htmlFile.path, content);
      
      for (const ref of references) {
        // 检查文件是否存在
        let fileExists = false;
        
        if (ref.resolvedPath) {
          // 检查绝对路径
          if (existsSync(ref.resolvedPath)) {
            fileExists = true;
          } else {
            // 检查相对路径（从 assets 目录开始）
            const relativeFromAssets = ref.path.replace(/^\.\//, '').replace(/^\/assets\//, '');
            const assetPath = join(assetsDir, relativeFromAssets);
            if (existsSync(assetPath)) {
              fileExists = true;
            }
          }
        }
        
        if (!fileExists) {
          errors.push({
            file: htmlFile.relativePath,
            reference: ref.path,
            type: ref.type,
          });
        }
      }
    } catch (error) {
      errors.push({
        file: htmlFile.relativePath,
        error: `读取文件失败: ${error.message}`,
      });
    }
  }
  
  if (errors.length > 0) {
    // 检查是否已经自动清理过
    const wasCleaned = errors.some(e => e.message && e.message.includes('将自动清理'));
    
    if (!wasCleaned) {
      console.error(`\n❌ ${appName}: 发现 ${errors.length} 个资源引用错误:`);
      errors.forEach((error, index) => {
        console.error(`  ${index + 1}. 文件: ${error.file}`);
        if (error.reference) {
          console.error(`     引用: ${error.reference} (类型: ${error.type})`);
        }
        if (error.message) {
          console.error(`     错误: ${error.message}`);
        }
        if (error.error) {
          console.error(`     错误: ${error.error}`);
        }
      });
      console.error(`\n💡 提示: 这通常是因为旧的构建产物没有被完全清理。`);
      console.error(`   请运行: cd apps/${appName} && pnpm clean && pnpm build\n`);
    }
    
    return { valid: false, errors };
  }
  
  console.log(`✅ ${appName}: 所有资源引用验证通过`);
  return { valid: true, errors: [] };
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const appName = args[0]; // 如果提供了应用名称，只验证该应用
  
  if (appName) {
    // 验证单个应用
    const result = verifyAppBuild(appName);
    if (!result.valid) {
      process.exit(1);
    }
  } else {
    // 验证所有应用
    const apps = [
      'system-app',
      'admin-app',
      'logistics-app',
      'quality-app',
      'production-app',
      'engineering-app',
      'finance-app',
      'monitor-app',
      'layout-app',
    ];
    
    let hasErrors = false;
    
    for (const app of apps) {
      const result = verifyAppBuild(app);
      if (!result.valid) {
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      console.error('\n❌ 构建验证失败：存在资源引用错误');
      process.exit(1);
    } else {
      console.log('\n✅ 所有应用的构建验证通过');
    }
  }
}

main();

