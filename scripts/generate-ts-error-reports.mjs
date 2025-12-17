#!/usr/bin/env node
/**
 * 为每个应用单独运行类型检查并生成错误报告
 * 用法: node scripts/generate-ts-error-reports.mjs
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync, rmdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 应用列表（单独生成日志）
const apps = [
  'admin-app',
  'logistics-app',
  'system-app',
  'finance-app',
  'engineering-app',
  'quality-app',
  'production-app',
  'monitor-app',
  'layout-app',
  'mobile-app',
  'docs-site-app',
];

// 共享包列表（合并为一个日志文件）
const packages = [
  '@btc/shared-components',
  '@btc/shared-core',
  '@btc/shared-utils',
  '@btc/subapp-manifests',
  '@btc/vite-plugin'
];

// 输出目录（保存到 btc-shopflow-monorepo/ts-error-reports）
const outputDir = resolve(rootDir, 'ts-error-reports');

/**
 * 清理输出目录中的旧文件
 */
function cleanOutputDirectory() {
  // 检查目录是否存在
  try {
    const stats = statSync(outputDir);
    if (!stats.isDirectory()) {
      mkdirSync(outputDir, { recursive: true });
      return;
    }
  } catch (error) {
    // 目录不存在，创建它
    mkdirSync(outputDir, { recursive: true });
    console.log('ℹ️  输出目录不存在，已创建\n');
    return;
  }

  console.log('🧹 正在清理旧日志文件...\n');
  
  try {
    const files = readdirSync(outputDir);
    let cleanedCount = 0;
    
    files.forEach(file => {
      const filePath = join(outputDir, file);
      try {
        const stats = statSync(filePath);
        if (stats.isFile() && (file.endsWith('.log') || file.endsWith('.md'))) {
          unlinkSync(filePath);
          cleanedCount++;
        }
      } catch (error) {
        // 忽略删除失败的文件
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`✅ 已清理 ${cleanedCount} 个旧文件\n`);
    } else {
      console.log('ℹ️  没有需要清理的旧文件\n');
    }
  } catch (error) {
    // 如果读取目录失败，尝试创建目录
    mkdirSync(outputDir, { recursive: true });
    console.log('ℹ️  输出目录不存在，已创建\n');
  }
}

/**
 * 运行类型检查并返回输出
 */
function runTypeCheck(appName) {
  return new Promise((resolve) => {
    const command = 'pnpm';
    const args = ['--filter', appName, 'type-check'];
    
    console.log(`\n正在检查 ${appName}...`);
    
    const child = spawn(command, args, {
      cwd: rootDir,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
    });

    child.on('close', (code) => {
      const fullOutput = stdout + stderr;
      resolve({
        appName,
        exitCode: code || 0,
        output: fullOutput,
        hasErrors: code !== 0
      });
    });

    child.on('error', (error) => {
      resolve({
        appName,
        exitCode: 1,
        output: `执行错误: ${error.message}`,
        hasErrors: true
      });
    });
  });
}

/**
 * 解析错误信息
 */
function parseErrors(output, appName) {
  const errors = [];
  const lines = output.split('\n');
  const errorRegex = /error TS(\d+)/;
  // 匹配文件路径和位置: 路径(行号,列号): error TS...
  const fileRegex = /^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s*(.+)$/;
  // 匹配仅包含文件路径和位置的行: ../../path/to/file.ts(123,45):
  const fileLocationRegex = /^(.+?)\((\d+),(\d+)\):\s*$/;

  let errorCount = 0;
  let currentError = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 尝试完整匹配（文件路径+位置+错误）
    const fullMatch = line.match(fileRegex);
    if (fullMatch) {
      errorCount++;
      currentError = {
        path: fullMatch[1].trim(),
        line: parseInt(fullMatch[2]),
        column: parseInt(fullMatch[3]),
        errorCode: `TS${fullMatch[4]}`,
        message: fullMatch[5].trim()
      };
      errors.push(currentError);
      currentError = null;
      continue;
    }

    // 匹配文件路径和位置行（错误在下一行）
    const locationMatch = line.match(fileLocationRegex);
    if (locationMatch) {
      // 检查下一行是否有错误
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const errorMatch = nextLine.match(errorRegex);
        if (errorMatch) {
          errorCount++;
          currentError = {
            path: locationMatch[1].trim(),
            line: parseInt(locationMatch[2]),
            column: parseInt(locationMatch[3]),
            errorCode: `TS${errorMatch[1]}`,
            message: nextLine.substring(nextLine.indexOf('error')).trim()
          };
          errors.push(currentError);
          currentError = null;
          i++; // 跳过下一行，因为已经处理了
          continue;
        }
      }
    }

    // 单独的错误行（可能在某个应用的前缀之后）
    const errorMatch = line.match(errorRegex);
    if (errorMatch) {
      errorCount++;
      // 尝试从行中提取文件路径
      const pathMatch = line.match(/^([^(]+)\((\d+),(\d+)\)/);
      if (pathMatch) {
        currentError = {
          path: pathMatch[1].trim(),
          line: parseInt(pathMatch[2]),
          column: parseInt(pathMatch[3]),
          errorCode: `TS${errorMatch[1]}`,
          message: line.substring(line.indexOf('error')).trim()
        };
        errors.push(currentError);
        currentError = null;
      } else {
        // 没有文件路径，使用应用名作为路径标识
        currentError = {
          path: `${appName} - 未指定文件`,
          line: 0,
          column: 0,
          errorCode: `TS${errorMatch[1]}`,
          message: line.trim()
        };
        errors.push(currentError);
        currentError = null;
      }
    } else if (currentError && line.trim() && !line.match(/^\s*(at|Imported via|The file)/)) {
      // 继续收集错误消息的详细信息
      currentError.message += ' ' + line.trim();
    }
  }

  // 按文件分组
  const errorsByFile = {};
  errors.forEach(error => {
    if (!errorsByFile[error.path]) {
      errorsByFile[error.path] = [];
    }
    errorsByFile[error.path].push({
      line: error.line,
      column: error.column,
      code: error.errorCode,
      message: error.message
    });
  });

  // 按错误代码统计
  const errorsByCode = {};
  errors.forEach(error => {
    errorsByCode[error.errorCode] = (errorsByCode[error.errorCode] || 0) + 1;
  });

  return {
    totalErrors: errorCount,
    errorsByFile,
    errorsByCode,
    allErrors: errors
  };
}

