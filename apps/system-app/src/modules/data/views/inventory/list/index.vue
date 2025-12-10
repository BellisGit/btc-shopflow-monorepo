<template>
  <div class="inventory-list-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedMaterialService"
      :table-columns="materialColumns"
      :form-items="materialFormItems"
      :left-title="t('inventory.dataSource.domain')"
      :right-title="t('menu.inventory.dataSource.list')"
      :show-unassigned="false"
      :enable-key-search="false"
      :show-search-key="false"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <BtcImportBtn
          :columns="materialColumns"
          :on-submit="handleImport"
          :tips="t('inventory.dataSource.list.import.tips')"
        />
      </template>
      <template #actions>
        <el-button type="info" @click="handleExport" :loading="exportLoading">
          <BtcSvg name="export" class="mr-[5px]" />
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, exportTableToExcel } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup, BtcImportBtn, IMPORT_FILENAME_KEY, IMPORT_FORBIDDEN_KEYWORDS_KEY, BtcMessage } from '@btc/shared-components';
import { service } from '@/services/eps';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';

defineOptions({
  name: 'BtcDataInventoryList'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);
const exportLoading = ref(false);

// 统一导出/导入文件名
const exportFilename = computed(() => t('menu.inventory.dataSource.list'));

// 提供导入文件名匹配配置（与导出文件名一致）
provide(IMPORT_FILENAME_KEY, exportFilename);
provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, ['SysPro', 'BOM表', '(', ')', '（', '）']);

// 左侧域列表使用物流域的仓位配置的 me 接口
const domainService = {
  list: async () => {
    try {
      // 调用物流域仓位配置的 me 接口
      const response = await service.logistics?.base?.position?.me?.();

      // 处理响应数据，支持多种数据结构
      let list: any[] = [];

      if (Array.isArray(response)) {
        // 直接返回数组
        list = response;
      } else if (response && typeof response === 'object') {
        // 从 data 字段中提取
        if ('data' in response) {
          const data = response.data;
          if (Array.isArray(data)) {
            list = data;
          } else if (data && typeof data === 'object') {
            // 可能 data 内部还有 data 或 list 字段
            list = Array.isArray(data.data) ? data.data : (Array.isArray(data.list) ? data.list : []);
          }
        } else if ('list' in response) {
          list = Array.isArray(response.list) ? response.list : [];
        }
      }

      // 处理域列表数据，兼容 domianId 和 domainId 两种字段名
      const domainMap = new Map<string, any>();
      list.forEach((item: any) => {
        if (!item || typeof item !== 'object') return;

        const domainId = item.domianId || item.domainId; // 兼容拼写错误
        if (domainId && !domainMap.has(domainId)) {
          domainMap.set(domainId, {
            id: domainId,
            domainId: domainId,
            name: item.name || '',
            domainCode: domainId,
            value: domainId,
          });
        }
      });

      // 返回域列表
      return Array.from(domainMap.values());
    } catch (error) {
      console.error('[InventoryList] Failed to load domains from position service:', error);
      return [];
    }
  }
};

const resolveSelectedDomainId = () => {
  // 优先从 tableGroupRef 获取当前选中的域（最可靠）
  const viewGroup = tableGroupRef.value?.viewGroupRef;
  const currentSelected = viewGroup?.selectedItem;

  if (currentSelected) {
    return currentSelected.domainId ?? currentSelected.id ?? currentSelected.domainCode ?? currentSelected.value ?? null;
  }

  // 回退到 selectedDomain（通过事件设置的）
  const domain = selectedDomain.value;
  if (!domain) return null;
  return domain.domainId ?? domain.id ?? domain.domainCode ?? domain.value ?? null;
};

