import epsModule, { service as rawService, list as rawList } from 'virtual:eps';
import { wrapServiceTree } from '@btc/shared-core';

const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const service = wrapServiceTree(raw);
const list = rawList ?? (epsModule as any)?.list ?? [];

export { service, list };
export default service;
