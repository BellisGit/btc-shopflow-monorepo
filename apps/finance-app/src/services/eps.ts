import epsModule, { service as rawService, list as rawList } from 'virtual:eps';

const service = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const list = rawList ?? (epsModule as any)?.list ?? [];

export { service, list };
export default service;
