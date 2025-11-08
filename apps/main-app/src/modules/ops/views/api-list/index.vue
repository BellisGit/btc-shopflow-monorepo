<template>
  <div class="ops-api-list">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="controllerService"
      :right-service="apiService"
      :table-columns="columns"
      :form-items="[]"
      :op="undefined"
      left-title="控制器"
      right-title="接口列表"
      :show-create-time="false"
      :show-update-time="false"
      :enable-key-search="true"
      left-width="320px"
      search-placeholder="搜索接口..."
      @select="handleSelect"
      @load="handleControllerLoad"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OpsApiList'
});

import { computed, ref } from 'vue';
import type { TableColumn } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { useI18n, type CrudService } from '@btc/shared-core';
import { sysApi } from '@/modules/api-services';

const { t } = useI18n();

interface ApiListRecord {
  controller: string;
  className: string;
  tags: string[];
  tagsText: string;
  methodName: string;
  httpMethods: string;
  paths: string;
  description: string;
  notes: string;
  parameters: Array<Record<string, any>>;
}

interface ApiControllerNode {
  id: string;
  label: string;
  className: string;
  simpleName: string;
  tags: string[];
  apis: ApiListRecord[];
}

const controllerList = ref<ApiControllerNode[]>([]);
const controllerMap = ref<Record<string, ApiControllerNode>>({});
const selectedControllerId = ref<string | null>(null);
const loadingDocs = ref(false);

const API_DOCS_TIMEOUT = 5000;
const API_DOCS_TIMEOUT_TOKEN = {};

async function fetchApiDocsWithFallback() {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(API_DOCS_TIMEOUT_TOKEN), API_DOCS_TIMEOUT);
  });

  try {
    const result = await Promise.race([sysApi.apiDocs.list(), timeoutPromise]);
    if (result === API_DOCS_TIMEOUT_TOKEN) {
      console.warn('[OpsApiList] 获取接口文档超时，使用空列表作为回退');
      return [];
    }
    return result;
  } catch (error) {
    console.warn('[OpsApiList] 获取接口文档失败，使用空列表作为回退', error);
    return [];
  }
}

function extractPayload(raw: any) {
  if (!raw) return {};
  if (raw.code !== undefined && raw.data !== undefined) {
    return raw.data;
  }
  return raw;
}

function normalizeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return value ? String(value) : '';
}

function buildControllers(payload: Record<string, any>): ApiControllerNode[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const controllers = Array.isArray(payload) ? payload : Object.values(payload);
  return controllers.map((controller: any) => {
    const simpleName = controller?.simpleName || controller?.className || '';
    const tags: string[] = Array.isArray(controller?.tags) ? controller.tags : [];
    const tagsText = tags.join(' / ');
    const apis = Array.isArray(controller?.apis) ? controller.apis : [];

    const apiRecords: ApiListRecord[] = apis.map((api: any) => {
      const description = api?.description || {};
      const method = normalizeValue(api?.httpMethods).toUpperCase();
      const paths = normalizeValue(api?.paths);
      const parameters = Array.isArray(api?.parameters) ? api.parameters : [];

      return {
        controller: simpleName,
        className: controller?.className || simpleName,
        tags,
        tagsText,
        methodName: api?.methodName || '',
        httpMethods: method,
        paths,
        description: description?.value || '',
        notes: description?.notes || '',
        parameters,
      };
    });

    return {
      id: controller?.className || simpleName,
      label: simpleName,
      className: controller?.className || simpleName,
      simpleName,
      tags,
      apis: apiRecords,
    } satisfies ApiControllerNode;
  });
}

async function ensureDocsLoaded() {
  if (loadingDocs.value) return;
  if (controllerList.value.length) return;

  try {
    loadingDocs.value = true;
    const response = await fetchApiDocsWithFallback();
    const payload = extractPayload(response);
    const nodes = buildControllers(payload);

    controllerList.value = nodes;
    controllerMap.value = nodes.reduce<Record<string, ApiControllerNode>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    if (!selectedControllerId.value && nodes.length > 0) {
      selectedControllerId.value = nodes[0].id;
    }
  } finally {
    loadingDocs.value = false;
  }
}

