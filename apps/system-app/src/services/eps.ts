// 注意：此文件被标记为副作用模块（package.json 中的 sideEffects），确保完整的 EPS 数据被包含
// 防止 tree-shaking 移除未直接访问的 EPS 服务
import epsModule, { service as rawService, list as rawList } from 'virtual:eps';
import { wrapServiceTree } from '@btc/shared-core';

const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const service = wrapServiceTree(raw);
const list = rawList ?? (epsModule as any)?.list ?? [];

// 确保完整的 service 对象被导出
// package.json 中的 sideEffects 标记会确保此模块不被 tree-shaking 移除
export { service, list };
export default service;
