#!/usr/bin/env node

/**
 * 验证移动端应用构建产物是否包含一键登录功能
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'apps', 'mobile-app', 'dist');

console.log('🔍 检查移动端应用构建产物...\n');

// 检查构建产物目录
if (!fs.existsSync(distPath)) {
  console.error('❌ 构建产物目录不存在:', distPath);
  console.log('请先运行: pnpm --filter mobile-app build');
  process.exit(1);
}

// 检查关键文件
const keyFiles = [
  'index.html',
  'sw.js',
  'manifest.webmanifest'
];

console.log('📁 检查关键文件:');
keyFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ✗ ${file} (不存在)`);
  }
});

// 检查 Login 组件文件
console.log('\n📦 检查 Login 组件:');
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js') && f.includes('Login'));
  if (jsFiles.length > 0) {
    console.log(`  找到 ${jsFiles.length} 个 Login 相关文件:`);
    jsFiles.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 检查是否包含关键代码
      const hasNumberAuth = content.includes('getNumberAuthConfig') || 
                           content.includes('loginByNumberAuth') ||
                           content.includes('NumberAuth') ||
                           content.includes('numberAuth');
      
      const hasOneClick = content.includes('handleOneClickLogin') ||
                         content.includes('oneClickLoading') ||
                         content.includes('triggerOneClick');
      
      console.log(`    ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`      - 号码认证 API: ${hasNumberAuth ? '✓' : '✗'}`);
      console.log(`      - 一键登录逻辑: ${hasOneClick ? '✓' : '✗'}`);
    });
  } else {
    console.log('  ✗ 未找到 Login 组件文件');
  }
} else {
  console.log('  ✗ assets 目录不存在');
}

// 检查 index.html
console.log('\n📄 检查 index.html:');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8');
  const hasLoginScript = content.includes('Login') && content.includes('.js');
  console.log(`  - 引用 Login 组件: ${hasLoginScript ? '✓' : '✗'}`);
  
  // 检查是否有 Service Worker
  const hasSW = content.includes('sw.js') || content.includes('serviceWorker');
  console.log(`  - Service Worker: ${hasSW ? '✓' : '✗'}`);
} else {
  console.log('  ✗ index.html 不存在');
}

console.log('\n✅ 检查完成！');
console.log('\n💡 如果发现缺少关键代码，请：');
console.log('  1. 清理构建缓存: pnpm --filter mobile-app clean:cache');
console.log('  2. 重新构建: pnpm --filter mobile-app build');
console.log('  3. 重新部署: pnpm build-deploy:static:all');

