<template>
  <div class="inventory-list-page">
    <BtcDoubleGroup
      ref="doubleGroupRef"
      :primary-service="domainService"
      :secondary-service="importTypeService"
      :right-service="wrappedMaterialService"
      :table-columns="currentColumns"
      :form-items="materialFormItems"
      :primary-title="t('inventory.dataSource.domain')"
      :secondary-title="t('inventory.dataSource.list.import.secondaryTitle')"
      :right-title="t('menu.inventory.dataSource.list')"
      :show-primary-unassigned="true"
      primary-unassigned-label="未分配"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :show-toolbar="true"
      secondary-keyword-strategy="ignore"
      :left-column-width="160"
      :column-gap="8"
      @primary-select="onDomainSelect"
      @secondary-select="onImportTypeSelect"
    >
      <template #title="{ primary, secondary }">
        {{ primary?.name || '未选择域' }} - {{ secondary?.name || currentImportLabel || '未选择导入类型' }}
      </template>
      <template #add-btn>
        <BtcImportBtn
          :on-submit="handleImport"
          :tips="t('inventory.dataSource.list.import.tipByType', { type: currentImportLabel })"
        />
      </template>
      <template #actions>
        <el-button type="info" @click="exportMaterialTemplate">
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcDoubleGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, exportTableToExcel } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcDoubleGroup, BtcImportBtn } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryList'
});

const { t } = useI18n();
const message = useMessage();
const doubleGroupRef = ref();
const selectedDomain = ref<any>(null);
const selectedImportType = ref('inventory-ticket');
// 标记是否是页面首次加载，用于区分自动选择和用户选择
// 注意：这个标记只在真正的页面首次加载时为 true，组件重新创建时不应该重置为 true
const isInitialLoad = ref(true);

// 监听 selectedImportType 的变化，在用户主动切换时，标记首次加载已完成
watch(selectedImportType, (newVal, oldVal) => {
  // 如果是从 undefined/null 变为有效值，说明是初始化，保持 isInitialLoad 为 true
  // 如果是从一个有效值变为另一个有效值，说明是用户主动切换，标记首次加载已完成
  if (oldVal && newVal && oldVal !== newVal) {
    if (isInitialLoad.value) {
      isInitialLoad.value = false;
    }
  }
});

// 左侧域列表改为使用与汉堡菜单一致的 /domain/me 接口
const domainService = {
  list: () => service.admin?.iam?.domain?.me?.()
};

const importTypeOptions = computed(() => [
  { id: 'inventory-ticket', name: t('inventory.dataSource.list.importTabs.ticket') },
  { id: 'inventory-checklist', name: t('inventory.dataSource.list.importTabs.checklist') },
]);

const importTypeService = {
  list: async () => importTypeOptions.value.map(item => ({ ...item })),
};

watch(importTypeOptions, (options) => {
  // 只有在选项列表不为空，且当前选中的类型不在选项中时，才重置
  if (options && options.length > 0 && !options.find(option => option.id === selectedImportType.value)) {
    selectedImportType.value = options[0]?.id ?? 'inventory-ticket';
  }
}, { immediate: false });

const currentImportLabel = computed(() => {
  const option = importTypeOptions.value.find(option => option.id === selectedImportType.value);
  return option?.name ?? importTypeOptions.value[0]?.name ?? '';
});

