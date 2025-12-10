<template>
  <div class="inventory-check-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="checkService"
      :right-service="wrappedResultService"
      :table-columns="resultColumns"
      :form-items="resultFormItems"
      :op="{ buttons: opButtons }"
      :left-title="t('inventory.check.list')"
      :right-title="t('inventory.result.title')"
      :search-placeholder="t('inventory.result.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :label-field="'checkType'"
      @select="onCheckSelect"
    >
      <template #search>
        <!-- 自定义搜索框：物料编码、仓位、盘点人 -->
        <div class="custom-search-fields" style="display: flex; align-items: center; gap: 10px;">
          <el-input
            v-model="searchForm.partName"
            :placeholder="t('system.material.fields.materialCode')"
            clearable
            style="width: 150px;"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-input
            v-model="searchForm.position"
            :placeholder="t('inventory.result.fields.storageLocation')"
            clearable
            style="width: 150px;"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-input
            v-model="searchForm.checker"
            :placeholder="t('system.inventory.base.fields.checkerId')"
            clearable
            style="width: 150px;"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>
    </BtcTableGroup>

    <!-- 详情弹窗 -->
    <BtcDialog
      v-model="detailVisible"
      :title="t('inventory.result.detail.title')"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('system.inventory.base.fields.checkNo')">
          {{ detailRow?.checkNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="流程ID">
          {{ detailRow?.processId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.materialCode')">
          {{ detailRow?.partName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.actualQty')">
          {{ detailRow?.partQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.checkerId')">
          {{ detailRow?.checker || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.storageLocation')">
          {{ detailRow?.position || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.createdAt')">
          {{ detailRow?.createdAt || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.button.close') }}</el-button>
      </template>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n, normalizePageResponse } from '@btc/shared-core';
import type { TableColumn, FormItem, UseCrudReturn } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryCheck'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedCheck = ref<any>(null);
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 搜索表单数据
const searchForm = ref({
  partName: '',
  position: '',
  checker: '',
});

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'info',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  'edit',
]);

// 盘点列表服务（左侧）- 使用后端接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[InventoryCheck] 盘点列表接口不存在');
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }

    try {
      // 调用后端接口
      const response = await checkListService(params || {});
      
      // 处理响应格式：后端返回 { code, msg, data } 格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        // 如果响应包含 data 字段，使用 data 字段
        data = response.data;
      }
      
      // 标准化响应格式
      const page = params?.page || 1;
      const size = params?.size || 10;
      const normalized = normalizePageResponse(data, page, size);
      
      return {
        list: normalized.list,
        pagination: normalized.pagination,
      };
    } catch (error) {
      console.error('[InventoryCheck] 获取盘点列表失败:', error);
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }
  }
};

// 盘点结果服务（右侧表），使用新的data-source API
const resultService = service.system?.base?.dataSource;

const wrappedResultService = {
  ...resultService,
  async delete(id: string | number) {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    if (!resultService?.delete) {
      throw new Error('未找到删除服务接口');
    }
    await resultService.delete(id);
    message.success(t('crud.message.delete_success'));
  },
  async deleteBatch(ids: (string | number)[]) {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    if (resultService?.deleteBatch) {
      await resultService.deleteBatch(ids);
    } else if (resultService?.delete) {
      await Promise.all(ids.map(id => resultService.delete!(id)));
    } else {
      throw new Error('未找到删除服务接口');
    }
    message.success(t('crud.message.delete_success'));
  },
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
  // 可以根据选中的盘点，过滤右侧的盘点结果
  // 这里可以通过 tableGroupRef 来刷新右侧表格
};

// 处理搜索
const handleSearch = () => {
  if (tableGroupRef.value?.crudRef?.crud) {
    const crud = tableGroupRef.value.crudRef.crud as UseCrudReturn<any>;
    // 设置搜索参数
    crud.setParams({
      keyword: {
        partName: searchForm.value.partName || '',
        position: searchForm.value.position || '',
        checker: searchForm.value.checker || '',
      }
    });
    // 刷新数据
    crud.refresh();
  }
};

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 盘点结果表格列（根据新的data-source API字段）
const resultColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'checkNo', label: t('system.inventory.base.fields.checkNo'), minWidth: 140 },
  { prop: 'partName', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'partQty', label: t('inventory.result.fields.actualQty'), minWidth: 120 },
  { prop: 'checker', label: t('system.inventory.base.fields.checkerId'), minWidth: 120 },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), minWidth: 180 },
]);

// 盘点结果表单（根据新的data-source API字段）
const resultFormItems = computed<FormItem[]>(() => [
  { prop: 'checkNo', label: t('system.inventory.base.fields.checkNo'), span: 12, component: { name: 'el-input' } },
  { prop: 'processId', label: '流程ID', span: 12, component: { name: 'el-input' } },
  { prop: 'partName', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'partQty', label: t('inventory.result.fields.actualQty'), span: 12, component: { name: 'el-input-number' }, required: true },
  { prop: 'checker', label: t('system.inventory.base.fields.checkerId'), span: 12, component: { name: 'el-input' } },
  { prop: 'position', label: t('inventory.result.fields.storageLocation'), span: 12, component: { name: 'el-input' } },
  { prop: 'diffRate', label: t('inventory.result.fields.diffRate'), span: 12, component: { name: 'el-input' } },
  {
    prop: 'isDiff',
    label: t('inventory.result.fields.isDiff'),
    span: 12,
    component: {
      name: 'el-select',
      props: {
        placeholder: t('inventory.result.fields.isDiff_placeholder'),
      },
    },
    options: [
      { label: t('common.yes'), value: 1 },
      { label: t('common.no'), value: 0 },
    ],
  },
  { prop: 'checkerId', label: t('system.inventory.base.fields.checkerId'), span: 12, component: { name: 'el-input' } },
  { prop: 'remark', label: t('system.inventory.base.fields.remark'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);
</script>

<style lang="scss" scoped>
.inventory-check-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
