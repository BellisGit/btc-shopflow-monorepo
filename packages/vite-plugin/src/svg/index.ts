/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import { readFileSync, readdirSync } from 'fs';
import { basename, extname } from 'path';
import { optimize } from 'svgo';
import { rootDir } from '../utils';
import { config } from '../config';

let svgIcons: string[] = [];

/**
 * 递归查找 SVG 文件
 */
function findSvg(dir: string): string[] {
  const arr: string[] = [];

  try {
    const dirs = readdirSync(dir, {
      withFileTypes: true,
    });

    // 获取当前目录的模块名
    const moduleName = dir.match(/[/\\](?:src[/\\](?:plugins|modules)[/\\])([^/\\]+)/)?.[1] || '';

    for (const d of dirs) {
      if (d.isDirectory()) {
        arr.push(...findSvg(dir + d.name + '/'));
      } else {
        if (extname(d.name) === '.svg') {
          const baseName = basename(d.name, '.svg');

          // 判断是否需要跳过拼接模块名
          let shouldSkip = config.svg.skipNames?.includes(moduleName);

          // 跳过包含 icon-
          if (baseName.includes('icon-')) {
            shouldSkip = true;
          }

          const iconName = shouldSkip ? baseName : `${moduleName}-${baseName}`;

          svgIcons.push(iconName);

          const svgContent = readFileSync(dir + d.name).toString();
          // 提取 viewBox 或使用 width/height
          const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
          const widthMatch = svgContent.match(/width=["']([^"']+)["']/);
          const heightMatch = svgContent.match(/height=["']([^"']+)["']/);

          let viewBox = '';
          if (viewBoxMatch) {
            viewBox = `viewBox="${viewBoxMatch[1]}"`;
          } else if (widthMatch && heightMatch) {
            viewBox = `viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`;
          }

          // 简化：只提取 path、circle、rect 等核心内容
          const innerContent = svgContent
            .replace(/<svg[^>]*>/, '')
            .replace(/<\/svg>/, '')
            .replace(/(\r\n|\n|\r)/gm, '');

          const svg = `<symbol id="icon-${iconName}" ${viewBox}>${innerContent}</symbol>`;

          arr.push(svg);
        }
      }
    }
  } catch (_err) {
    // 目录不存在或无法访问，忽略
  }

  return arr;
}

/**
 * 编译 SVG
 */
function compilerSvg(): string {
  svgIcons = [];

  return findSvg(rootDir('./src/'))
    .map((e) => {
      const result = optimize(e);
      return result.data || e;
    })
    .join('');
}

/**
 * 创建 SVG sprite
 */
export async function createSvg(): Promise<{ code: string; svgIcons: string[] }> {
  const html = compilerSvg();

  const code = `
if (typeof window !== 'undefined') {
	function loadSvg() {
		const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgDom.style.position = 'absolute';
		svgDom.style.width = '0';
		svgDom.style.height = '0';
		svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
		svgDom.setAttribute('xmlns:link','http://www.w3.org/1999/xlink');
		svgDom.innerHTML = '${html}';
		document.body.insertBefore(svgDom, document.body.firstChild);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadSvg);
	} else {
		loadSvg();
	}
}
	`;

  return { code, svgIcons };
}

/**
 * SVG 图标插件
 * 扫描项目中的 SVG 文件，自动生成 SVG sprite
 */
export function svgPlugin(): Plugin {
  let svgCode = '';
  let iconList: string[] = [];

  return {
    name: 'btc:svg',

    async configResolved() {
      // 生成 SVG sprite
      const result = await createSvg();
      svgCode = result.code;
      iconList = result.svgIcons;

      if (iconList.length > 0) {
        console.log(`[btc:svg] Found ${iconList.length} SVG icons`);
      }
    },

    resolveId(id: string) {
      if (id === 'virtual:svg-icons') {
        return '\0virtual:svg-icons';
      }
    },

    load(id: string) {
      if (id === '\0virtual:svg-icons') {
        return svgCode;
      }
    },

    transformIndexHtml() {
      // 也可以通过 HTML 注入
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `import 'virtual:svg-icons'`,
          injectTo: 'head',
        },
      ];
    },
  };
}
