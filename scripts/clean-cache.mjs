/**
 * 清理构建缓存脚本
 * 在构建前自动清理 Vite 缓存和旧的构建输出
 */

import { existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const pathsToClean = [
  // 应用的 Vite 缓存
  'apps/admin-app/node_modules/.vite',
  'apps/logistics-app/node_modules/.vite',
  'apps/engineering-app/node_modules/.vite',
  'apps/quality-app/node_modules/.vite',
  'apps/production-app/node_modules/.vite',
  'apps/finance-app/node_modules/.vite',
  'apps/mobile-app/node_modules/.vite',
  'apps/system-app/node_modules/.vite',
  'apps/layout-app/node_modules/.vite',
  'apps/docs-site-app/node_modules/.vite',
  
  // 应用的构建输出
  'apps/admin-app/dist',
  'apps/logistics-app/dist',
  'apps/engineering-app/dist',
  'apps/quality-app/dist',
  'apps/production-app/dist',
  'apps/finance-app/dist',
  'apps/mobile-app/dist',
  'apps/system-app/dist',
  'apps/layout-app/dist',
  'apps/docs-site-app/dist',
  
  // 应用的 Vite 缓存（根目录下的 .vite）
  'apps/admin-app/.vite',
  'apps/logistics-app/.vite',
  'apps/engineering-app/.vite',
  'apps/quality-app/.vite',
  'apps/production-app/.vite',
  'apps/finance-app/.vite',
  'apps/mobile-app/.vite',
  'apps/system-app/.vite',
  'apps/layout-app/.vite',
  'apps/docs-site-app/.vite',
  
  // 包的 Vite 缓存
  'packages/shared-core/node_modules/.vite',
  'packages/shared-components/node_modules/.vite',
  'packages/shared-utils/node_modules/.vite',
  
  // 包的构建输出
  'packages/shared-core/dist',
  'packages/shared-components/dist',
  'packages/shared-utils/dist',
  
  // Turbo 缓存（可选，如果需要强制重新构建所有应用）
  // '.turbo',
];

console.log('🧹 正在清理构建缓存...\n');

let cleanedCount = 0;
let skippedCount = 0;

pathsToClean.forEach((relativePath) => {
  const fullPath = join(rootDir, relativePath);
  
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`✓ 已清理: ${relativePath}`);
      cleanedCount++;
    } catch (error) {
      console.error(`✗ 清理失败: ${relativePath}`, error.message);
    }
  } else {
    skippedCount++;
  }
});

console.log(`\n✅ 清理完成！已清理 ${cleanedCount} 个目录，跳过 ${skippedCount} 个不存在的目录。\n`);

