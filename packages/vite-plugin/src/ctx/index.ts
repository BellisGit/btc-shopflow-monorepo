/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import fs from 'fs';
import axios from 'axios';
import { rootDir, error } from '../utils';
import { config } from '../config';

export interface CtxData {
  modules?: string[];
  serviceLang?: string;
}

/**
 * 创建上下文数据
 */
export async function createCtx(): Promise<CtxData> {
  const ctx: CtxData = {
    serviceLang: 'Node',
    modules: [],
  };

  // 扫描 modules 目录
  const modulesDir = rootDir('./src/modules');

  try {
    if (fs.existsSync(modulesDir)) {
      const list = fs.readdirSync(modulesDir);
      ctx.modules = list.filter((e) => !e.includes('.'));
    }
  } catch (_err) {
    // 目录不存在，忽略
  }

  // 从后端获取服务语言类型
  if (config.reqUrl) {
    try {
      const res = await axios.get(config.reqUrl + '/admin/base/comm/program', {
        timeout: 5000,
      });

      const { code, data, message } = res.data;

      if (code === 1000) {
        ctx.serviceLang = data || 'Node';
      } else {
        error(`[btc:ctx] ${message}`);
      }
    } catch (_err: any) {
      // 后端服务未启动或不可用，使用默认值
      // console.error('[btc:ctx]', _err.message);
    }
  }

  return ctx;
}

/**
 * 上下文插件（自动扫描模块）
 * 扫描 src/modules/ 目录，获取所有模块名和服务语言类型
 */
export function ctxPlugin(): Plugin {
  let ctxData: CtxData = {};

  return {
    name: 'btc:ctx',

		async configResolved() {
			// 生成上下文数据
			ctxData = await createCtx();
			
			if (ctxData.modules && ctxData.modules.length > 0) {
				console.info(
					`[btc:ctx] 找到 ${ctxData.modules.length} 个模块: ${ctxData.modules.join(', ')}`
				);
			}
			
			console.info(`[btc:ctx] 服务语言: ${ctxData.serviceLang}`);
		},

    resolveId(id: string) {
      if (id === 'virtual:ctx') {
        return '\0virtual:ctx';
      }
    },

    load(id: string) {
      if (id === '\0virtual:ctx') {
        return `export default ${JSON.stringify(ctxData, null, 2)}`;
      }
    },
  };
}
