#!/usr/bin/env node

/**
 * 构建并上传到 CDN 的包装脚本
 * 支持构建单个应用或所有应用，然后上传到 CDN
 * 构建产物输出到 dist-cdn 目录
 * 
 * 使用方法：
 *   node scripts/build-cdn.mjs system-app
 *   node scripts/build-cdn.mjs system
 *   node scripts/build-cdn.mjs --all
 */

import { spawn } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, cpSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// 应用名称映射（简化名称 -> 完整名称）
const APP_NAME_MAP = {
  'main': 'main-app',
  'system': 'system-app',
  'admin': 'admin-app',
  'logistics': 'logistics-app',
  'quality': 'quality-app',
  'production': 'production-app',
  'engineering': 'engineering-app',
  'finance': 'finance-app',
  'layout': 'layout-app',
  'operations': 'operations-app',
  'docs': 'docs-app',
  'dashboard': 'dashboard-app',
  'personnel': 'personnel-app',
};

// 所有应用列表
const APP_LIST = Object.values(APP_NAME_MAP);

// 应用和子域名的映射关系（用于复制到 dist-cdn）
const APP_DOMAIN_MAP = {
  'main-app': 'bellis.com.cn',
  'system-app': 'system.bellis.com.cn',
  'admin-app': 'admin.bellis.com.cn',
  'logistics-app': 'logistics.bellis.com.cn',
  'quality-app': 'quality.bellis.com.cn',
  'production-app': 'production.bellis.com.cn',
  'engineering-app': 'engineering.bellis.com.cn',
  'finance-app': 'finance.bellis.com.cn',
  'layout-app': 'layout.bellis.com.cn',
  'operations-app': 'operations.bellis.com.cn',
  'dashboard-app': 'dashboard.bellis.com.cn',
  'personnel-app': 'personnel.bellis.com.cn',
  'docs-app': 'docs.bellis.com.cn',
};

// 根目录的 dist-cdn 文件夹
const ROOT_DIST_CDN_DIR = join(projectRoot, 'dist-cdn');

/**
 * 规范化应用名称
 * @param {string} name - 应用名称（可能是简化名称或完整名称）
 * @returns {string} 完整应用名称
 */
function normalizeAppName(name) {
  // 如果已经是完整名称（以 -app 结尾），直接返回
  if (name.endsWith('-app')) {
    return name;
  }
  // 否则尝试从映射中查找
  return APP_NAME_MAP[name] || name;
}

// 解析命令行参数（过滤掉 pnpm 传递的 `--` 分隔符）
const args = process.argv.slice(2).filter(arg => arg !== '--');
const isAll = args.includes('--all');
const appNameArg = args.find(arg => !arg.startsWith('--'));

if (!isAll && !appNameArg) {
  console.error('❌ 错误：请指定应用名称或使用 --all');
  console.error('   示例: pnpm build-cdn:all -- system-app');
  console.error('   示例: pnpm build-cdn:all -- system');
  console.error('   示例: pnpm build-cdn:all -- --all');
  console.error('   或者: node scripts/build-cdn.mjs system-app');
  console.error('   或者: node scripts/build-cdn.mjs system');
  console.error('   或者: node scripts/build-cdn.mjs --all');
  process.exit(1);
}

