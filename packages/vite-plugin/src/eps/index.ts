/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Plugin } from 'vite';
import { generateEps } from './generator';
import fs from 'fs';
import path from 'path';
import type { EpsPluginOptions } from './types';

/**
 * EPS Vite 插件（支持虚拟模块）
 */
export function epsPlugin(options: EpsPluginOptions): Plugin {
  const { epsUrl, outputDir = 'build/eps' } = options;

  return {
    name: 'vite-plugin-eps',

    async buildStart() {
      console.log('[EPS] 开始生成服务层...');

      try {
        // 从后端获取 API 元数据
        const response = await fetch(epsUrl);
        const apiMeta = await response.json();

        // 生成代码文件
        await generateEps(apiMeta, outputDir);

        console.log('[EPS] 服务层生成成功');
      } catch (error) {
        console.error('[EPS] 生成失败:', error);
      }
    },

    // 虚拟模块解析
    resolveId(id: string) {
      if (id === 'virtual:eps') {
        // 返回特殊标识，以 \0 开头表示虚拟模块
        return '\0virtual:eps';
      }
      return null;
    },

    // 虚拟模块加载
    load(id: string) {
      if (id === '\0virtual:eps') {
        // 读取生成的 JSON 文件
        const jsonPath = path.resolve(outputDir, 'eps.json');

        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf-8');

          // 返回模块代码
          return `
            const epsData = ${content};
            export default epsData;
          `;
        } else {
          console.warn('[EPS] eps.json 文件不存在');
          return `export default {};`;
        }
      }
      return null;
    },
  };
}
