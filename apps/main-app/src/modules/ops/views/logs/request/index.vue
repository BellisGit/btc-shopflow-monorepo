<template>
  <BtcCrud
    ref="requestCrudRef"
    class="request-log-page"
    :service="requestService"
  >
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />

          <el-button
            type="danger"
            @click="clearLogs"
          >
            清空
          </el-button>
        </div>

        <div class="log-keep-filter">
          <span>日志保存天数：</span>
          <el-input-number
            v-model="keepDays"
            :min="1"
            :max="10000"
            controls-position="right"
            @change="saveKeepDays"
          />
        </div>

        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索请求地址、用户昵称、IP..." />
        <BtcCrudActions />
      </BtcRow>

      <BtcRow>
      <BtcTable
        ref="tableRef"
        :columns="requestColumns"
        :context-menu="['refresh']"
        border
      />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import type { TableColumn } from '@btc/shared-components';
import {
  BtcCrud,
  BtcTable,
  BtcPagination,
  BtcRefreshBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
  BtcCrudActions,
} from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'RequestLog'
});

// 请求日志服务
const requestService = service.system?.log?.request;

// 请求日志列配置
const requestColumns = computed<TableColumn[]>(() => {
  const columns = [
  {
    type: 'index',
    label: '#',
    width: 60
  },
  {
    label: '用户ID',
    prop: 'userId',
    width: 100
  },
  {
    label: '用户昵称',
    prop: 'username',
    width: 120
  },
  {
    label: '请求地址',
    prop: 'requestUrl',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '请求参数',
    prop: 'params',
    minWidth: 200,
    showOverflowTooltip: false,
    component: {
      name: 'BtcCodeJson',
      props: {
        popover: true,
        maxLength: 500 // 限制显示长度
      }
    }
    // 移除 formatter，BtcCodeJson 组件已支持字符串输入
  },
  {
    label: 'IP',
    prop: 'ip',
    width: 150,
    formatter(row: any) {
      // 安全处理IP字段
      try {
        if (row.ip === null || row.ip === undefined || typeof row.ip !== 'string') {
          return '-';
        }
        // 如果是空字符串，直接显示空字符串
        if (row.ip === '') {
          return '';
        }
        // 限制字符串长度，避免过长的IP字符串
        const ipStr = row.ip.length > 1000 ? row.ip.substring(0, 1000) + '...' : row.ip;
        return ipStr.split(',').map((ip: string) => ip.trim()).filter((ip: any) => ip).join(', ');
      } catch (error) {
        console.error('IP字段格式化错误:', error);
        return '-';
      }
    }
  },
  {
    label: '耗时(ms)',
    prop: 'duration',
    width: 100,
    sortable: true,
    formatter(row: any) {
      return row.duration ? `${row.duration}ms` : '-';
    }
  },
  {
    label: '状态',
    prop: 'status',
    width: 100,
    dict: [
      { label: '成功', value: 'success', type: 'success' as const },
      { label: '失败', value: 'failed', type: 'danger' as const }
    ],
    dictColor: true
  },
  {
    label: '请求时间',
    prop: 'createdAt',
    width: 170,
    sortable: true
  }
  ];

  return columns;
});

// CRUD 引用
const requestCrudRef = ref();
const tableRef = ref();

const toPx = (value: number | undefined | null) =>
  value != null ? `${Math.round(value)}px` : '0px';

const logHeightMetrics = () => {
  const crudEl = requestCrudRef.value?.$el as HTMLElement | undefined;
  const tableEl = tableRef.value?.$el as HTMLElement | undefined;

  console.group('[RequestLog] container heights');
  console.log('BtcCrud:', toPx(crudEl?.offsetHeight));

  const rows = crudEl?.querySelectorAll<HTMLElement>('.btc-crud-row') ?? [];
  rows.forEach((row, index) => {
    console.log(`  btc-crud-row #${index + 1}:`, toPx(row.offsetHeight));
    const children = Array.from(row.children) as HTMLElement[];
    children.forEach((child, childIndex) => {
      console.log(
        `    child #${childIndex + 1} <${child.tagName.toLowerCase()}${child.className ? `.${child.className}` : ''}>:`,
        toPx(child.offsetHeight),
      );
    });
  });

  if (tableEl) {
    console.log('table element height:', toPx(tableEl.offsetHeight));
    console.log('table max-height style:', tableEl.style.maxHeight || '(auto)');
    const headerWrapper = tableEl.querySelector<HTMLElement>('.el-table__header-wrapper');
    const bodyWrapper = tableEl.querySelector<HTMLElement>('.el-table__body-wrapper');
    console.log('table header wrapper height:', toPx(headerWrapper?.offsetHeight));
    console.log('table body wrapper height:', toPx(bodyWrapper?.offsetHeight));

    const dataRows = bodyWrapper?.querySelectorAll<HTMLElement>('tbody > tr.el-table__row') ?? [];
    let totalRowsHeight = 0;
    dataRows.forEach((tr, idx) => {
      const rowHeight = tr.offsetHeight;
      totalRowsHeight += rowHeight;
      console.log(`    data row #${idx + 1} height:`, toPx(rowHeight));
    });
    if (dataRows.length > 0) {
      console.log('    accumulated data rows height:', toPx(totalRowsHeight));
    }

    const tbody = bodyWrapper?.querySelector('tbody');
    let computedBodyHeight = tbody?.scrollHeight ?? 0;
    if (!computedBodyHeight && dataRows.length > 0) {
      computedBodyHeight = totalRowsHeight;
    }
    if (!computedBodyHeight && bodyWrapper) {
      computedBodyHeight = bodyWrapper.scrollHeight || bodyWrapper.offsetHeight || 0;
    }
    console.log('    computed body height (used in maxHeight check):', toPx(computedBodyHeight));
    console.log('    computed content height:', toPx((headerWrapper?.offsetHeight ?? 0) + computedBodyHeight));
  }
  console.groupEnd();
};

// 日志保存天数
const keepDays = ref(31);

// 获取保存天数
onMounted(async () => {
  try {
    // 暂时注释掉，等待后端提供接口
    // const res = await requestService.getKeep();
    // keepDays.value = Number(res);
  } catch (err) {
    console.error('获取日志保存天数失败', err);
  }

  logHeightMetrics();
  requestCrudRef.value?.crud?.mitt?.on?.('crud.refresh', logHeightMetrics);
});

// 保存天数
async function saveKeepDays() {
  try {
    // 暂时注释掉，等待后端提供接口
    // await requestService.setKeep({ value: keepDays.value });
    BtcMessage.success('保存成功');
  } catch (err: any) {
    BtcMessage.error(err.message || '保存失败');
  }
}

// 清空日志
function clearLogs() {
  BtcConfirm('是否要清空日志？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        // 暂时注释掉，等待后端提供接口
        // await requestService.clear();
        BtcMessage.success('清空成功');
        requestCrudRef.value?.refresh?.();
      } catch (err: any) {
        BtcMessage.error(err.message || '清空失败');
      }
    })
    .catch(() => null);
}

</script>

<style lang="scss" scoped>
.log-keep-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;

  span {
    white-space: nowrap;
  }
}
</style>