/**
 * 生成单个应用/包的报告
 */
function generateReport(result, errors, isPackage = false) {
  const appName = result.appName;
  const fileName = appName.replace('@btc/', '').replace(/-/g, '_');
  const reportPath = join(outputDir, `${fileName}_errors.log`);
  
  let report = `============================================================\n`;
  report += `${appName} - TypeScript 类型错误报告\n`;
  report += `============================================================\n\n`;
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `总错误数: ${errors.totalErrors}\n\n`;

  if (errors.totalErrors === 0) {
    report += `✅ 未发现类型错误\n`;
  } else {
    // 按错误代码统计
    report += `按错误代码分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedCodes = Object.entries(errors.errorsByCode)
      .sort((a, b) => b[1] - a[1]);
    sortedCodes.forEach(([code, count]) => {
      report += `  ${code.padEnd(10)}: ${count} 个\n`;
    });
    report += `\n`;

    // 按文件分类
    report += `按文件分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedFiles = Object.entries(errors.errorsByFile)
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedFiles.forEach(([file, fileErrors]) => {
      report += `\n文件: ${file}\n`;
      report += `  错误数: ${fileErrors.length}\n`;
      fileErrors.forEach(err => {
        report += `    [${err.code}] 行 ${err.line}:${err.column} - ${err.message.split('\n')[0]}\n`;
      });
    });
    report += `\n`;

    // 详细错误列表
    report += `详细错误列表:\n`;
    report += `------------------------------------------------------------\n`;
    errors.allErrors.forEach((error, index) => {
      report += `\n错误 #${index + 1}\n`;
      report += `  文件: ${error.path}\n`;
      report += `  位置: ${error.line}:${error.column}\n`;
      report += `  代码: ${error.errorCode}\n`;
      report += `  消息: ${error.message}\n`;
    });
  }

  report += `\n============================================================\n`;
  report += `完整输出:\n`;
  report += `============================================================\n\n`;
  report += result.output;

  writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ 报告已保存: ${reportPath}`);

  return {
    appName,
    totalErrors: errors.totalErrors,
    fileCount: Object.keys(errors.errorsByFile).length,
    errorsByCode: errors.errorsByCode,
    reportPath,
    isPackage,
    errors,
    output: result.output
  };
}

/**
 * 生成共享包的合并报告
 */
function generatePackagesReport(packageResults) {
  const reportPath = join(outputDir, 'packages_errors.log');
  
  // 合并所有错误
  const allErrors = [];
  const allErrorsByCode = {};
  const allErrorsByFile = {};
  let totalErrors = 0;
  
  packageResults.forEach(pkgResult => {
    totalErrors += pkgResult.totalErrors || 0;
    
    // 合并错误代码统计（检查是否存在）
    if (pkgResult.errorsByCode && typeof pkgResult.errorsByCode === 'object') {
      Object.entries(pkgResult.errorsByCode).forEach(([code, count]) => {
        allErrorsByCode[code] = (allErrorsByCode[code] || 0) + count;
      });
    }
    
    // 合并文件错误（添加包名前缀，检查是否存在）
    if (pkgResult.errorsByFile && typeof pkgResult.errorsByFile === 'object') {
      Object.entries(pkgResult.errorsByFile).forEach(([file, fileErrors]) => {
        const prefixedFile = `[${pkgResult.appName}] ${file}`;
        if (!allErrorsByFile[prefixedFile]) {
          allErrorsByFile[prefixedFile] = [];
        }
        allErrorsByFile[prefixedFile].push(...fileErrors);
      });
    }
    
    // 合并所有错误（添加包名信息，检查是否存在）
    if (pkgResult.errors && pkgResult.errors.allErrors && Array.isArray(pkgResult.errors.allErrors)) {
      pkgResult.errors.allErrors.forEach(error => {
        allErrors.push({
          ...error,
          package: pkgResult.appName,
          path: `[${pkgResult.appName}] ${error.path}`
        });
      });
    }
  });
  
  let report = `============================================================\n`;
  report += `共享包 - TypeScript 类型错误合并报告\n`;
  report += `============================================================\n\n`;
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `涉及包数: ${packageResults.length}\n`;
  report += `总错误数: ${totalErrors}\n\n`;

  // 按包统计
  report += `按包统计:\n`;
  report += `------------------------------------------------------------\n`;
  packageResults
    .sort((a, b) => b.totalErrors - a.totalErrors)
    .forEach(pkg => {
      report += `  ${pkg.appName.padEnd(30)}: ${pkg.totalErrors} 个错误\n`;
    });
  report += `\n`;

  if (totalErrors === 0) {
    report += `✅ 所有共享包均未发现类型错误\n`;
  } else {
    // 按错误代码统计
    report += `按错误代码分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedCodes = Object.entries(allErrorsByCode)
      .sort((a, b) => b[1] - a[1]);
    sortedCodes.forEach(([code, count]) => {
      report += `  ${code.padEnd(10)}: ${count} 个\n`;
    });
    report += `\n`;

    // 按文件分类
    report += `按文件分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedFiles = Object.entries(allErrorsByFile)
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedFiles.forEach(([file, fileErrors]) => {
      report += `\n文件: ${file}\n`;
      report += `  错误数: ${fileErrors.length}\n`;
      fileErrors.forEach(err => {
        report += `    [${err.code}] 行 ${err.line}:${err.column} - ${err.message.split('\n')[0]}\n`;
      });
    });
    report += `\n`;

    // 详细错误列表
    report += `详细错误列表:\n`;
    report += `------------------------------------------------------------\n`;
    allErrors.forEach((error, index) => {
      report += `\n错误 #${index + 1}\n`;
      report += `  包: ${error.package}\n`;
      report += `  文件: ${error.path}\n`;
      report += `  位置: ${error.line}:${error.column}\n`;
      report += `  代码: ${error.errorCode}\n`;
      report += `  消息: ${error.message}\n`;
    });
  }

  // 各包的完整输出
  report += `\n============================================================\n`;
  report += `各包完整输出:\n`;
  report += `============================================================\n\n`;
  packageResults.forEach(pkg => {
    report += `\n${'='.repeat(60)}\n`;
    report += `${pkg.appName} 完整输出:\n`;
    report += `${'='.repeat(60)}\n\n`;
    report += pkg.output;
    report += `\n`;
  });

  writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ 共享包合并报告已保存: ${reportPath}`);

  // 返回汇总信息
  return {
    appName: 'packages (合并)',
    totalErrors,
    fileCount: Object.keys(allErrorsByFile).length,
    errorsByCode: allErrorsByCode,
    reportPath
  };
}

/**
 * 生成汇总报告
 */
function generateSummaryReport(results) {
  const summaryPath = join(outputDir, 'SUMMARY.md');
  
  let summary = `# TypeScript 类型错误统计汇总\n\n`;
  summary += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  summary += `## 总体统计\n\n`;
  
  const totalErrors = results.reduce((sum, r) => sum + r.totalErrors, 0);
  const appsWithErrors = results.filter(r => r.totalErrors > 0).length;
  
  summary += `- **总应用数**: ${results.length}\n`;
  summary += `- **有错误的应用数**: ${appsWithErrors}\n`;
  summary += `- **总错误数**: ${totalErrors}\n\n`;
  
  summary += `## 应用错误统计\n\n`;
  summary += `| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |\n`;
  summary += `|---------|--------|-----------|-------------|----------|\n`;
  
  // 分离应用和包
  const appResults = results.filter(r => !r.appName.includes('packages'));
  const packageResults = results.filter(r => r.appName.includes('packages'));
  
  const sortedAppResults = appResults.sort((a, b) => b.totalErrors - a.totalErrors);
  sortedAppResults.forEach(result => {
    const codeDist = Object.entries(result.errorsByCode)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => `${code}:${count}`)
      .join(', ');
    
    const reportFileName = result.reportPath.split(/[\\/]/).pop();
    const status = result.totalErrors === 0 ? '✅' : '❌';
    
    summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${codeDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
  });
  
  // 共享包统计（合并）
  if (packageResults.length > 0) {
    summary += `\n## 共享包错误统计（合并）\n\n`;
    summary += `| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |\n`;
    summary += `|---------|--------|-----------|-------------|----------|\n`;
    
    packageResults.forEach(result => {
      const codeDist = Object.entries(result.errorsByCode)
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => `${code}:${count}`)
        .join(', ');
      
      const reportFileName = result.reportPath.split(/[\\/]/).pop();
      const status = result.totalErrors === 0 ? '✅' : '❌';
      
      summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${codeDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
    });
  }
  
  summary += `\n## 错误代码汇总\n\n`;
  
  const allErrorCodes = {};
  results.forEach(result => {
    Object.entries(result.errorsByCode).forEach(([code, count]) => {
      allErrorCodes[code] = (allErrorCodes[code] || 0) + count;
    });
  });
  
  const sortedCodes = Object.entries(allErrorCodes)
    .sort((a, b) => b[1] - a[1]);
  
  summary += `| 错误代码 | 总数 | 说明 |\n`;
  summary += `|---------|------|------|\n`;
  
  const errorCodeDescriptions = {
    'TS2307': '无法找到模块或其类型声明',
    'TS6307': '文件未在项目文件列表中',
    'TS2322': '类型不匹配',
    'TS2339': '属性不存在',
    'TS2578': '未使用的 @ts-expect-error 指令',
    'TS18047': '可能为 null',
    'TS7006': '隐式 any 类型',
    'TS6133': '未使用的变量',
    'TS2741': '缺少必需属性',
    'TS2352': '类型转换错误'
  };
  
  sortedCodes.forEach(([code, count]) => {
    const desc = errorCodeDescriptions[code] || '未知错误';
    summary += `| ${code} | ${count} | ${desc} |\n`;
  });
  
  writeFileSync(summaryPath, summary, 'utf-8');
  console.log(`\n✅ 汇总报告已保存: ${summaryPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('开始生成 TypeScript 类型错误报告...\n');
  console.log(`输出目录: ${outputDir}\n`);

  // 清理旧日志文件
  cleanOutputDirectory();

  const results = [];
  const packageResults = [];

  // 处理应用（单独生成日志）
  console.log('📱 正在检查应用...\n');
  for (const app of apps) {
    const result = await runTypeCheck(app);
    const errors = parseErrors(result.output, app);
    const report = generateReport(result, errors, false);
    results.push(report);
    
    // 稍微延迟，避免过度占用资源
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 处理共享包（收集数据，不单独生成文件，最后合并为一个文件）
  console.log('\n📦 正在检查共享包...\n');
  for (const pkg of packages) {
    const result = await runTypeCheck(pkg);
    const errors = parseErrors(result.output, pkg);
    // 只收集数据，不生成单独文件
    packageResults.push({
      appName: pkg,
      totalErrors: errors.totalErrors,
      fileCount: Object.keys(errors.errorsByFile).length,
      errorsByCode: errors.errorsByCode,
      errorsByFile: errors.errorsByFile,
      errors: errors,
      output: result.output
    });
    
    // 稍微延迟，避免过度占用资源
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 生成共享包的合并报告
  if (packageResults.length > 0) {
    const mergedPackageReport = generatePackagesReport(packageResults);
    results.push(mergedPackageReport);
  }

  generateSummaryReport(results);

  console.log(`\n✅ 所有报告生成完成！`);
  console.log(`📁 报告位置: ${outputDir}`);
  console.log(`   - 应用报告: 每个应用单独一个文件`);
  console.log(`   - 共享包报告: packages_errors.log (合并)`);
}

main().catch(console.error);
