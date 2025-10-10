/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin, ViteDevServer } from 'vite';
import { generateEps } from './generator';
import fs from 'fs';
import path from 'path';
import type { EpsPluginOptions } from './types';

/**
 * EPS Vite 插件（支持虚拟模块和热更新）
 */
export function epsPlugin(options: EpsPluginOptions): Plugin {
  const { epsUrl, outputDir = 'build/eps', watch = true } = options;

  // 缓存 EPS 数据
  let epsDataCache: any = null;
  let updateTimer: NodeJS.Timeout | null = null;

  /**
   * 获取并生成 EPS 数据
   */
  async function fetchAndGenerateEps(): Promise<any> {
    const response = await fetch(epsUrl);
    const apiMeta = await response.json();
    await generateEps(apiMeta, outputDir);
    return apiMeta;
  }

  /**
   * 检查 EPS 数据是否有变化
   */
  function hasEpsChanged(newData: any): boolean {
    if (!epsDataCache) return true;
    return JSON.stringify(newData) !== JSON.stringify(epsDataCache);
  }

  return {
    name: 'vite-plugin-eps',

    async buildStart() {
      // 如果没有 epsUrl，跳过生成（使用本地文件）
      if (!epsUrl) {
        console.log('[EPS] Using local mock data mode');
        return;
      }

      console.log('[EPS] Generating service layer...');

      try {
        epsDataCache = await fetchAndGenerateEps();
        console.log('[EPS] Service layer generated successfully');
      } catch (error) {
        console.error('[EPS] Generation failed:', error);
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

    // 开发模式下热更新
    configureServer(server: ViteDevServer) {
      // 没有 epsUrl 时不启用热更新
      if (!epsUrl || !watch) {
        return;
      }

      if (watch) {
        console.log('[EPS] Auto-update enabled (every 10s)');

        // 每 10 秒检查一次更新
        updateTimer = setInterval(async () => {
          try {
            const response = await fetch(epsUrl);
            const newApiMeta = await response.json();

            // 检查是否有变化
            if (hasEpsChanged(newApiMeta)) {
              console.log('[EPS] API changes detected, updating...');

              await generateEps(newApiMeta, outputDir);
              epsDataCache = newApiMeta;

              // 触发热更新
              const module = server.moduleGraph.getModuleById('\0virtual:eps');
              if (module) {
                server.moduleGraph.invalidateModule(module);
                server.ws.send({
                  type: 'full-reload',
                  path: '*',
                });
              }

              console.log('[EPS] Service layer updated, page will reload');
            }
          } catch (error) {
            // 静默失败，避免频繁报错
          }
        }, 10000);

        // 服务器关闭时清理定时器
        server.httpServer?.on('close', () => {
          if (updateTimer) {
            clearInterval(updateTimer);
            console.log('[EPS] Auto-update stopped');
          }
        });
      }
    },

    // 构建结束时清理资源
    buildEnd() {
      if (updateTimer) {
        clearInterval(updateTimer);
      }
    },
  };
}
