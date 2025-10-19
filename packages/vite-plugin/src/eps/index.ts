import type { Plugin, ViteDevServer } from 'vite';
import { createEps, fetchEpsData } from './generator';
import type { EpsPluginOptions } from './types';
import { info, error } from './utils';

/**
 * EPS Vite 插件（支持虚拟模块和热更新）
 */
export function epsPlugin(options: EpsPluginOptions & { reqUrl?: string }): Plugin {
  const { epsUrl = '', outputDir = 'build/eps', watch = true, reqUrl = '' } = options;

  // 虚拟模块 ID 列表
  const virtualModuleIds: string[] = [
    'virtual:eps',
    'virtual:eps-json',
  ];

  // EPS 数据缓存
  let epsCache: any = null;
  let cacheTimestamp: number = 0;
  const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 0 : 24 * 60 * 60 * 1000; // 开发模式下不缓存，生产模式24小时缓存

  // 防止并发请求的 Promise 缓存
  let pendingRequest: Promise<any> | null = null;


  // 获取 EPS 数据（带缓存）
  async function getEpsData() {
    const now = Date.now();

    // 如果缓存有效，直接返回缓存数据
    if (epsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return epsCache;
    }

    // 如果已经有请求在进行中，等待该请求完成
    if (pendingRequest) {
      return await pendingRequest;
    }

    // 否则重新获取数据并更新缓存
    console.log('[EPS] 获取 EPS 数据...');

    // 创建 pending 请求
    pendingRequest = (async () => {
      try {
        // 先获取远程数据
        const entities = await fetchEpsData(epsUrl, reqUrl);

        // 然后创建 EPS 服务
        const result = await createEps(epsUrl, reqUrl, outputDir, { list: entities });

        // 更新缓存
        epsCache = result;
        cacheTimestamp = Date.now();
        console.log('[EPS] ✅ EPS 数据已缓存 24 小时');

        return result;
      } catch (err) {
        error(`获取 EPS 数据失败: ${err}`);
        return { service: {}, list: [], isUpdate: false };
      }
    })();

    try {
      return await pendingRequest;
    } finally {
      // 清除 pending 状态
      pendingRequest = null;
    }
  }

  return {
    name: 'vite-plugin-eps',
    enforce: 'pre', // 确保插件在其他插件之前执行

    async buildStart() {
      info('开始生成服务层...');

      try {
        await getEpsData();
        info('服务层生成成功');
      } catch (err) {
        error(`生成失败: ${err}`);
      }
    },

    // 虚拟模块解析
    resolveId(id: string) {
      if (virtualModuleIds.includes(id)) {
        return '\0' + id;
      }
      return null;
    },

    // 虚拟模块加载
    async load(id: string) {
      if (id === '\0virtual:eps') {
        try {
          // 始终使用 getEpsData，它会处理缓存逻辑
          const eps = await getEpsData();
          // 简化虚拟模块日志
          console.log(`[EPS Virtual Module] Generated ${Object.keys(eps.service || {}).length} services`);

          // 参考 cool-admin 的虚拟模块生成
          return `export const eps = ${JSON.stringify(eps)}`;
        } catch (err) {
          error(`加载 EPS 数据失败: ${err}`);
          return `export default {};`;
        }
      }

      if (id === '\0virtual:eps-json') {
        try {
          // 始终使用 getEpsData，它会处理缓存逻辑
          const eps = await getEpsData();
          return `export default ${JSON.stringify(eps.list || [])};`;
        } catch (err) {
          error(`加载 EPS JSON 数据失败: ${err}`);
          return `export default [];`;
        }
      }

      return null;
    },

    // 开发模式下热更新
    configureServer(_server: ViteDevServer) {
      // EPS 数据在项目启动时获取一次，不需要定期更新
      if (watch && epsUrl) {
        info('EPS 数据已缓存 24 小时，仅在项目重启时更新');
      }
    },

    // 热更新处理
    handleHotUpdate({ file, server }) {
      // 文件修改时触发
      if (!['eps.json', 'eps.d.ts'].some((e) => file.includes(e))) {
        // 清除缓存，强制重新获取数据
        epsCache = null;
        cacheTimestamp = 0;

        createEps(epsUrl, reqUrl, outputDir).then((data) => {
          if (data.isUpdate) {
            // 更新缓存
            epsCache = data;
            cacheTimestamp = Date.now();

            // 通知客户端刷新
            server.ws.send({
              type: 'custom',
              event: 'eps-update',
              data,
            });
          }
        });
      }
    },
  };
}
