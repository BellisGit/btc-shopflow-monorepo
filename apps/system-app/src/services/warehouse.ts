import type { CrudService } from '@btc/shared-core';
import { service } from '@services/eps';

function resolveWarehouseService() {
  const warehouse = (service as Record<string, any>)?.logistics?.warehouse;
  if (!warehouse) {
    throw new Error('[warehouseService] EPS 服务 logistics.warehouse 未加载，请先同步 EPS 元数据');
  }
  return warehouse as Record<string, any>;
}

function ensureMethod(serviceKey: string, method: string) {
  const warehouse = resolveWarehouseService();
  const entity = warehouse?.[serviceKey];
  if (!entity) {
    throw new Error(`[warehouseService] 未找到实体 ${serviceKey} 的 EPS 服务`);
  }

  const fn = entity?.[method];
  if (typeof fn !== 'function') {
    throw new Error(`[warehouseService] EPS 服务 logistics.warehouse.${serviceKey}.${method} 未定义`);
  }

  return fn as (...args: any[]) => Promise<any>;
}

function normalizePageResponse(response: any, page: number, size: number) {
  if (!response) {
    return { list: [], total: 0, pagination: { page, size, total: 0 } };
  }

  if (Array.isArray(response.list) && response.pagination) {
    const { pagination } = response;
    const total = Number(pagination.total ?? response.total ?? 0);
    return {
      list: response.list,
      total,
      pagination: {
        page: Number(pagination.page ?? page),
        size: Number(pagination.size ?? size),
        total,
      },
    };
  }

  if (Array.isArray(response.records)) {
    const total = Number(response.total ?? 0);
    return {
      list: response.records,
      total,
      pagination: {
        page: Number(response.current ?? page),
        size: Number(response.size ?? size),
        total,
      },
    };
  }

  if (Array.isArray(response.list) && typeof response.total !== 'undefined') {
    const total = Number(response.total ?? 0);
    return {
      list: response.list,
      total,
      pagination: { page, size, total },
    };
  }

  if (Array.isArray(response)) {
    return {
      list: response,
      total: response.length,
      pagination: { page, size, total: response.length },
    };
  }

  return { list: [], total: 0, pagination: { page, size, total: 0 } };
}

interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
  [key: string]: any;
}

export function createWarehouseCrudService(serviceKey: string): CrudService<any> {
  return {
    async page(params: PageParams = {}) {
      const page = Number(params.page ?? 1);
      const size = Number(params.size ?? 20);
      const payload: Record<string, any> = { page, size };
      if (params.keyword) {
        payload.keyword = params.keyword;
      }

      const pageFn = ensureMethod(serviceKey, 'page');
      const response = await pageFn(payload);
      const normalized = normalizePageResponse(response, page, size);
      return {
        list: normalized.list,
        total: normalized.total,
        pagination: normalized.pagination,
      };
    },
    async add(data: any) {
      const addFn = ensureMethod(serviceKey, 'add');
      await addFn(data);
    },
    async update(data: any) {
      const updateFn = ensureMethod(serviceKey, 'update');
      await updateFn(data);
    },
    async delete(id: string | number) {
      const deleteFn = ensureMethod(serviceKey, 'delete');
      await deleteFn(id);
    },
    async deleteBatch(ids: (string | number)[]) {
      const deleteFn = ensureMethod(serviceKey, 'delete');
      await Promise.all(ids.map((id) => deleteFn(id)));
    },
  };
}
