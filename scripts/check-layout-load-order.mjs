#!/usr/bin/env node

/**
 * 检查 layout-app 的加载顺序和依赖关系
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const layoutDistDir = resolve(rootDir, 'apps', 'layout-app', 'dist');
const manifestPath = resolve(layoutDistDir, 'manifest.json');
const indexHtmlPath = resolve(layoutDistDir, 'index.html');

// 读取 manifest.json
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// 读取 index.html
const indexHtml = readFileSync(indexHtmlPath, 'utf-8');

console.log('=== Layout App 加载顺序检查 ===\n');

// 1. 检查 manifest.json 中的 imports 字段
console.log('1. Manifest.json 中的 imports 字段:');
let hasImports = false;
for (const [key, entry] of Object.entries(manifest)) {
  if (entry.imports && entry.imports.length > 0) {
    hasImports = true;
    console.log(`   ${key}:`);
    entry.imports.forEach(imp => {
      console.log(`     - ${imp}`);
    });
  }
}
if (!hasImports) {
  console.log('   ⚠️  没有找到 imports 字段（可能需要在构建时提取）');
}
console.log('');

// 2. 检查 index.html 中的加载顺序
console.log('2. Index.html 中的加载顺序:');
const scriptMatches = indexHtml.matchAll(/import\(['"]([^'"]+)['"]\)/g);
const htmlLoadOrder = [];
for (const match of scriptMatches) {
  const url = match[1];
  const fileName = url.substring(url.lastIndexOf('/') + 1);
  htmlLoadOrder.push(fileName);
  console.log(`   ${htmlLoadOrder.length}. ${fileName}`);
}
console.log('');

// 3. 检查正确的加载顺序（根据优先级）
console.log('3. 正确的加载顺序（根据优先级）:');
const files = Object.values(manifest).map(entry => ({
  file: entry.file,
  priority: getPriority(entry.file),
  isEntry: entry.isEntry || false,
}));

files.sort((a, b) => a.priority - b.priority);

files.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.file} (优先级: ${file.priority}, 入口: ${file.isEntry})`);
});
console.log('');

// 4. 检查静态导入关系
console.log('4. 静态导入关系:');
const assetsDir = resolve(layoutDistDir, 'assets');
const indexFile = files.find(f => f.file.includes('index-DJgeuTfS'));
if (indexFile) {
  const indexContent = readFileSync(resolve(assetsDir, indexFile.file.replace('assets/', '')), 'utf-8');
  const staticImports = indexContent.match(/^import.*from\s+["']\.\/([^"']+)["']/gm);
  if (staticImports) {
    staticImports.forEach(imp => {
      const match = imp.match(/from\s+["']\.\/([^"']+)["']/);
      if (match) {
        console.log(`   ${indexFile.file} -> ${match[1]}`);
      }
    });
  }
}
console.log('');

// 5. 检查动态导入
console.log('5. 动态导入（在 index-DJgeuTfS 中）:');
if (indexFile) {
  const indexContent = readFileSync(resolve(assetsDir, indexFile.file.replace('assets/', '')), 'utf-8');
  const dynamicImports = indexContent.matchAll(/import\(["']\.\/([^"']+)["']\)/g);
  const dynamicFiles = new Set();
  for (const match of dynamicImports) {
    dynamicFiles.add(match[1]);
  }
  dynamicFiles.forEach(file => {
    console.log(`   ${file}`);
  });
}
console.log('');

// 6. 验证加载顺序是否正确
console.log('6. 加载顺序验证:');
const expectedOrder = files.map(f => f.file.replace('assets/', ''));
const actualOrder = htmlLoadOrder;

let isCorrect = true;
if (expectedOrder.length !== actualOrder.length) {
  isCorrect = false;
  console.log(`   ⚠️  文件数量不匹配: 期望 ${expectedOrder.length}，实际 ${actualOrder.length}`);
} else {
  for (let i = 0; i < expectedOrder.length; i++) {
    if (expectedOrder[i] !== actualOrder[i]) {
      isCorrect = false;
      console.log(`   ❌ 位置 ${i + 1} 不匹配:`);
      console.log(`      期望: ${expectedOrder[i]}`);
      console.log(`      实际: ${actualOrder[i]}`);
    }
  }
}

if (isCorrect) {
  console.log('   ✅ 加载顺序正确');
} else {
  console.log('   ⚠️  加载顺序需要调整');
}

function getPriority(fileName) {
  if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
    return 1;
  } else if (fileName.includes('echarts-vendor')) {
    return 2;
  } else if (fileName.includes('menu-registry') ||
             fileName.includes('eps-service') ||
             fileName.includes('auth-api')) {
    return 3;
  } else if (fileName.includes('index-') || fileName.includes('main-')) {
    return 4;
  }
  return 999;
}