const resolveSelectedDomainId = () => {
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

// 物料信息表服务（右侧表），根据导入类型动态切换
const wrappedMaterialService = computed(() => {
  const currentService = selectedImportType.value === 'inventory-ticket'
    ? service.logistics?.warehouse?.ticket
    : service.system?.base?.data;

  const wrapped = createWrappedService(currentService);
  // 添加服务标识，用于 BtcCrud 的 key
  wrapped._serviceId = selectedImportType.value;
  wrapped._originalService = currentService;

  return wrapped;
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

const onImportTypeSelect = (type: any) => {
  // 如果 type 为 null 或 undefined，说明是重置操作，不处理
  if (!type) {
    return;
  }

  const newType = (type?.id ?? type);
  // 确保 newType 是有效的导入类型
  if (!newType || !importTypeOptions.value.find(option => option.id === newType)) {
    return;
  }

  // 如果新类型与当前类型相同，则忽略
  if (newType === selectedImportType.value) {
    return;
  }

  // 如果是首次加载，且自动选择的是第一个选项
  if (isInitialLoad.value) {
    // 首次加载时，如果自动选择的是第一个选项，且与当前 selectedImportType 一致，则允许通过
    if (newType === importTypeOptions.value[0]?.id && newType === selectedImportType.value) {
      // 标记首次加载完成
      isInitialLoad.value = false;
      return;
    }
    // 首次加载时，如果自动选择的是第一个选项，但当前 selectedImportType 不是第一个，则忽略自动选择，保持当前类型
    if (newType === importTypeOptions.value[0]?.id && selectedImportType.value !== importTypeOptions.value[0]?.id) {
      // 标记首次加载完成，但不更新 selectedImportType
      isInitialLoad.value = false;
      return;
    }
  }

  // 如果不是首次加载，且新类型与当前类型不一致，说明是用户主动选择，允许切换
  selectedImportType.value = newType;

  // 注意：不需要手动调用 refresh()，因为 BtcCrud 的 key 变化会重新创建组件
  // 重新创建时，如果 autoLoad 为 true，会自动加载数据
  // 如果 autoLoad 为 false，BtcDoubleGroup 会在合适的时机触发刷新
};

// 处理导入
const handleImport = async (data: any, { done, close }: { done: () => void; close: () => void }) => {
  try {
    const domainId = resolveSelectedDomainId();
    if (!domainId) {
      message.warning(t('inventory.dataSource.domain.selectRequired') || '请先选择左侧域');
      done();
      return;
    }

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

    // 根据导入类型选择不同的服务和数据处理逻辑
    if (selectedImportType.value === 'inventory-ticket') {
      // 盘点票导入：使用物流域的 ticket 服务
      const normalizedRows = rows.map((row: Record<string, any>) => ({
        checkNo: row.checkNo,
        partName: row.partName,
        position: row.position,
        checkType: row.checkType,
        domainId: row.domainId ?? domainId,
      }));

      const payload = {
        domainId,
        list: normalizedRows,
      };

      await service.logistics?.warehouse?.ticket?.import?.(payload);
    } else {
      // 盘点清单导入：使用系统域的 data 服务
      const normalizedRows = rows.map((row: Record<string, any>) => ({
        partName: row.partName,
        partQty: row.partQty ? Number(row.partQty) : undefined,
        position: row.position,
        checkType: row.checkType,
        domainId: row.domainId ?? domainId,
        processId: row.processId,
      }));

      const payload = {
        domainId,
        list: normalizedRows,
      };

      await service.system?.base?.data?.import?.(payload);
    }

    message.success(t('inventory.dataSource.list.import.success'));
    doubleGroupRef.value?.crudRef?.refresh?.();
    close();
  } catch (error) {
    console.error('[InventoryList] import failed:', error);
    message.error(t('inventory.dataSource.list.import.failed'));
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

// 盘点票表格列（不包含 checkNo 字段）
const ticketColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'partName', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), minWidth: 120 },
  { prop: 'checkType', label: t('system.inventory.base.fields.checkType'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), width: 180, formatter: formatDateCell },
]);

// 盘点清单表格列（对应 data 服务的字段，不包含 checkNo）
const materialColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'partName', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'partQty', label: t('inventory.result.fields.actualQty'), minWidth: 120 },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), minWidth: 120 },
  { prop: 'checkType', label: t('system.inventory.base.fields.checkType'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), width: 180, formatter: formatDateCell },
]);

// 根据导入类型动态切换表格列
const currentColumns = computed<TableColumn[]>(() => {
  try {
    if (selectedImportType.value === 'inventory-ticket') {
      return ticketColumns.value || [];
    } else {
      return materialColumns.value || [];
    }
  } catch (error) {
    console.warn('[InventoryList] Error computing columns:', error);
    // 返回默认的物料列作为后备
    return materialColumns.value || [];
  }
});

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

const exportMaterialTemplate = () => {
  // 从 CRUD 获取当前表格数据
  const tableData = doubleGroupRef.value?.crudRef?.tableData || doubleGroupRef.value?.crudRef?.data || [];

  if (!tableData || tableData.length === 0) {
    message.warning(t('platform.common.no_data_to_export') || '暂无数据可导出');
    return;
  }

  // 根据导入类型设置不同的文件名
  const filename = selectedImportType.value === 'inventory-ticket'
    ? `${t('inventory.dataSource.list.importTabs.ticket')}_${t('menu.inventory.dataSource.list')}`
    : `${t('inventory.dataSource.list.importTabs.checklist')}_${t('menu.inventory.dataSource.list')}`;

  exportTableToExcel({
    columns: currentColumns.value,
    data: tableData,
    filename,
  });
};
</script>

<style lang="scss" scoped>
.inventory-list-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
