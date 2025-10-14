/**
 * 文档编码修复工具
 * 修复所有被全角冒号分隔符破坏的 Markdown 文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

interface FixResult {
  file: string;
  success: boolean;
  charsBefore: number;
  charsAfter: number;
  colonCount: number;
  error?: string;
}

/**
 * 检测文件是否包含冒号分隔符问题
 */
function hasColonSeparators(content: string): boolean {
  // 检测特征模式：：X：Y：Z：（连续的冒号+单字符）
  // 至少匹配10次这个模式才认为是有问题的
  const pattern = /：./g;
  const matches = content.match(pattern);
  return matches ? matches.length > 10 : false;
}

/**
 * 移除冒号分隔符，恢复原始文本
 */
function removeColonSeparators(content: string): string {
  // 策略：将所有 "：" 后面跟着的字符提取出来
  // 例如：：#： ：T：i：t：l：e： → # Title

  let fixed = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '：') {
      // 跳过冒号，保留下一个字符
      i++;
      if (i < content.length) {
        fixed += content[i];
        i++;
      }
    } else {
      // 如果不是冒号开头，直接保留（处理开头的特殊情况）
      fixed += content[i];
      i++;
    }
  }

  return fixed;
}

/**
 * 修复单个文件
 */
function fixFile(filePath: string, dryRun: boolean = false): FixResult {
  const relativePath = path.relative(docsRoot, filePath);

  try {
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    // 检查是否需要修复
    if (!hasColonSeparators(originalContent)) {
      return {
        file: relativePath,
        success: true,
        charsBefore: originalContent.length,
        charsAfter: originalContent.length,
        colonCount: 0,
        error: 'No colon separators detected (file is clean)'
      };
    }

    // 计算冒号数量
    const colonCount = (originalContent.match(/：/g) || []).length;

    // 执行修复
    const fixedContent = removeColonSeparators(originalContent);

    // 如果不是演练模式，写入文件
    if (!dryRun) {
      fs.writeFileSync(filePath, fixedContent, 'utf-8');
    }

    return {
      file: relativePath,
      success: true,
      charsBefore: originalContent.length,
      charsAfter: fixedContent.length,
      colonCount
    };
  } catch (error) {
    return {
      file: relativePath,
      success: false,
      charsBefore: 0,
      charsAfter: 0,
      colonCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const testMode = args.includes('--test');

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        文档编码修复工具 - 冒号分隔符移除              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 运行模式：演练模式（不会修改文件）\n');
  } else if (testMode) {
    console.log('🧪 运行模式：测试模式（仅处理前5个文件）\n');
  } else {
    console.log('🔧 运行模式：完整修复模式\n');
  }

  // 扫描所有 .md 文件
  const files = await glob('**/*.md', {
    cwd: docsRoot,
    ignore: ['node_modules/**', '.vitepress/**', 'dist/**'],
  });

  console.log(`📂 发现 ${files.length} 个文档文件\n`);

  // 测试模式只处理前5个文件
  const filesToProcess = testMode ? files.slice(0, 5) : files;

  if (testMode) {
    console.log(`🧪 测试模式：仅处理前 ${filesToProcess.length} 个文件：`);
    filesToProcess.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
    console.log();
  }

  // 处理文件
  console.log('⚙️  开始处理文件...\n');

  const results: FixResult[] = [];
  let processedCount = 0;

  for (const file of filesToProcess) {
    const fullPath = path.join(docsRoot, file);
    const result = fixFile(fullPath, dryRun);
    results.push(result);

    processedCount++;

    if (result.success && result.colonCount > 0) {
      const reduction = ((result.charsBefore - result.charsAfter) / result.charsBefore * 100).toFixed(1);
      console.log(`✅ ${result.file}`);
      console.log(`   移除 ${result.colonCount} 个冒号分隔符`);
      console.log(`   ${result.charsBefore} → ${result.charsAfter} 字符 (减少 ${reduction}%)\n`);
    } else if (result.error?.includes('clean')) {
      console.log(`✨ ${result.file} (已是正常文件)\n`);
    } else if (!result.success) {
      console.log(`❌ ${result.file}`);
      console.log(`   错误: ${result.error}\n`);
    }
  }

  // 生成统计报告
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                      修复报告                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const successResults = results.filter(r => r.success && r.colonCount > 0);
  const cleanResults = results.filter(r => r.error?.includes('clean'));
  const failedResults = results.filter(r => !r.success);

  const totalColonsRemoved = successResults.reduce((sum, r) => sum + r.colonCount, 0);
  const totalCharsBefore = successResults.reduce((sum, r) => sum + r.charsBefore, 0);
  const totalCharsAfter = successResults.reduce((sum, r) => sum + r.charsAfter, 0);

  console.log(`📊 统计信息：`);
  console.log(`   - 总文件数：${filesToProcess.length}`);
  console.log(`   - 需要修复：${successResults.length}`);
  console.log(`   - 已是正常：${cleanResults.length}`);
  console.log(`   - 修复失败：${failedResults.length}`);
  console.log();

  if (successResults.length > 0) {
    console.log(`🔧 修复详情：`);
    console.log(`   - 移除冒号总数：${totalColonsRemoved.toLocaleString()}`);
    console.log(`   - 修复前字符数：${totalCharsBefore.toLocaleString()}`);
    console.log(`   - 修复后字符数：${totalCharsAfter.toLocaleString()}`);
    console.log(`   - 减少字符数：${(totalCharsBefore - totalCharsAfter).toLocaleString()}`);
    console.log();
  }

  if (failedResults.length > 0) {
    console.log(`❌ 失败文件：`);
    failedResults.forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
    console.log();
  }

  // 保存报告
  const reportPath = path.join(docsRoot, 'fix-colon-separator-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : testMode ? 'test' : 'full',
    summary: {
      totalFiles: filesToProcess.length,
      fixed: successResults.length,
      clean: cleanResults.length,
      failed: failedResults.length,
      totalColonsRemoved,
      totalCharsBefore,
      totalCharsAfter
    },
    results: results.map(r => ({
      file: r.file,
      success: r.success,
      colonCount: r.colonCount,
      reduction: r.charsBefore > 0
        ? ((r.charsBefore - r.charsAfter) / r.charsBefore * 100).toFixed(1) + '%'
        : '0%',
      error: r.error
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 详细报告已保存到: ${path.basename(reportPath)}\n`);

  // 最终提示
  if (dryRun) {
    console.log('💡 提示：这是演练模式，文件未被修改');
    console.log('   运行 pnpm tsx scripts/fix-colon-separator.ts 执行实际修复\n');
  } else if (testMode) {
    console.log('💡 提示：这是测试模式，仅处理了前5个文件');
    console.log('   如果结果正确，运行不带 --test 参数的命令处理所有文件\n');
  } else {
    console.log('✅ 修复完成！请验证文档是否正常：');
    console.log('   1. 检查关键文件内容');
    console.log('   2. 运行 pnpm dev 启动 VitePress');
    console.log('   3. 检查导航和搜索功能\n');
  }
}

main().catch(console.error);

