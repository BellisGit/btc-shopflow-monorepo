<template>
  <div class="dictionary-file-categories">
    <btc-crud ref="crudRef" :service="categoryService">
      <btc-row>
        <btc-refresh-btn />
        <btc-add-btn />
        <btc-multi-delete-btn />
        <btc-flex1 />
        <btc-search-key />
        <btc-crud-actions />
      </btc-row>

      <btc-row>
        <btc-table
          ref="tableRef"
          :columns="columns"
          border
          :op="{ buttons: ['edit', 'delete'] }"
        />
      </btc-row>

      <btc-row>
        <btc-flex1 />
        <btc-pagination />
      </btc-row>

      <btc-upsert ref="upsertRef" :items="formItems" width="520px" />
    </btc-crud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n, type CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'DictionaryFileCategories',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const epsCategoryService = service.upload?.file?.category;

function ensureMethod(method: string) {
  const fn = (epsCategoryService as Record<string, any>)?.[method];
  if (typeof fn !== 'function') {
    throw new Error(`[DictionaryFileCategories] EPS 服务 upload.file.category.${method} 未加载，请先同步 EPS 元数据`);
  }
  return fn;
}

function normalizePageResponse(response: any, page: number, size: number) {
  if (!response) {
    return {
      list: [],
      total: 0,
      pagination: { page, size, total: 0 }
    };
  }

  if (Array.isArray(response.list) && response.pagination) {
    const { pagination } = response;
    const total = Number(
      pagination.total ?? pagination.count ?? response.total ?? response.pagination?.total ?? 0
    );
    return {
      list: response.list,
      total,
      pagination: {
        page: Number(pagination.page ?? page),
        size: Number(pagination.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.records)) {
    const total = Number(response.total ?? response.pagination?.total ?? 0);
    return {
      list: response.records,
      total,
      pagination: {
        page: Number(response.current ?? page),
        size: Number(response.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.list) && typeof response.total !== 'undefined') {
    return {
      list: response.list,
      total: Number(response.total ?? 0),
      pagination: {
        page,
        size,
        total: Number(response.total ?? 0)
      }
    };
  }

  if (Array.isArray(response)) {
    return {
      list: response,
      total: response.length,
      pagination: { page, size, total: response.length }
    };
  }

  return {
    list: [],
    total: 0,
    pagination: { page, size, total: 0 }
  };
}

const categoryService: CrudService<any> = {
  async page(params: any = {}) {
    const page = Number(params.page ?? 1);
    const size = Number(params.size ?? 20);
    const keyword = params.keyword ? String(params.keyword) : undefined;

    const payload: Record<string, any> = { page, size };
    if (keyword) {
      payload.keyword = keyword;
    }

    const pageFn = ensureMethod('page');
    const response = await pageFn(payload);
    const normalized = normalizePageResponse(response, page, size);
    return {
      list: normalized.list,
      total: normalized.total,
      pagination: normalized.pagination,
    };
  },
  async add(data: any) {
    const addFn = ensureMethod('add');
    await addFn(data);
  },
  async update(data: any) {
    const updateFn = ensureMethod('update');
    await updateFn(data);
  },
  async delete(id: string | number) {
    const deleteFn = ensureMethod('delete');
    await deleteFn(id);
  },
  async deleteBatch(ids: (string | number)[]) {
    const deleteFn = ensureMethod('delete');
    await Promise.all(ids.map((id) => deleteFn(id)));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection' },
  { label: t('dictionary.fileCategories.code'), prop: 'category', minWidth: 140, showOverflowTooltip: true },
  { label: t('dictionary.fileCategories.label'), prop: 'categoryLabel', minWidth: 160, showOverflowTooltip: true },
  { label: t('dictionary.fileCategories.mime'), prop: 'mime', minWidth: 160, showOverflowTooltip: true },
  { label: t('dictionary.fileCategories.createdAt'), prop: 'createdAt', width: 170 },
  { label: t('dictionary.fileCategories.updatedAt'), prop: 'updatedAt', width: 170 },
]);

const formItems = computed<FormItem[]>(() => [
  {
    label: t('dictionary.fileCategories.code'),
    prop: 'category',
    required: true,
    component: {
      name: 'el-input',
      props: {
        maxlength: 60,
        placeholder: t('dictionary.fileCategories.codePlaceholder'),
      },
    },
  },
  {
    label: t('dictionary.fileCategories.label'),
    prop: 'categoryLabel',
    required: true,
    component: {
      name: 'el-input',
      props: {
        maxlength: 60,
        placeholder: t('dictionary.fileCategories.labelPlaceholder'),
      },
    },
  },
  {
    label: t('dictionary.fileCategories.mime'),
    prop: 'mime',
    component: {
      name: 'el-input',
      props: {
        maxlength: 255,
        placeholder: t('dictionary.fileCategories.mimePlaceholder'),
      },
    },
  },
]);
</script>

<style scoped lang="scss">
.dictionary-file-categories {
  height: 100%;
  padding: 10px;
}
</style>

