<template>
  <div class="inventory-ticket-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedTicketService"
      :table-columns="ticketColumns"
      :form-items="ticketFormItems"
      :left-title="t('inventory.dataSource.domain')"
      :right-title="t('menu.inventory.dataSource.ticket')"
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
          :on-submit="handleImport"
          :tips="t('inventory.dataSource.ticket.import.tips')"
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
  name: 'BtcDataInventoryTicket'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);
const exportLoading = ref(false);

// 统一导出/导入文件名
const exportFilename = computed(() => t('menu.inventory.dataSource.ticket'));

// 提供导入文件名匹配配置（与导出文件名一致）
provide(IMPORT_FILENAME_KEY, exportFilename);
provide(IMPORT_FORBIDDEN_KEYWORDS_KEY, ['SysPro', 'BOM表', '(', ')', '（', '）', '副本']);

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
      console.error('[InventoryTicket] Failed to load domains from position service:', error);
      return [];
    }
  }
};

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

      return baseService?.page?.(finalParams);
    },
    // 移除删除相关方法，因为不允许删除
    delete: undefined,
    deleteBatch: undefined,
  };
};

// 盘点票服务（右侧表）
const ticketService = service.logistics?.warehouse?.ticket;
const wrappedTicketService = createWrappedService(ticketService);

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
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
        : t('inventory.dataSource.ticket.import.no_file');
      message.warning(warnMessage);
      done();
      return;
    }

    // 盘点票导入：使用物流域的 ticket 服务
    const normalizedRows = rows.map((row: Record<string, any>) => ({
      checkNo: row.checkNo,
      partName: row.partName,
      position: row.position,
      checkType: row.checkType,
      domainId: row.domianId || row.domainId || domainId, // 兼容拼写错误
    }));

    const payload = {
      domainId,
      list: normalizedRows,
    };

    const response = await service.logistics?.warehouse?.ticket?.import?.(payload);

    // 检查响应中的 code 字段，如果 code 不是 200/1000/2000，说明导入失败
    let responseData: any = response;
    if (response && typeof response === 'object' && 'data' in response) {
      responseData = (response as any).data;
    }

    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      const code = responseData.code;
      if (code !== 200 && code !== 1000 && code !== 2000) {
        const errorMsg = responseData.msg || responseData.message || t('inventory.dataSource.ticket.import.failed');
        message.error(errorMsg);
        done();
        return;
      }
    }

    message.success(t('inventory.dataSource.ticket.import.success'));
    tableGroupRef.value?.crudRef?.refresh?.();
    close();
  } catch (error: any) {
    console.error('[InventoryTicket] import failed:', error);
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || t('inventory.dataSource.ticket.import.failed');
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
    console.warn('[InventoryTicket] Date format error:', error, value);
    return '--';
  }
};

// 盘点票表格列（不包含盘点类型）
const ticketColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'partName', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), width: 180, formatter: formatDateCell },
]);

// 导出用的列（不包含时间字段和盘点类型字段）
const ticketExportColumns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: t('system.material.fields.materialCode') },
  { prop: 'position', label: t('inventory.result.fields.storageLocation') },
]);

// 直接导出（不打开弹窗）
const handleExport = async () => {
  if (!wrappedTicketService?.page) {
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
    const response = await wrappedTicketService.page(params);
    const exportData = response?.list || response?.data?.list || [];

    // 执行导出（允许空表）
    exportTableToExcel({
      columns: ticketExportColumns.value,
      data: exportData,
      filename: exportFilename.value,
      autoWidth: true,
      bookType: 'xlsx',
    });

    BtcMessage.success(t('platform.common.export_success'));
  } catch (error) {
    console.error('[InventoryTicket] Export failed:', error);
    BtcMessage.error(t('platform.common.export_failed'));
  } finally {
    exportLoading.value = false;
  }
};

// 盘点票表单
const ticketFormItems = computed<FormItem[]>(() => [
  { prop: 'checkNo', label: t('system.inventory.base.fields.checkNo'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'partName', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), span: 12, component: { name: 'el-input' } },
  { prop: 'checkType', label: t('system.inventory.base.fields.checkType'), span: 12, component: { name: 'el-input' } },
]);

// 导出功能已由 BtcImportExportGroup 组件处理，不再需要单独的导出函数
</script>

<style lang="scss" scoped>
.inventory-ticket-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
