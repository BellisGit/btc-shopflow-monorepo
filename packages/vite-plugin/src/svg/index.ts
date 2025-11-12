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

    // 检查是否是 assets/icons 目录
    const isAssetsIcons = dir.includes('/assets/icons/') || dir.includes('\\assets\\icons\\');

    for (const d of dirs) {
      if (d.isDirectory()) {
        arr.push(...findSvg(dir + d.name + '/'));
      } else {
        if (extname(d.name) === '.svg') {
          const baseName = basename(d.name, '.svg');

          // 判断是否需要跳过拼接模块名
          let shouldSkip = config.svg?.skipNames?.includes(moduleName);

          // 跳过包含 icon-
          if (baseName.includes('icon-')) {
            shouldSkip = true;
          }

          // 如果是 assets/icons 目录，直接使用文件名，不拼接模块名
          if (isAssetsIcons) {
            shouldSkip = true;
          }

          // 如果 moduleName 为空，也跳过拼接
          if (!moduleName) {
            shouldSkip = true;
          }

          const iconName = shouldSkip ? baseName : `${moduleName}-${baseName}`;

          svgIcons.push(iconName);

          let svgContent = readFileSync(dir + d.name).toString();
          // 清理 XML 声明和 DOCTYPE
          svgContent = svgContent
            .replace(/<\?xml[^>]*\?>/g, '')
            .replace(/<!DOCTYPE[^>]*>/g, '');

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

  // 扫描 src/ 目录下的 modules 和 plugins
  const srcSvgs = findSvg(rootDir('./src/'));

  // 扫描 assets/icons 目录
  const assetsSvgs = findSvg(rootDir('./src/assets/icons/'));

  // 扫描共享组件的 icons 目录，确保跨应用的公共组件也能使用这些图标
  const sharedAssetsSvgs = findSvg(rootDir('../packages/shared-components/src/assets/icons/'));

  return [...srcSvgs, ...assetsSvgs, ...sharedAssetsSvgs]
    .map((e) => {
      // 检查是否是 bg.svg（包含 icon-bg symbol）
      const isBgIcon = e.includes('id="icon-bg"');
      
      if (isBgIcon) {
        // bg.svg 不进行优化，保留所有原始属性（特别是 fill 属性）
        return e;
      }
      
      // 其他 SVG 正常优化，配置 svgo 保留 fill 属性
      const result = optimize(e, {
        plugins: [
          {
            name: 'removeUselessStrokeAndFill',
            params: {
              fill: false,  // 禁用移除 fill
              stroke: false // 禁用移除 stroke
            }
          }
        ],
        multipass: false
      });
      return result.data || e;
    })
    .join('');
}

/**
 * 创建 SVG sprite
 */
export async function createSvg(): Promise<{ code: string; svgIcons: string[] }> {
  const html = compilerSvg();
  // 使用 JSON.stringify 来安全地转义所有特殊字符
  const escapedHtml = JSON.stringify(html);

  const code = `
if (typeof window !== 'undefined') {
	function loadSvg() {
		const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgDom.style.position = 'absolute';
		svgDom.style.width = '0';
		svgDom.style.height = '0';
		svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
		svgDom.setAttribute('xmlns:link','http://www.w3.org/1999/xlink');
		svgDom.innerHTML = ${escapedHtml};
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
    enforce: 'pre',

		async configResolved() {
			// 生成 SVG sprite
			const result = await createSvg();
			svgCode = result.code;
			iconList = result.svgIcons;

			if (iconList.length > 0) {
				console.info(`[btc:svg] 找到 ${iconList.length} 个 svg 图标`);
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
      // 直接注入 SVG sprite 代码到 HTML，避免虚拟模块的 CORS 问题
      if (svgCode) {
        return [
          {
            tag: 'script',
            children: svgCode,
            injectTo: 'body-prepend',
          },
        ];
      }
      return [];
    },
  };
}
