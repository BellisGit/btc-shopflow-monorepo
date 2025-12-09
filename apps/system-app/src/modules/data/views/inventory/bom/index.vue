<template>
  <div class="inventory-bom-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedBomService"
      :table-columns="bomColumns"
      :form-items="bomFormItems"
      :left-title="t('inventory.dataSource.domain')"
      :right-title="t('menu.inventory.dataSource.bom')"
      :show-unassigned="false"
      :enable-key-search="false"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :show-toolbar="true"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <BtcImportBtn 
          :columns="bomColumns" 
          :on-submit="handleImport"
          :exportFilename="t('menu.inventory.dataSource.bom')"
        />
      </template>
      <template #actions>
        <el-button type="info" @click="exportBomTemplate">
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, exportTableToExcel } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup, BtcImportBtn } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryBom'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 左侧域列表使用物流域的仓位配置页面的 page 接口
const domainService = {
  list: async () => {
    try {
      // 调用物流域仓位配置的 page 接口
      const response = await service.logistics?.base?.position?.page?.({ page: 1, size: 1000 });
      
      // 处理响应数据
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }
      
      const positionList = data?.list || [];
      
      // 从仓位数据中提取唯一的域信息（根据 domainId 和 name 去重）
      const domainMap = new Map<string, any>();
      positionList.forEach((item: any) => {
        const domainId = item.domainId;
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
      console.error('[InventoryBom] Failed to load domains from position service:', error);
      return [];
    }
  }
};

// 物料构成表服务（右侧表），使用后端API
const bomService = service.system?.base?.bom;

const wrappedBomService = {
  ...bomService,
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

    // EPS 层会自动根据 search 配置补充其他字段（如 parentNode, childNode, checkType 等）
    return bomService?.page?.(finalParams);
  },
  // 移除删除相关方法，因为不允许删除
  delete: undefined,
  deleteBatch: undefined,
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
  // 可以根据选中的域，过滤右侧的物料构成表数据
  // 这里可以通过 tableGroupRef 来刷新右侧表格
};

const resolveSelectedDomainId = () => {
  const domain = selectedDomain.value;
  if (!domain) {
    return null;
  }

  // me 接口返回的域数据通常包含 id/domainCode/name 等字段
  // 优先使用实际的 domainId/id，其次才回退到 code/value
  return (
    domain.domainId ??
    domain.id ??
    domain.domainCode ??
    domain.value ??
    domain.code ??
    null
  );
};

// 处理导入
const handleImport = async (
  data: any,
  { done, close }: { done: () => void; close: () => void }
) => {
  try {
    const rows = (data?.list || data?.rows || []).map((row: Record<string, any>) => {
      const { _index, ...rest } = row || {};
      return rest;
    });
    if (!rows.length) {
      const warnMessage = data?.filename
        ? t('common.import.no_data_or_mapping')
        : t('inventory.dataSource.bom.import.no_file');
      message.warning(warnMessage);
      done();
      return;
    }

    const domainId = resolveSelectedDomainId();
    if (!domainId) {
      message.warning(t('inventory.dataSource.domain.selectRequired') || '请先选择左侧域');
      done();
      return;
    }

    // BtcImportBtn 已经根据 columns 配置自动进行了列名映射（中文列名 -> 字段名）
    // 所以这里直接使用映射后的字段名即可
    const normalizedRows = rows.map((row: Record<string, any>) => ({
      processId: row.processId,
      checkNo: row.checkNo,
      domainId: row.domainId ?? domainId,
      parentNode: row.parentNode,
      childNode: row.childNode,
      childQty: row.childQty ? Number(row.childQty) : undefined,
      checkType: row.checkType,
      remark: row.remark,
    }));

    const payload = {
      domainId,
      list: normalizedRows,
    };

    const response = await service.system?.base?.bom?.import?.(payload);

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
        const errorMsg = responseData.msg || responseData.message || t('inventory.dataSource.bom.import.failed');
        message.error(errorMsg);
        done();
        return;
      }
    }

    message.success(t('inventory.dataSource.bom.import.success'));
    tableGroupRef.value?.crudRef?.crud?.refresh();
    close();
  } catch (error) {
    console.error('[InventoryBom] import failed:', error);
    const errorMsg = (error as any)?.response?.data?.msg || (error as any)?.msg || t('inventory.dataSource.bom.import.failed');
    message.error(errorMsg);
    done();
  }
};

// 物料构成表表格列（移除选择列和操作列，不包含盘点类型）
const bomColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'parentNode', label: t('inventory.dataSource.bom.fields.materialName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'childNode', label: t('inventory.dataSource.bom.fields.componentName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'childQty', label: t('inventory.dataSource.bom.fields.componentQty'), width: 120 },
]);

// 导出用的列（不包含时间字段和盘点类型字段）
const bomExportColumns = computed<TableColumn[]>(() => [
  { prop: 'parentNode', label: t('inventory.dataSource.bom.fields.materialName') },
  { prop: 'childNode', label: t('inventory.dataSource.bom.fields.componentName') },
  { prop: 'childQty', label: t('inventory.dataSource.bom.fields.componentQty') },
]);

// 物料构成表表单
const bomFormItems = computed<FormItem[]>(() => [
  {
    prop: 'parentNode',
    label: t('inventory.dataSource.bom.fields.parentNode'),
    span: 12,
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    prop: 'childNode',
    label: t('inventory.dataSource.bom.fields.childNode'),
    span: 12,
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    prop: 'childQty',
    label: t('inventory.dataSource.bom.fields.childQty'),
    span: 12,
    required: true,
    component: { name: 'el-input-number', props: { min: 0, precision: 2 } },
  },
  {
    prop: 'checkType',
    label: t('inventory.dataSource.bom.fields.checkType'),
    span: 12,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    prop: 'domainId',
    label: t('inventory.dataSource.bom.fields.domainId'),
    span: 12,
    component: { name: 'el-input', props: { disabled: true } },
    hook: {
      onInit: (value: any, formData: Record<string, any>) => {
        formData.domainId = resolveSelectedDomainId() ?? formData.domainId;
      },
    },
  },
  {
    prop: 'processId',
    label: t('inventory.dataSource.bom.fields.processId'),
    span: 12,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    prop: 'checkNo',
    label: t('inventory.dataSource.bom.fields.checkNo'),
    span: 12,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
]);

const exportBomTemplate = () => {
  // 从 CRUD 获取当前表格数据，允许空表导出
  const tableData = tableGroupRef.value?.crudRef?.tableData || tableGroupRef.value?.crudRef?.data || [];

  exportTableToExcel({
    columns: bomExportColumns.value,
    data: tableData,
    filename: `${t('menu.inventory.dataSource.bom')}`,
  });
};
</script>

<style lang="scss" scoped>
.inventory-bom-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
