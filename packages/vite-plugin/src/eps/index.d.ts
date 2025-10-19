import type { Plugin } from 'vite';
import type { EpsPluginOptions } from './types';
/**
 * EPS Vite 插件（支持虚拟模块和热更新）
 */
export declare function epsPlugin(options: EpsPluginOptions): Plugin;