// 创建包装服务的辅助函数
const createWrappedService = (baseService: any) => {
  if (!baseService) {
    return {};
  }

  return {
    ...baseService,
    // 包装 page 方法，将左侧选中的域 ID 转换为 keyword.domainId
    // EPS 层会自动根据 search 配置封装其他字段到 keyword 对象中
    page: async (params: any) => {
      const finalParams = { ...params };

      // 处理 keyword 参数，将 ids 转换为 domainId
      if (finalParams.keyword !== undefined && finalParams.keyword !== null) {
        const keyword = finalParams.keyword;

        // 如果 keyword 是对象且包含 ids 字段（BtcTableGroup 的标准格式）
        if (typeof keyword === 'object' && !Array.isArray(keyword) && keyword.ids) {
          const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
          // 取第一个 ID 作为 domainId
          if (ids.length > 0 && ids[0] !== undefined && ids[0] !== null && ids[0] !== '') {
            // 将 domainId 放在 keyword 对象中，保留其他字段
            finalParams.keyword = { ...keyword, domainId: ids[0] };
            // 删除 ids 字段
            delete finalParams.keyword.ids;
          } else {
            // 如果没有有效的 ID，删除 ids 字段，保留其他字段
            const { ids: _, ...rest } = keyword;
            finalParams.keyword = rest;
          }
        } else if (typeof keyword === 'number' || (typeof keyword === 'string' && keyword !== '')) {
          // 如果 keyword 直接是数字或字符串，转换为 domainId
          finalParams.keyword = { domainId: keyword };
        }
      }

      // EPS 层会自动根据 search 配置补充其他字段（如 partName, position, checkType 等）
      return baseService?.page?.(finalParams);
    },
    // 移除删除相关方法，因为不允许删除
    delete: undefined,
    deleteBatch: undefined,
  };
};

// 物料信息表服务（右侧表），使用系统域的 data 服务
const materialService = service.system?.base?.data;
const wrappedMaterialService = createWrappedService(materialService);

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 处理导入
const handleImport = async (data: any, { done, close }: { done: () => void; close: () => void }) => {
  try {
    const rows = (data?.list || data?.rows || []).map((row: Record<string, any>) => {
      const { _index, ...rest } = row || {};
      return rest;
    });
    if (!rows.length) {
      const warnMessage = data?.filename
        ? t('common.import.no_data_or_mapping')
        : t('inventory.dataSource.list.import.no_file');
      message.warning(warnMessage);
      done();
      return;
    }

    // 优先从导入数据中提取 domainId，如果数据中没有则使用选中的域
    // 如果数据中有多个不同的 domainId，使用第一个
    let domainId = resolveSelectedDomainId();
    const dataDomainIds = rows
      .map((row: Record<string, any>) => row.domianId || row.domainId) // 兼容拼写错误
      .filter((id: any) => id !== undefined && id !== null && id !== '');

    if (dataDomainIds.length > 0) {
      // 如果导入数据中包含 domainId，使用数据中的（取第一个）
      domainId = dataDomainIds[0];
    } else if (!domainId) {
      // 如果既没有选中域，数据中也没有 domainId，则提示错误
      message.warning(t('inventory.dataSource.domain.selectRequired') || '请先选择左侧域或在导入数据中包含域ID');
      done();
      return;
    }

    // 盘点清单导入：使用系统域的 data 服务
    const normalizedRows = rows.map((row: Record<string, any>) => ({
      partName: row.partName,
      partQty: row.partQty ? Number(row.partQty) : undefined,
      position: row.position,
      checkType: row.checkType,
      domainId: row.domianId || row.domainId || domainId, // 兼容拼写错误
      processId: row.processId,
    }));

    const payload = {
      domainId,
      list: normalizedRows,
    };

    const response = await service.system?.base?.data?.import?.(payload);

    // 检查响应中的 code 字段，如果 code 不是 200/1000/2000，说明导入失败
    // 注意：响应拦截器可能返回原始 response 对象（AxiosResponse）或业务数据
    // 需要同时检查 response.data.code 和 response.code
    let responseData: any = response;
    if (response && typeof response === 'object' && 'data' in response) {
      // 如果是 AxiosResponse 对象，提取 data
      responseData = (response as any).data;
    }

    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      const code = responseData.code;
      if (code !== 200 && code !== 1000 && code !== 2000) {
        const errorMsg = responseData.msg || responseData.message || t('inventory.dataSource.list.import.failed');
        message.error(errorMsg);
        done();
        return;
      }
    }

    message.success(t('inventory.dataSource.list.import.success'));
    tableGroupRef.value?.crudRef?.refresh?.();
    close();
  } catch (error: any) {
    console.error('[InventoryList] import failed:', error);
    // 优先从错误对象中提取后端返回的 msg
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('inventory.dataSource.list.import.failed');
    message.error(errorMsg);
    done();
  }
};

