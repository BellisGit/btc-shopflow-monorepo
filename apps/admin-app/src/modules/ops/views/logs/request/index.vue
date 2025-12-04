<template>
  <div class="logs-root">
  <BtcCrud
    ref="requestCrudRef"
    class="request-log-page"
    :service="requestService"
    :auto-load="true"
    :on-before-refresh="onBeforeRefresh"
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
        :auto-height="true"
        border
      />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, nextTick } from 'vue';
import { useRoute } from 'vue-router';
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

// 请求日志服务（打印可用方法）
// 确保 service 存在，避免 undefined 错误
const rawRequestService = (service && service.admin?.log?.request) as any;
// 包装：兜底提供 list 方法以避免卡在 loading（待确认真实分页方法名后再收敛）
function normalizePageResult(res: any) {
  if (!res) return { list: [], total: 0 };
  // 常见分页返回兼容
  const list =
    res.list ??
    res.records ??
    res.rows ??
    res.data ??
    (Array.isArray(res) ? res : []) ??
    [];
  const total =
    res.total ??
    res.count ??
    (typeof res.pagination === 'object' ? res.pagination.total : undefined) ??
    0;
  return { list, total: Number.isFinite(total) ? total : (Array.isArray(list) ? list.length : 0) };
}

const requestService = {
  ...(rawRequestService || {}),
  async page(params: any) {
    const s = rawRequestService || {};
    try {
      let res: any;
      if (typeof s.page === 'function') res = await s.page(params);
      else if (typeof s.list === 'function') res = await s.list(params);
      else if (typeof s.query === 'function') res = await s.query(params);
      else if (typeof s.search === 'function') res = await s.search(params);
      const { list, total } = normalizePageResult(res);
      const pageNo = params?.page ?? 1;
      const pageSize = params?.size ?? list.length;
      const result = {
        list,
        total,
        page: pageNo,
        size: pageSize,
        success: true,
        rows: list,
        records: list,
        count: total,
        data: { list, total, page: pageNo, size: pageSize },
      };
      return result;
    } catch (err) {
      const pageNo = params?.page ?? 1;
      const pageSize = params?.size ?? 0;
      return { list: [], total: 0, page: pageNo, size: pageSize, success: false, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: pageSize } };
    }
  },
  async list(params: any) {
    const s = rawRequestService || {};
    try {
      let res: any;
      if (typeof s.list === 'function') res = await s.list(params);
      else if (typeof s.page === 'function') res = await s.page(params);
      else if (typeof s.query === 'function') res = await s.query(params);
      else if (typeof s.search === 'function') res = await s.search(params);
      const { list, total } = normalizePageResult(res);
      const pageNo = params?.page ?? 1;
      const pageSize = params?.size ?? list.length;
      const result = {
        list,
        total,
        page: pageNo,
        size: pageSize,
        success: true,
        rows: list,
        records: list,
        count: total,
        data: { list, total, page: pageNo, size: pageSize },
      };
      return result;
    } catch (err) {
      const pageNo = params?.page ?? 1;
      const pageSize = params?.size ?? 0;
      return { list: [], total: 0, page: pageNo, size: pageSize, success: false, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: pageSize } };
    }
    // 兜底：返回空数据，避免 loading 挂起
    const pageNo = params?.page ?? 1;
    return { list: [], total: 0, page: pageNo, size: 0, success: true, rows: [], records: [], data: { list: [], total: 0, page: pageNo, size: 0 } };
  },
};
function onBeforeRefresh(params: Record<string, unknown>) {
  return params || {};
}

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
        maxLength: 500, // 限制显示长度
        popoverTrigger: 'hover',
        teleported: true,
        popperStrategy: 'fixed'
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
    sortable: true,
    fixed: 'right'
  }
  ];

  return columns;
});

// CRUD 引用
const requestCrudRef = ref();
const tableRef = ref();
const route = useRoute();

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
  await nextTick();
  try {
    const rows = requestCrudRef.value?.tableData?.value?.length ?? requestCrudRef.value?.crud?.tableData?.value?.length;
  } catch (e) {
    /* ignore */
  }
  // 强制触发一次刷新，防止切换返回时留在 loading 状态
  requestCrudRef.value?.refresh?.();
  // 强制一次布局计算
  await nextTick();
  try {
    tableRef.value?.calcMaxHeight?.();
    tableRef.value?.tableRef?.value?.doLayout?.();
  } catch {}
  // 触发全局 resize，驱动内部高度计算
  try {
    window.dispatchEvent(new Event('resize'));
  } catch {}
});

// 页面再次激活（从另一个日志页切回）时，强制计算高度与布局
onActivated(async () => {
  await nextTick();
  try {
    tableRef.value?.calcMaxHeight?.();
    tableRef.value?.tableRef?.value?.doLayout?.();
  } catch {}
  // 触发全局 resize，驱动内部高度计算
  try {
    window.dispatchEvent(new Event('resize'));
  } catch {}
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
.logs-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
</style>

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

// 局部禁用下拉过渡，减少 ResizeObserver 回调链
:deep(.el-dropdown__list) {
  transition: none !important;
  animation: none !important;
}
</style>
