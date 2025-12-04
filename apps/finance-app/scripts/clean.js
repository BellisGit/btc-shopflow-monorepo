/**
 * 清理构建产物和缓存
 * 确保每次构建都从干净的状态开始，避免 hash 不匹配的问题
 */

import { existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = join(__dirname, '..');

const pathsToClean = [
  // 构建输出目录（必须清理，确保构建前完全干净）
  join(appDir, 'dist'),
  // Vite 缓存目录（清理缓存，避免使用旧的 hash）
  // 注意：需要清理所有可能的 Vite 缓存位置
  join(appDir, 'node_modules', '.vite'),
  join(appDir, '.vite'),
  // Vite 构建缓存（如果存在）
  join(appDir, 'node_modules', '.vite', 'build'),
  // 可能的其他缓存位置
  join(appDir, 'node_modules', '.cache'),
  join(appDir, '.cache'),
];

console.log('🧹 正在清理财务应用的构建产物和缓存...\n');
console.log(`   工作目录: ${appDir}\n`);

let cleanedCount = 0;

const distDir = join(appDir, 'dist');
if (existsSync(distDir)) {
  const assetsDir = join(distDir, 'assets');
  if (existsSync(assetsDir)) {
    try {
      const files = readdirSync(assetsDir);
      const qiankunFiles = files.filter(f => f.startsWith('qiankun-') && f.endsWith('.js'));
      
      if (qiankunFiles.length > 1) {
        console.log(`⚠️  发现多个 qiankun 文件: ${qiankunFiles.join(', ')}`);
      }
    } catch (error) {
      // Ignore read errors, continue cleaning
    }
  }
}

const distPath = pathsToClean[0];
if (existsSync(distPath)) {
  try {
    rmSync(distPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    console.log(`✓ 已清理: ${distPath.replace(appDir, '.')}`);
    cleanedCount++;
  } catch (error) {
    console.error(`✗ 清理 dist 失败: ${error.message}`);
    console.error(`   这可能导致构建后仍有旧文件，请手动删除: ${distPath}`);
  }
}

pathsToClean.slice(1).forEach((path) => {
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      console.log(`✓ 已清理: ${path.replace(appDir, '.')}`);
      cleanedCount++;
    } catch (error) {
      console.error(`✗ 清理失败: ${path}`, error.message);
    }
  } else {
    console.log(`✓ 路径不存在（已干净）: ${path.replace(appDir, '.')}`);
  }
});

if (existsSync(join(appDir, 'dist'))) {
  console.warn(`\n⚠️  警告: dist 目录仍然存在，可能清理不彻底。`);
  console.warn(`   请手动检查并删除: ${join(appDir, 'dist')}\n`);
} else {
  console.log(`\n✅ 清理完成！已清理 ${cleanedCount} 个目录，dist 目录已确认删除。\n`);
}

