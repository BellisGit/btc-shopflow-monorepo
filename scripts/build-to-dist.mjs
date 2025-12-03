#!/usr/bin/env node

/**
 * 构建所有应用并将产物复制到根目录的 dist 文件夹
 * 按照子域名组织：dist/bellis.com.cn, dist/admin.bellis.com.cn 等
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync } from 'fs';
import { resolve, join } from 'path';
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
  // 'docs-site-app': 'docs.bellis.com.cn', // 暂时不考虑文档应用
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
  // 'docs-site-app', // 暂时不考虑文档应用
];

// 根目录的 dist 文件夹
const ROOT_DIST_DIR = join(rootDir, 'dist');

/**
 * 清理并创建根目录的 dist 文件夹
 */
function prepareDistDir() {
  console.log('📁 准备 dist 目录...');
  if (existsSync(ROOT_DIST_DIR)) {
    console.log('  🗑️  清理现有的 dist 目录...');
    rmSync(ROOT_DIST_DIR, { recursive: true, force: true });
  }
  // 不需要显式创建，cpSync 会自动创建
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
      });
    } else {
      // 其他应用使用标准的构建命令
      const buildCmd = `pnpm --filter ${appName} build`;
      execSync(buildCmd, {
        cwd: rootDir,
        stdio: 'inherit',
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
 * 复制应用构建产物到 dist 目录
 */
function copyAppDist(appName, domain) {
  // 标准 Vite 应用的构建产物在 dist 目录
  const standardDistDir = join(rootDir, 'apps', appName, 'dist');
  
  let appDistDir;
  if (existsSync(standardDistDir)) {
    appDistDir = standardDistDir;
  } else {
    console.error(`  ⚠️  警告: ${appName} 的构建产物目录不存在`);
    console.error(`     尝试过的路径: ${standardDistDir}`);
    return false;
  }

  const targetDir = join(ROOT_DIST_DIR, domain);

  // 如果目标目录已存在，先清空它
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }

  console.log(`  📦 复制 ${appName} 产物到 dist/${domain}...`);
  try {
    cpSync(appDistDir, targetDir, {
      recursive: true,
      force: true,
    });
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
  try {
    const turboScript = join(rootDir, 'scripts', 'turbo.js');
    execSync(`node ${turboScript} run build`, {
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

  // 准备 dist 目录
  prepareDistDir();

  const results = {
    built: [],
    failed: [],
    copied: [],
    copyFailed: [],
  };

  // 第一步：使用 Turbo 构建所有包和应用（包括共享包）
  // 这确保了所有依赖包都先被构建，然后再构建应用
  const turboBuildSuccess = buildAllPackages();
  
  if (!turboBuildSuccess) {
    console.error('\n❌ Turbo 构建失败，无法继续复制构建产物');
    process.exit(1);
  }

  // 第二步：验证应用是否已构建（Turbo 已经构建了，这里只是验证）
  console.log('📋 验证应用构建产物...\n');
  for (const appName of BUILD_ORDER) {
    if (!APP_DOMAIN_MAP[appName]) {
      console.log(`  ⚠️  跳过未配置的应用: ${appName}\n`);
      continue;
    }

    // 检查构建产物是否存在
    const standardDistDir = join(rootDir, 'apps', appName, 'dist');
    if (existsSync(standardDistDir)) {
      results.built.push(appName);
      console.log(`  ✅ ${appName} 构建产物已存在\n`);
    } else {
      results.failed.push(appName);
      console.error(`  ❌ ${appName} 构建产物不存在\n`);
    }
  }

  // 复制构建产物前，再次清空 dist 目录以确保干净
  console.log('\n📋 开始复制构建产物...\n');
  if (existsSync(ROOT_DIST_DIR)) {
    console.log('  🗑️  清空 dist 目录（复制前清理）...');
    rmSync(ROOT_DIST_DIR, { recursive: true, force: true });
    console.log('  ✅ dist 目录已清空\n');
  }
  
  for (const appName of BUILD_ORDER) {
    const domain = APP_DOMAIN_MAP[appName];
    if (!domain) {
      continue;
    }

    // 只复制成功构建的应用
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
  console.log('\n' + '='.repeat(60));
  console.log(`\n📁 所有产物已复制到: ${ROOT_DIST_DIR}\n`);

  // 如果有失败，退出码为 1
  if (results.failed.length > 0 || results.copyFailed.length > 0) {
    process.exit(1);
  }
}

// 运行主函数
main();

