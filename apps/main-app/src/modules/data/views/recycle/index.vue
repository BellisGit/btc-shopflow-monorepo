<template>
  <btc-crud ref="crudRef" class="recycle-page" :service="recycleService">
    <btc-row>
      <!-- 刷新按钮 -->
      <btc-refresh-btn />
      <el-button
        type="success"
        :disabled="tableSelection.length === 0"
        @click="restore()"
      >
        {{ $t('recycle.batch_restore') }}
      </el-button>

      <btc-flex1 />
      <!-- 关键字搜索 -->
      <btc-search-key />
    </btc-row>

    <btc-row>
      <!-- 数据表格 -->
      <btc-table
        ref="tableRef"
        :columns="columns"
        :autoHeight="true"
        border
        rowKey="id"
        @selection-change="handleSelectionChange"
      />
    </btc-row>

    <btc-row>
      <btc-flex1 />
      <!-- 分页控件 -->
      <btc-pagination />
    </btc-row>
  </btc-crud>
</template>

<script lang="ts" setup>
import { ref, computed, onActivated } from 'vue';
import { ElMessage, ElMessageBox, ElButton } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { service } from '@/services/eps';

defineOptions({
  name: 'DataRecycle'
});

const { t } = useI18n();

// 表格选中数据
const tableSelection = ref<any[]>([]);

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  tableSelection.value = selection;
};

// 表格列配置 - 根据后端真实数据结构调整
const columns = computed(() => [
  {
    type: 'selection'
  },
  {
    label: t('recycle.operator'),
    prop: 'username',
    minWidth: 120
  },
  {
    label: t('recycle.operation_desc'),
    prop: 'operationDesc',
    minWidth: 150,
    showOverflowTooltip: true
  },
  {
    label: t('recycle.ip_address'),
    prop: 'ipAddress',
    minWidth: 120
  },
  {
    label: t('recycle.deleted_data'),
    prop: 'beforeData',
    minWidth: 200,
    component: {
      name: 'btc-code-json',
      props: {
        popover: true
      }
    }
  },
  {
    label: t('recycle.request_url'),
    prop: 'requestUrl',
    showOverflowTooltip: true,
    minWidth: 200
  },
  {
    label: t('recycle.request_params'),
    prop: 'params',
    minWidth: 200,
    component: {
      name: 'btc-code-json',
      props: {
        popover: true
      }
    }
  },
  {
    label: t('recycle.create_time'),
    prop: 'createdAt',
    minWidth: 170,
    sortable: 'custom' as const
  },
  {
    type: 'op',
    width: 120,
    buttons: [
      {
        label: t('recycle.restore'),
        type: 'success',
        onClick: ({ scope }: { scope: { row: any } }) => {
          // 使用日志记录本身的ID
          const id = scope.row.id;
          restore(id);
        }
      }
    ]
  }
]);

// CRUD 配置
const crudRef = ref();
const tableRef = ref();

// 使用真实的 EPS 服务 - 数据回收站
const recycleService = service.system?.log?.sys?.deletelog;

// 刷新数据
function refresh(params?: any) {
  crudRef.value?.refresh(params);
}

// 数据恢复
function restore(targetId?: string) {
  // 使用日志记录本身的ID
  const ids = targetId ? [targetId] : tableSelection.value.map(e => e.id);

  // 过滤掉空值
  const validIds = ids.filter(Boolean);

  if (validIds.length === 0) {
    ElMessage.warning('请选择要恢复的数据');
    return;
  }

  ElMessageBox.confirm(
    t('recycle.restore_confirm'),
    t('common.tip'),
    {
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 使用真实的恢复 API - POST /restore
        // 参数是 id，不是 ids，所以需要逐个恢复
        for (const id of validIds) {
          await service.system?.log?.sys?.deletelog?.restore({
            id: id
          });
        }

        ElMessage.success(t('recycle.restore_success'));
        refresh();
      } catch (err: any) {
        console.error('恢复数据失败:', err);
        ElMessage.error(err.message || '恢复失败');
      }
    })
    .catch(() => null);
}

// 页面激活时刷新数据
onActivated(() => {
  refresh();
});
</script>

<style scoped>
.recycle-page {
  height: 100%;
  overflow: hidden;
}
</style>
