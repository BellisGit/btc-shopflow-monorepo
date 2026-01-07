/**
 * 环境变量验证和类型定义
 * 使用 Zod 进行运行时验证，确保环境变量类型安全
 */

import { z } from 'zod';

// 环境变量 Schema
const envSchema = z.object({
  // Node 环境
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MODE: z.enum(['development', 'preview', 'production']).default('development'),

  // 应用配置
  VITE_APP_TITLE: z.string().default('BTC ShopFlow'),
  VITE_APP_BASE_API: z.string().url().optional(),
  VITE_APP_UPLOAD_URL: z.string().url().optional(),
  VITE_DOCS_URL: z.string().url().optional(),
  VITE_APP_WS_URL: z.string().url().optional(),

  // 端口配置（可选）
  VITE_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),

  // 其他 Vite 环境变量
  VITE_PREVIEW: z.string().transform((val) => val === 'true').optional(),
}).passthrough(); // 允许其他未定义的环境变量

// 类型定义
export type Env = z.infer<typeof envSchema>;

// 验证并导出环境变量
let env: Env;

try {
  // 在浏览器环境中，使用 import.meta.env
  // 在 Node 环境中，使用 process.env
  const rawEnv = typeof window !== 'undefined' 
    ? (import.meta as any).env 
    : process.env;

  env = envSchema.parse(rawEnv);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('环境变量验证失败:', error.errors);
    throw new Error(`环境变量配置错误: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
  }
  throw error;
}

// 导出验证后的环境变量
export { env };

// 便捷访问函数
export const getEnv = () => env;

// 环境判断函数
export const isDevelopment = () => env.MODE === 'development' || env.NODE_ENV === 'development';
export const isProduction = () => env.MODE === 'production' || env.NODE_ENV === 'production';
export const isPreview = () => env.MODE === 'preview';