// 日期格式化函数
const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) => {
  try {
    if (!value || value === null || value === undefined) {
      return '--';
    }
    return formatDateTime(value);
  } catch (error) {
    console.warn('[InventoryList] Date format error:', error, value);
    return '--';
  }
};

// 盘点清单表格列（对应 data 服务的字段，不包含盘点类型）
const materialColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'partName', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'partQty', label: t('inventory.result.fields.actualQty'), minWidth: 120 },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), width: 180, formatter: formatDateCell },
]);

// 导出用的列（不包含时间字段和盘点类型字段）
const materialExportColumns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: t('system.material.fields.materialCode') },
  { prop: 'partQty', label: t('inventory.result.fields.actualQty') },
  { prop: 'position', label: t('inventory.result.fields.storageLocation') },
]);

// 直接导出（不打开弹窗）
const handleExport = async () => {
  if (!wrappedMaterialService?.page) {
    BtcMessage.error(t('platform.common.export_failed') || '导出服务不可用');
    return;
  }

  exportLoading.value = true;

  try {
    // 获取当前筛选参数
    const params = {
      ...tableGroupRef.value?.crudRef?.getParams?.() || {},
      page: 1,
      size: 999999,
      isExport: true,
    };

    // 获取所有数据
    const response = await wrappedMaterialService.page(params);

    // 处理不同的响应格式（支持 Axios 响应对象）
    let exportData: any[] = [];
    if (response) {
      // 如果是 Axios 响应对象，从 data 中提取
      const data = response.data || response;
      exportData = data?.list || data?.data?.list || data?.records || (Array.isArray(data) ? data : []);
    }

    // 执行导出（允许空表，即使 exportData 为空数组也会导出）
    exportTableToExcel({
      columns: materialExportColumns.value,
      data: exportData,
      filename: exportFilename.value,
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
  } catch (error: any) {
    console.error('[InventoryList] Export failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('platform.common.export_failed');
    BtcMessage.error(errorMsg);
  } finally {
    exportLoading.value = false;
  }
};

// 物料信息表表单
const materialFormItems = computed<FormItem[]>(() => [
  { prop: 'materialCode', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'materialName', label: t('system.material.fields.materialName'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'specification', label: t('system.material.fields.specification'), span: 12, component: { name: 'el-input' } },
  { prop: 'unit', label: t('system.material.fields.unit'), span: 12, component: { name: 'el-input' } },
  { prop: 'category', label: t('inventory.dataSource.list.fields.category'), span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: t('inventory.dataSource.list.fields.status'),
    span: 12,
    component: {
      name: 'el-select',
      props: {
        placeholder: t('inventory.dataSource.list.fields.status_placeholder'),
      },
    },
    options: [
      { label: t('common.enabled'), value: 1 },
      { label: t('common.disabled'), value: 0 },
    ],
  },
  { prop: 'remark', label: t('system.inventory.base.fields.remark'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

// 导出功能已由 BtcImportExportGroup 组件处理，不再需要单独的导出函数
</script>

<style lang="scss" scoped>
.inventory-list-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
