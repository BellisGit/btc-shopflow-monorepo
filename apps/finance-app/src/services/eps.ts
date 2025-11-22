import epsModule, { service as rawService, list as rawList } from 'virtual:eps';

console.log('[Finance EPS Service] Raw epsModule:', epsModule);
console.log('[Finance EPS Service] Raw rawService:', rawService);
console.log('[Finance EPS Service] Raw rawList:', rawList);

const service = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const list = rawList ?? (epsModule as any)?.list ?? [];

console.log('[Finance EPS Service] Final service:', service);
console.log('[Finance EPS Service] Final list:', list);

export { service, list };
export default service;
