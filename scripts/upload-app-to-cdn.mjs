#!/usr/bin/env node

/**
 * 上传应用构建产物到阿里云 OSS/CDN（基于文件指纹的增量上传）
 * 只在文件变化时才上传，避免不必要的上传操作
 * 
 * 使用方法：
 *   node scripts/upload-app-to-cdn.mjs system-app
 *   node scripts/upload-app-to-cdn.mjs --all
 */

import OSS from 'ali-oss';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');

/**
 * Windows 本地执行时：从 Windows Credential Manager 读取最新 AK/SK（如果环境变量缺失）
 */
function tryLoadOssCredsFromWindowsCredentialManager() {
  if (process.platform !== 'win32') return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;

  try {
    const ps = [
      `$ErrorActionPreference='Stop'`,
      `Import-Module CredentialManager`,
      `$id=(Get-StoredCredential -Target 'AlibabaCloud' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$sec=(Get-StoredCredential -Target 'AlibabaCloudSecret' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$out=[pscustomobject]@{ id=$id; secret=$sec } | ConvertTo-Json -Compress`,
      `Write-Output $out`,
    ].join('; ');

    const raw = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    const jsonText = (raw || '').trim();
    if (!jsonText) return;

    const parsed = JSON.parse(jsonText);
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
    // 静默失败：继续走 .env.oss 或报缺少配置
  }
}

// 加载 .env.oss 文件
const envOssPath = resolve(projectRoot, '.env.oss');
if (existsSync(envOssPath)) {
  const envContent = readFileSync(envOssPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    // 跳过空行和注释
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        // 移除引号（如果存在）
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = cleanValue;
        }
      }
    }
  });
}

// 最后兜底：如果没有 .env.oss 或没设置 env，则尝试从 Windows 凭证管理器读取
tryLoadOssCredsFromWindowsCredentialManager();

// OSS 配置（从环境变量读取）
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-shenzhen',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'bellis1',
};

// CDN 域名
const CDN_DOMAIN = process.env.CDN_STATIC_ASSETS_URL || 'https://all.bellis.com.cn';
const STRICT_UPLOAD = process.env.OSS_UPLOAD_STRICT === 'true';

// 应用列表
const APP_LIST = [
  'system-app',
  'admin-app',
  'logistics-app',
  'quality-app',
  'production-app',
  'engineering-app',
  'finance-app',
  'layout-app',
  'operations-app',
  'dashboard-app',
  'personnel-app',
  'docs-app',
];

/**
 * 计算文件的 MD5 哈希值
 */
