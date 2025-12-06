import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const srcIndexDts = join(rootDir, 'src', 'index.d.ts');
const distIndexDts = join(distDir, 'index.d.ts');

// 确保 dist 目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 如果 dist/index.d.ts 不存在，从 src 复制
if (!existsSync(distIndexDts)) {
  try {
    copyFileSync(srcIndexDts, distIndexDts);
    console.log('✓ Copied index.d.ts to dist');
  } catch (error) {
    console.error('Failed to copy index.d.ts:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓ index.d.ts already exists in dist');
}

// 尝试运行 tsc 生成类型声明文件（可选）
try {
  const { execSync } = await import('child_process');
  execSync('tsc --project tsconfig.build.json', {
    cwd: rootDir,
    stdio: 'ignore',
  });
  console.log('✓ Generated type declarations');
} catch (error) {
  // tsc 失败不影响构建，因为我们已经复制了类型文件
  console.log('⚠ TypeScript compilation skipped (using fallback types)');
}

