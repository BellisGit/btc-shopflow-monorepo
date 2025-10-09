/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import type { EpsData } from './types';

/**
 * 生成 EPS 服务代码
 * @param apiMeta API 元数据
 * @param outputDir 输出目录
 */
export async function generateEps(apiMeta: any, outputDir: string) {
  // 确保目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 转换为 EPS 数据格式
  const epsData: EpsData = {};

  if (apiMeta.modules) {
    apiMeta.modules.forEach((module: any) => {
      epsData[module.name] = module.api || [];
    });
  }

  // 生成 eps.json
  const jsonPath = path.join(outputDir, 'eps.json');
  fs.writeFileSync(jsonPath, JSON.stringify(epsData, null, 2), 'utf-8');

  console.log(`[EPS] Generated: ${jsonPath}`);
}
