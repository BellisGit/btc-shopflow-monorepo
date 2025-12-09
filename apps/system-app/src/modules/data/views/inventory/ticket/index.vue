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
        <!-- 1. 明确传递exportFilename和禁止关键词，消除透传警告 -->
        <!-- 2. 禁止关键词：SysPro、BOM表、括号等 -->
        <BtcImportBtn
          :on-submit="handleImport"
          :tips="t('inventory.dataSource.ticket.import.tips')"
          :exportFilename="exportFilename"
          :forbiddenKeywords="['SysPro', 'BOM表', '(', ')', '（', '）', '副本']"
          @validate-filename="handleFilenameValidate"
        />
      </template>
      <template #actions>
        <el-button type="info" @click="exportTicketTemplate">
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
import { formatDateTime } from '@btc/shared-utils';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup, BtcImportBtn } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryTicket'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 统一导出/导入文件名（核心：确保导入校验的文件名与导出文件名完全一致）
const exportFilename = computed(() => t('menu.inventory.dataSource.ticket'));

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

// 文件名校验回调（可选：父组件监听文件名校验结果）
const handleFilenameValidate = (isValid: boolean) => {
  if (!isValid) {
    console.log('[InventoryTicket] 文件名校验失败');
    // 可添加额外逻辑，如禁用提交按钮等
  }
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
      domainId: row.domainId ?? domainId,
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

// 盘点票表单
const ticketFormItems = computed<FormItem[]>(() => [
  { prop: 'checkNo', label: t('system.inventory.base.fields.checkNo'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'partName', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), span: 12, component: { name: 'el-input' } },
  { prop: 'checkType', label: t('system.inventory.base.fields.checkType'), span: 12, component: { name: 'el-input' } },
]);

// 导出模板：强制文件名与import的校验文件名一致
const exportTicketTemplate = () => {
  // 从 CRUD 获取当前表格数据，允许空表导出
  const tableData = tableGroupRef.value?.crudRef?.tableData || tableGroupRef.value?.crudRef?.data || [];

  exportTableToExcel({
    columns: ticketExportColumns.value,
    data: tableData,
    filename: exportFilename.value, // 使用统一的文件名
  });
};
</script>

<style lang="scss" scoped>
.inventory-ticket-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
