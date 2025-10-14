/**
 * 检查孤儿文档
 * 确保所有 .md 文档都在 apps/docs-site/ 目录下（除了允许的 README.md）
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, '.md-lint.config.json');

// 读取配置
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function checkOrphanDocs() {
  console.log('🔍 检查孤儿文档...\n');

  // 查找所有 .md 文件
  const allMdFiles = await glob('**/*.md', {
    cwd: rootDir,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vitepress/**',
      '**/build/**',
    ],
  });

  const orphanDocs = [];

  for (const file of allMdFiles) {
    // 检查是否在允许的位置
    const isAllowed = config.rules.exceptions.some(exception => {
      return file === exception || file.endsWith(`/${exception}`);
    });

    if (isAllowed) {
      continue; // 允许的文件，跳过
    }

    // 检查是否在 docs-site 目录下
    if (file.startsWith('apps/docs-site/') || file.startsWith('apps\\docs-site\\')) {
      continue; // 在文档中心，允许
    }

    // 发现孤儿文档
    orphanDocs.push(file);
  }

  if (orphanDocs.length > 0) {
    console.log(`${config.messages.error}\n`);
    console.log('发现以下孤儿文档：\n');
    orphanDocs.forEach(doc => {
      console.log(`  ❌ ${doc}`);
    });
    console.log(`\n${config.messages.hint}\n`);
    process.exit(1);
  } else {
    console.log('✅ 没有发现孤儿文档！');
    console.log('✅ 所有文档都在文档中心（apps/docs-site/）或允许的位置。\n');
  }
}

checkOrphanDocs().catch(error => {
  console.error('❌ 检查失败：', error);
  process.exit(1);
});

