/**
 * 自动生成导航栏配置
 * 根据一级文件夹名称自动生成 nav
 */
import { logger } from '@btc/shared-core';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../../');

interface NavItem {
  text: string;
  link: string;
  activeMatch?: string;
}

// 文件夹到导航文本的映射
const folderToNav: Record<string, string> = {
  'guides': '指南',
  'adr': 'ADR',
  'sop': 'SOP',
  'packages': '包',
  'components': '组件',
  'api': 'API',
  'timeline': '时间线',
  'projects': '项目',
  'types': '类型',
  'tags': '标签',
};

// 导航顺序（数组顺序即为显示顺序）
const navOrder = [
  'guides',
  'adr',
  'sop',
  'packages',
  'components',
];

/**
 * 查找文件夹下的第一个 .md 文件（作为默认链接）
 */
function findFirstMarkdown(dir: string): string | null {
  try {
    // 先查找 index.md
    const indexPath = path.join(dir, 'index.md');
    if (fs.existsSync(indexPath)) {
      return '/index';
    }

    // 查找子目录
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        const indexPath = path.join(subDir, 'index.md');
        if (fs.existsSync(indexPath)) {
          return `/${entry.name}/index`;
        }

        // 查找第一个 .md 文件
        const subEntries = fs.readdirSync(subDir);
        const firstMd = subEntries.find(f => f.endsWith('.md'));
        if (firstMd) {
          return `/${entry.name}/${firstMd.replace('.md', '')}`;
        }
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
        return `/${entry.name.replace('.md', '')}`;
      }
    }
  } catch (error) {
    logger.warn(`Failed to find markdown in ${dir}:`, error);
  }

  return null;
}

/**
 * 生成导航配置
 */
export function generateNav(): NavItem[] {
  const nav: NavItem[] = [
    { text: '首页', link: '/', activeMatch: '^/$' }
  ];

  for (const folder of navOrder) {
    const folderPath = path.join(docsRoot, folder);

    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      continue;
    }

    // 查找第一个 markdown 文件
    const firstMd = findFirstMarkdown(folderPath);
    if (!firstMd) {
      continue;
    }

    const text = folderToNav[folder] || folder;
    const link = `/${folder}${firstMd}`;

    // 添加 activeMatch 规则：只要路径以 /folder/ 开头就激活
    nav.push({
      text,
      link,
      activeMatch: `^/${folder}/`
    });
  }

  return nav;
}

