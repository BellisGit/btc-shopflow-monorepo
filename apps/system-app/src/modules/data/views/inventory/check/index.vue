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
      @select="onCheckSelect"
    />

    <!-- 详情弹窗 -->
    <BtcDialog
      v-model="detailVisible"
      :title="t('inventory.result.detail.title')"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('system.inventory.base.fields.checkNo')">
          {{ detailRow?.baseId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.materialName')">
          {{ detailRow?.materialName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.specification')">
          {{ detailRow?.specification || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.unit')">
          {{ detailRow?.unit || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.batchNo')">
          {{ detailRow?.batchNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.material.fields.expireCycle')">
          {{ detailRow?.validity || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.storageLocation')">
          {{ detailRow?.storageLocation || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.diffRate')">
          {{ detailRow?.diffRate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('inventory.result.fields.isDiff')">
          <el-tag :type="detailRow?.isDiff === 1 ? 'danger' : 'success'">
            {{ detailRow?.isDiff === 1 ? t('common.yes') : t('common.no') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.checkerId')">
          {{ detailRow?.checkerId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.createdAt')">
          {{ detailRow?.createdAt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.inventory.base.fields.remark')" :span="2">
          {{ detailRow?.remark || '-' }}
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
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
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

// 盘点列表服务（左侧）- 使用示例数据
const checkService = {
  list: async (params?: any) => {
    // 示例数据：测试盘1，测试盘2，测试盘3，初盘，复盘，终盘
    const mockData = [
      { id: 1, name: '测试盘1', checkNo: 'CHECK001', checkType: '测试', status: '已完成' },
      { id: 2, name: '测试盘2', checkNo: 'CHECK002', checkType: '测试', status: '已完成' },
      { id: 3, name: '测试盘3', checkNo: 'CHECK003', checkType: '测试', status: '进行中' },
      { id: 4, name: '初盘', checkNo: 'CHECK004', checkType: '初盘', status: '已完成' },
      { id: 5, name: '复盘', checkNo: 'CHECK005', checkType: '复盘', status: '已完成' },
      { id: 6, name: '终盘', checkNo: 'CHECK006', checkType: '终盘', status: '已完成' },
    ];

    // 模拟分页和搜索
    let filteredData = [...mockData];
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredData = mockData.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.checkNo.toLowerCase().includes(keyword)
      );
    }

    return {
      list: filteredData,
      pagination: {
        total: filteredData.length,
        page: 1,
        size: 10,
      }
    };
  }
};

// 盘点结果服务（右侧表），使用纯后端API
const resultService = service.system?.base?.check;

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

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'View',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  'edit',
]);

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 盘点结果表格列（只显示：序号、物料编码、账面数量、实际数量、差异数量、创建时间、操作列）
const resultColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'materialCode', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'bookQty', label: t('inventory.result.fields.bookQty'), minWidth: 120 },
  { prop: 'actualQty', label: t('inventory.result.fields.actualQty'), minWidth: 120 },
  { prop: 'diffQty', label: t('inventory.result.fields.diffQty'), minWidth: 120 },
  { prop: 'createdAt', label: t('system.inventory.base.fields.createdAt'), minWidth: 180 },
]);

// 盘点结果表单
const resultFormItems = computed<FormItem[]>(() => [
  { prop: 'baseId', label: t('system.inventory.base.fields.checkNo'), span: 12, component: { name: 'el-input' } },
  { prop: 'materialCode', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'materialName', label: t('system.material.fields.materialName'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'specification', label: t('system.material.fields.specification'), span: 12, component: { name: 'el-input' } },
  { prop: 'unit', label: t('system.material.fields.unit'), span: 12, component: { name: 'el-input' } },
  { prop: 'batchNo', label: t('inventory.result.fields.batchNo'), span: 12, component: { name: 'el-input' } },
  { prop: 'validity', label: t('system.material.fields.expireCycle'), span: 12, component: { name: 'el-input', props: { placeholder: 'YYYY-MM-DD' } } },
  { prop: 'bookQty', label: t('inventory.result.fields.bookQty'), span: 12, component: { name: 'el-input' } },
  { prop: 'actualQty', label: t('inventory.result.fields.actualQty'), span: 12, component: { name: 'el-input' } },
  { prop: 'storageLocation', label: t('inventory.result.fields.storageLocation'), span: 12, component: { name: 'el-input' } },
  { prop: 'diffQty', label: t('inventory.result.fields.diffQty'), span: 12, component: { name: 'el-input' } },
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