const controllerService = {
  async list(params?: { keyword?: string }) {
    await ensureDocsLoaded();

    const keyword = params?.keyword ? params.keyword.toLowerCase() : '';
    if (!keyword) {
      return controllerList.value;
    }

    return controllerList.value.filter((controller) => {
      return (
        controller.label.toLowerCase().includes(keyword) ||
        controller.className.toLowerCase().includes(keyword) ||
        controller.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
  },
};

const apiService: CrudService<ApiListRecord> = {
  async page(params: Record<string, any> = {}) {
    await ensureDocsLoaded();

    const controllerId = selectedControllerId.value;
    const keyword = String(params.keyword || '').trim().toLowerCase();
    const page = Number(params.page || 1);
    const size = Number(params.size || 20);

    let records: ApiListRecord[] = [];
    if (controllerId && controllerMap.value[controllerId]) {
      records = controllerMap.value[controllerId].apis;
    }

    if (keyword) {
      records = records.filter((item) => {
        const candidates = [
          item.controller,
          item.className,
          item.methodName,
          item.httpMethods,
          item.paths,
          item.description,
          item.notes,
          item.tagsText,
        ];
        return candidates.some((value) => value && value.toLowerCase().includes(keyword));
      });
    }

    const total = records.length;
    const startIndex = (page - 1) * size;
    const list = records.slice(startIndex, startIndex + size);

    return {
      list,
      total,
    };
  },
  async add() {
    throw new Error('接口列表不支持新增操作');
  },
  async update() {
    throw new Error('接口列表不支持编辑操作');
  },
  async delete() {
    throw new Error('接口列表不支持删除操作');
  },
  async deleteBatch() {
    throw new Error('接口列表不支持删除操作');
  },
};

const columns = computed<TableColumn[]>(() => [
  {
    type: 'index',
    width: 60,
    label: '#',
    align: 'center',
    headerAlign: 'center',
  },
  {
    prop: 'controller',
    label: t('ops.api_list.fields.controller'),
    minWidth: 200,
    align: 'center',
    headerAlign: 'center',
    showOverflowTooltip: true,
  },
  {
    prop: 'tagsText',
    label: t('ops.api_list.fields.tags'),
    minWidth: 160,
    align: 'center',
    headerAlign: 'center',
    formatter: (row: ApiListRecord) => row.tagsText || '-',
    showOverflowTooltip: true,
  },
  {
    prop: 'methodName',
    label: t('ops.api_list.fields.name'),
    minWidth: 160,
    align: 'center',
    headerAlign: 'center',
    showOverflowTooltip: true,
  },
  {
    prop: 'httpMethods',
    label: t('ops.api_list.fields.method'),
    width: 140,
    align: 'center',
    headerAlign: 'center',
    formatter: (row: ApiListRecord) => row.httpMethods || '-',
  },
  {
    prop: 'paths',
    label: t('ops.api_list.fields.path'),
    minWidth: 260,
    align: 'center',
    headerAlign: 'center',
    showOverflowTooltip: true,
  },
  {
    prop: 'description',
    label: t('ops.api_list.fields.description'),
    minWidth: 220,
    align: 'center',
    headerAlign: 'center',
    showOverflowTooltip: true,
  },
  {
    prop: 'notes',
    label: t('ops.api_list.fields.notes'),
    minWidth: 220,
    align: 'center',
    headerAlign: 'center',
    formatter: (row: ApiListRecord) => row.notes || '-',
    showOverflowTooltip: true,
  },
  {
    prop: 'parameters',
    label: t('ops.api_list.fields.parameters'),
    minWidth: 220,
    align: 'center',
    headerAlign: 'center',
    component: {
      name: 'BtcCodeJson',
      props: {
        popover: true,
        maxLength: 800,
      },
    },
  },
]);

const tableGroupRef = ref();

function handleSelect(item: any) {
  selectedControllerId.value = item?.id || null;
}

function handleControllerLoad(list: ApiControllerNode[]) {
  if (!selectedControllerId.value && list.length > 0) {
    selectedControllerId.value = list[0].id;
  }
}
</script>

<style scoped lang="scss">
.ops-api-list {
  height: 100%;
  overflow: hidden;

  :deep(.btc-add-btn),
  :deep(.btc-multi-delete-btn),
  :deep(.btc-upsert) {
    display: none !important;
  }
}
</style>

