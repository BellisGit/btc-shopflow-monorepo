// 注意：此文件被标记为副作用模块，确保完整的 EPS 数据被包含
// 防止 tree-shaking 移除未直接访问的 EPS 服务
import epsModule, { service as rawService, list as rawList } from 'virtual:eps';

const service = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const list = rawList ?? (epsModule as any)?.list ?? [];

// 确保完整的 service 对象被导出和使用
// 通过直接导出整个对象，而不是部分属性，防止 tree-shaking
export { service, list };
export default service;