function calculateFileHash(filePath) {
  const fileBuffer = readFileSync(filePath);
  return createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * 检查 OSS 中文件是否存在且哈希值匹配
 */
async function checkFileInOSS(client, ossPath) {
  try {
    const result = await client.head(ossPath);
    // 阿里云 OSS 的 ETag 是文件的 MD5（去掉引号）
    const etag = result.res.headers.etag?.replace(/"/g, '') || '';
    return { exists: true, etag };
  } catch (error) {
    if (error.code === 'NoSuchKey' || error.status === 404) {
      return { exists: false, etag: null };
    }
    throw error;
  }
}

/**
 * 上传单个文件到 OSS（如果文件已存在且哈希值相同，则跳过）
 */
async function uploadFile(client, localPath, ossPath) {
  try {
    // 计算本地文件哈希
    const localHash = calculateFileHash(localPath);
    
    // 检查 OSS 中的文件
    const { exists, etag } = await checkFileInOSS(client, ossPath);
    
    if (exists && etag === localHash) {
      return { uploaded: false, skipped: true };
    }
    
    // 上传文件
    const result = await client.put(ossPath, localPath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
    return { uploaded: true, skipped: false, url: result.url };
  } catch (error) {
    console.error(`✗ 上传失败 ${ossPath}:`, error.message);
    throw error;
  }
}

/**
 * 递归扫描目录，获取所有文件
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // 跳过隐藏文件和目录
    if (entry.name.startsWith('.')) continue;
    
    // 跳过 build 目录（EPS 数据不应部署）
    if (entry.name === 'build' && entry.isDirectory()) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 上传应用构建产物
 */
async function uploadApp(client, appName) {
  // 确定构建产物目录
  let distDir = resolve(projectRoot, 'apps', appName, 'dist');
  
  // docs-app 特殊处理：VitePress 构建产物在 .vitepress/dist
  if (appName === 'docs-app') {
    const vitepressDist = resolve(projectRoot, 'apps', appName, '.vitepress', 'dist');
    if (existsSync(vitepressDist)) {
      distDir = vitepressDist;
    }
  }
  
  if (!existsSync(distDir)) {
    console.error(`❌ 错误：${appName} 的构建产物目录不存在: ${distDir}`);
    console.error(`   请先执行构建: pnpm build:${appName.replace('-app', '')}`);
    return { success: false, uploaded: 0, skipped: 0, total: 0 };
  }
  
  console.log(`\n📦 上传 ${appName}...`);
  console.log(`   源目录: ${distDir}`);
  console.log(`   OSS 路径: ${appName}/`);
  
  // 获取所有文件
  const files = getAllFiles(distDir);
  const results = [];
  let uploadedCount = 0;
  let skippedCount = 0;
  
  // 并行上传（限制并发数）
  const CONCURRENT_LIMIT = 10;
  for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
    const batch = files.slice(i, i + CONCURRENT_LIMIT);
    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        const relativePath = relative(distDir, filePath);
        const ossPath = `${appName}/${relativePath.replace(/\\/g, '/')}`;
        
        try {
          const result = await uploadFile(client, filePath, ossPath);
          if (result.uploaded) {
            uploadedCount++;
            console.log(`+ ${ossPath}`);
          } else if (result.skipped) {
            skippedCount++;
          }
          return { file: relativePath, ...result };
        } catch (error) {
          console.error(`✗ ${ossPath}: ${error.message}`);
          return { file: relativePath, uploaded: false, skipped: false, error: error.message };
        }
      })
    );
    results.push(...batchResults);
  }
  
  console.log(`✅ ${appName} 上传完成`);
  console.log(`   总计: ${files.length} 个文件`);
  console.log(`   上传: ${uploadedCount} 个文件`);
  console.log(`   跳过: ${skippedCount} 个文件（未变化）`);
  console.log(`   CDN 访问: ${CDN_DOMAIN}/${appName}/`);
  
  return {
    success: true,
    uploaded: uploadedCount,
    skipped: skippedCount,
    total: files.length,
  };
}

/**
 * 主函数
 */
async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const appName = args.find(arg => !arg.startsWith('--'));
  
  if (!isAll && !appName) {
    console.error('❌ 错误：请指定应用名称或使用 --all 上传所有应用');
    console.error('   示例: node scripts/upload-app-to-cdn.mjs system-app');
    console.error('   示例: node scripts/upload-app-to-cdn.mjs --all');
    process.exit(1);
  }
  
  // 检查必要的环境变量
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    const msg = [
      '⚠️  缺少 OSS 配置（OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET）。',
      '    请设置环境变量或创建 .env.oss 文件。',
      '    如需严格失败，请设置环境变量 OSS_UPLOAD_STRICT=true',
    ].join('\n');

    if (STRICT_UPLOAD) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
      return;
    }
  }
  
  console.log('🚀 开始上传应用构建产物到 OSS...');
  console.log(`   OSS Bucket: ${ossConfig.bucket}`);
  console.log(`   OSS Region: ${ossConfig.region}`);
  console.log(`   CDN 域名: ${CDN_DOMAIN}`);
  
  // 创建 OSS 客户端
  const client = new OSS({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
  });
  
  try {
    const appsToUpload = isAll ? APP_LIST : [appName];
    const results = [];
    
    for (const app of appsToUpload) {
      if (!APP_LIST.includes(app)) {
        console.warn(`⚠️  跳过未知应用: ${app}`);
        continue;
      }
      
      const result = await uploadApp(client, app);
      results.push({ app, ...result });
    }
    
    // 统计结果
    const totalApps = results.length;
    const successApps = results.filter(r => r.success).length;
    const totalFiles = results.reduce((sum, r) => sum + r.total, 0);
    const totalUploaded = results.reduce((sum, r) => sum + r.uploaded, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    
    console.log('\n✅ 所有应用上传完成！');
    console.log(`   应用数: ${successApps}/${totalApps}`);
    console.log(`   总文件数: ${totalFiles}`);
    console.log(`   上传文件数: ${totalUploaded}`);
    console.log(`   跳过文件数: ${totalSkipped}`);
    console.log(`\n📦 文件可通过 CDN 访问：`);
    results.forEach(r => {
      if (r.success) {
        console.log(`   ${CDN_DOMAIN}/${r.app}/`);
      }
    });
  } catch (error) {
    const msg = `⚠️  上传失败：${error?.message || error}`;
    if (STRICT_UPLOAD) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
      return;
    }
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

