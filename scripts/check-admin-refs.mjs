#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const assetsDir = join(rootDir, 'apps', 'admin-app', 'dist', 'assets');

console.log('🔍 检查管理应用构建产物中的所有引用...\n');

if (!existsSync(assetsDir)) {
  console.error('❌ assets 目录不存在');
  process.exit(1);
}

// 获取所有文件
const files = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
console.log(`📁 找到 ${files.length} 个 JS 文件\n`);

// 检查每个文件中的引用
const allRefs = new Map();
const missingRefs = [];

for (const file of files) {
  const filePath = join(assetsDir, file);
  const content = readFileSync(filePath, 'utf-8');
  
  // 查找所有 /assets/xxx.js 引用
  const assetRefs = content.match(/\/assets\/[a-zA-Z0-9_-]+\.js/g) || [];
  // 查找所有 import() 引用
  const importRefs = content.match(/import\(['"]([^'"]+)['"]\)/g) || [];
  // 查找所有字符串中的引用
  const stringRefs = content.match(/['"]\/assets\/[^'"]+\.js['"]/g) || [];
  
  const refs = [...assetRefs, ...importRefs.map(r => r.match(/['"]([^'"]+)['"]/)?.[1]).filter(Boolean), ...stringRefs.map(r => r.slice(1, -1))];
  
  if (refs.length > 0) {
    allRefs.set(file, refs);
    
    // 检查每个引用是否存在
    for (const ref of refs) {
      const fileName = ref.split('/').pop();
      if (!files.includes(fileName)) {
        missingRefs.push({ file, ref, fileName });
      }
    }
  }
}

console.log('📊 引用统计:');
console.log(`  总文件数: ${files.length}`);
console.log(`  有引用的文件: ${allRefs.size}`);
console.log(`  总引用数: ${Array.from(allRefs.values()).flat().length}`);
console.log(`  缺失引用: ${missingRefs.length}\n`);

if (missingRefs.length > 0) {
  console.log('❌ 发现缺失的引用:');
  missingRefs.slice(0, 20).forEach(({ file, ref, fileName }, i) => {
    console.log(`  ${i + 1}. ${file}`);
    console.log(`     引用: ${ref}`);
    console.log(`     缺失文件: ${fileName}`);
    
    // 尝试找到相似的文件
    const baseName = fileName.replace(/-[A-Za-z0-9]{8,}\.js$/, '');
    const similar = files.filter(f => f.startsWith(baseName));
    if (similar.length > 0) {
      console.log(`     ⚠️  可能应该是: ${similar.join(', ')}`);
    }
    console.log('');
  });
  
  if (missingRefs.length > 20) {
    console.log(`  ... 还有 ${missingRefs.length - 20} 个缺失引用\n`);
  }
  
  process.exit(1);
} else {
  console.log('✅ 所有引用都有效！\n');
  
  // 显示一些引用示例
  console.log('📋 引用示例（前 10 个文件）:');
  let count = 0;
  for (const [file, refs] of allRefs.entries()) {
    if (count >= 10) break;
    console.log(`  ${file}: ${refs.length} 个引用`);
    refs.slice(0, 3).forEach(ref => {
      const fileName = ref.split('/').pop();
      const exists = files.includes(fileName);
      console.log(`    ${exists ? '✅' : '❌'} ${ref}`);
    });
    count++;
  }
  
  process.exit(0);
}