// 确定要构建的应用
let appsToBuild = [];
if (isAll) {
  appsToBuild = APP_LIST;
} else {
  const normalizedName = normalizeAppName(appNameArg);
  if (!APP_LIST.includes(normalizedName)) {
    console.error(`❌ 错误：未知的应用名称 "${appNameArg}"`);
    console.error(`   支持的应用: ${APP_LIST.join(', ')}`);
    process.exit(1);
  }
  appsToBuild = [normalizedName];
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始构建并上传到 CDN...');
  if (isAll) {
    console.log(`   目标: 所有应用 (${appsToBuild.length} 个)`);
  } else {
    console.log(`   目标: ${appsToBuild[0]}`);
  }
  console.log(`   环境变量: ENABLE_CDN_ACCELERATION=true, ENABLE_CDN_UPLOAD=true, BUILD_OUT_DIR=dist-cdn`);
  console.log(`   输出目录: dist-cdn`);
  console.log('');

  // 构建并上传每个应用
  let hasError = false;

  for (const appName of appsToBuild) {
    console.log(`\n============================================================`);
    console.log(`📦 处理应用: ${appName}`);
    console.log(`============================================================\n`);

    // 步骤1: 构建应用
    console.log(`🔨 构建应用: ${appName}...`);
    const buildCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    const buildArgs = ['--filter', appName, 'build'];

    const buildResult = await new Promise((resolve) => {
      const buildProcess = spawn(buildCommand, buildArgs, {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          ENABLE_CDN_ACCELERATION: 'true',
          ENABLE_CDN_UPLOAD: 'true',
          BUILD_OUT_DIR: 'dist-cdn',
        },
      });

      buildProcess.on('error', (error) => {
        console.error(`❌ 构建失败: ${error.message}`);
        resolve({ success: false });
      });

      buildProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(`✅ ${appName} 构建完成\n`);
          resolve({ success: true });
        } else {
          console.error(`❌ ${appName} 构建失败，退出代码: ${code}\n`);
          resolve({ success: false });
        }
      });
    });

    if (!buildResult.success) {
      hasError = true;
      console.error(`❌ ${appName} 构建失败，跳过复制和上传`);
      continue;
    }

    // 步骤2: 复制到 dist-cdn 目录
    console.log(`📦 复制 ${appName} 产物到 dist-cdn...`);
    const appDistDir = join(projectRoot, 'apps', appName, 'dist-cdn');
    const domain = APP_DOMAIN_MAP[appName];
    
    if (!domain) {
      console.error(`❌ 未知的应用名称: ${appName}`);
      hasError = true;
      continue;
    }

    if (!existsSync(appDistDir)) {
      console.error(`❌ ${appName} 的构建产物目录不存在: ${appDistDir}`);
      hasError = true;
      continue;
    }

    // 确保根目录 dist-cdn 存在
    if (!existsSync(ROOT_DIST_CDN_DIR)) {
      mkdirSync(ROOT_DIST_CDN_DIR, { recursive: true });
    }

    const targetDir = join(ROOT_DIST_CDN_DIR, domain);
    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true, force: true });
    }

    try {
      cpSync(appDistDir, targetDir, {
        recursive: true,
        force: true,
      });
      console.log(`✅ ${appName} 产物已复制到 dist-cdn/${domain}\n`);
    } catch (error) {
      console.error(`❌ 复制 ${appName} 产物失败:`, error.message);
      hasError = true;
      continue;
    }

    // 步骤3: 上传到 CDN
    console.log(`📤 上传应用: ${appName}...`);
    const uploadCommand = 'node';
    const uploadArgs = [resolve(projectRoot, 'scripts', 'upload-app-to-cdn.mjs'), appName];

    const uploadResult = await new Promise((resolve) => {
      const uploadProcess = spawn(uploadCommand, uploadArgs, {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      uploadProcess.on('error', (error) => {
        console.error(`❌ 上传失败: ${error.message}`);
        resolve({ success: false });
      });

      uploadProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(`✅ ${appName} 上传完成\n`);
          resolve({ success: true });
        } else {
          console.error(`❌ ${appName} 上传失败，退出代码: ${code}\n`);
          resolve({ success: false });
        }
      });
    });

    if (!uploadResult.success) {
      hasError = true;
    }
  }

  // 输出总结
  console.log('\n============================================================');
  if (hasError) {
    console.log('⚠️  部分应用构建或上传失败');
    process.exit(1);
  } else {
    console.log('✅ 所有应用构建并上传完成！');
    process.exit(0);
  }
}

// 执行主函数
main().catch((error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

