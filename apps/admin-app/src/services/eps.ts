import epsModule, { service as rawService, list as rawList } from 'virtual:eps';
import { normalizeKeywordIds } from '@btc/shared-core/utils/array';

type AnyRecord = Record<string, any>;

function normalizeKeywordObject(input: any): AnyRecord {
  // 将 keyword 统一为对象
  if (input === null || input === undefined) return {};
  if (typeof input === 'object' && !Array.isArray(input)) return { ...input };
  // 非对象（字符串/数字/数组等）不做推断，按约定收敛为空对象
  return {};
}

function normalizePageParams(params: AnyRecord | undefined | null, serviceNode?: any): AnyRecord {
  const p: AnyRecord = params && typeof params === 'object' ? { ...params } : {};
  // 统一 page/size 类型为 number
  if (p.page != null) p.page = Number(p.page) || 1;
  else p.page = 1;
  if (p.size != null) p.size = Number(p.size) || 20;
  else p.size = 20;

  // 收敛 keyword
  const keywordObj = normalizeKeywordObject(p.keyword);

  // 如果 serviceNode 有 search 配置，补充缺失的字段
  if (serviceNode && serviceNode.search) {
    const searchConfig = serviceNode.search;

    // 处理 fieldEq：确保所有配置的字段都在 keyword 对象中
    if (Array.isArray(searchConfig.fieldEq) && searchConfig.fieldEq.length > 0) {
      searchConfig.fieldEq.forEach((field: any) => {
        const fieldName = typeof field === 'string' ? field : (field?.propertyName || field?.field || field?.name);
        if (fieldName && keywordObj[fieldName] === undefined) {
          // 如果字段不存在，补充为空字符串
          keywordObj[fieldName] = '';
        }
      });
    }

    // 处理 fieldLike：确保所有配置的字段都在 keyword 对象中
    if (Array.isArray(searchConfig.fieldLike) && searchConfig.fieldLike.length > 0) {
      searchConfig.fieldLike.forEach((field: any) => {
        const fieldName = typeof field === 'string' ? field : (field?.propertyName || field?.field || field?.name);
        if (fieldName && keywordObj[fieldName] === undefined) {
          // 如果字段不存在，补充为空字符串
          keywordObj[fieldName] = '';
        }
      });
    }
  }

  // 统一处理 keyword 对象中的 ids 字段为数组格式
  // 使用 normalizeKeywordIds 确保空字符串、null、undefined 都转换为空数组
  p.keyword = normalizeKeywordIds(keywordObj);

  return p;
}

function wrapServiceTree<T extends AnyRecord>(svc: T): T {
  const cache = new WeakMap<object, any>();

  function wrapNode(node: any, parentNode?: any): any {
    if (node === null || typeof node !== 'object') return node;
    if (cache.has(node)) return cache.get(node);
    const wrapped: AnyRecord = Array.isArray(node) ? [] : {};
    cache.set(node, wrapped);
    for (const key of Object.keys(node)) {
      const val = (node as AnyRecord)[key];
      if (typeof val === 'function' && (key === 'page' || key === 'list')) {
        const original = val;
        // 传递当前节点作为 serviceNode，以便 normalizePageParams 可以访问 search 配置
        (wrapped as AnyRecord)[key] = async (params?: AnyRecord) => {
          const np = normalizePageParams(params, node);
          return await original(np);
        };
      } else if (val && typeof val === 'object') {
        (wrapped as AnyRecord)[key] = wrapNode(val, node);
      } else {
        (wrapped as AnyRecord)[key] = val;
      }
    }
    return wrapped;
  }

  return wrapNode(svc);
}

const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const service = wrapServiceTree(raw as AnyRecord);
const list = rawList ?? (epsModule as any)?.list ?? [];

export { service, list };
export default service;
