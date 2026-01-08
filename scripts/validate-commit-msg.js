#!/usr/bin/env node
/**
 * 提交信息验证脚本
 * 在提交前检查提交信息是否符合 Conventional Commits 规范
 * 
 * 使用方法：
 *   node scripts/validate-commit-msg.js "feat(i18n): Fix menu structure"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从命令行参数或环境变量获取提交信息
const commitMsgFile = process.argv[2] || process.env.GIT_PARAMS || '.git/COMMIT_EDITMSG';

let commitMsg = '';

// 尝试从文件读取提交信息
if (fs.existsSync(commitMsgFile)) {
  commitMsg = fs.readFileSync(commitMsgFile, 'utf-8').trim();
} else if (process.argv[2]) {
  // 如果提供了命令行参数，直接使用
  commitMsg = process.argv[2];
} else {
  // 尝试从 git 获取最后一次提交信息（用于测试）
  try {
    commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.error('❌ 无法获取提交信息');
    process.exit(1);
  }
}

// 移除注释行
const lines = commitMsg.split('\n').filter(line => !line.trim().startsWith('#'));
const firstLine = lines[0] || '';

// 验证格式
const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/;

if (!conventionalCommitRegex.test(firstLine)) {
  console.error('');
  console.error('❌ 提交信息格式不符合规范！');
  console.error('');
  console.error('📝 当前提交信息：');
  console.error(`   ${firstLine}`);
  console.error('');
  console.error('📋 正确格式：');
  console.error('   <type>(<scope>): <subject>');
  console.error('');
  console.error('   类型（type）：feat, fix, docs, style, refactor, test, chore');
  console.error('   作用域（scope）：可选，如 i18n, menu, logistics 等');
  console.error('   主题（subject）：简短描述，不超过50字符，首字母小写');
  console.error('');
  console.error('📋 示例：');
  console.error('   ✅ feat(i18n): Fix menu structure for logistics app');
  console.error('   ✅ fix(menu): Correct procurement module naming');
  console.error('   ✅ docs: Update commit message template');
  console.error('   ❌ fix menu structure  (缺少类型)');
  console.error('   ❌ Fix menu structure  (类型首字母大写)');
  console.error('   ❌ feat:fix menu structure  (缺少空格)');
  console.error('');
  console.error('💡 提示：使用 "git commit" 会自动打开提交模板');
  console.error('');
  process.exit(1);
}

// 检查主题长度
const subject = firstLine.split(':').slice(1).join(':').trim();
if (subject.length > 50) {
  console.warn('');
  console.warn('⚠️  警告：主题行超过50字符，建议缩短');
  console.warn(`   当前长度：${subject.length} 字符`);
  console.warn(`   主题内容：${subject}`);
  console.warn('');
}

// 检查是否首字母小写
if (subject.length > 0 && subject[0] === subject[0].toUpperCase() && subject[0].match(/[a-z]/i)) {
  console.warn('');
  console.warn('⚠️  警告：主题行首字母应该小写');
  console.warn(`   当前：${subject[0]}`);
  console.warn(`   建议：${subject[0].toLowerCase()}${subject.slice(1)}`);
  console.warn('');
}

console.log('✅ 提交信息格式验证通过！');
process.exit(0);
