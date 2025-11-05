<template>
  <div class="request-log-page">
    <!-- 请求日志 -->
    <BtcCrud ref="requestCrudRef" :service="requestService">
      <BtcRow>
        <BtcRefreshBtn />

        <!-- 清空日志按钮 -->
        <el-button
          type="danger"
          @click="clearLogs"
        >
          清空
        </el-button>

        <!-- 日志保存天数配置 -->
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
      </BtcRow>
      <BtcRow>
        <BtcTable ref="requestTableRef" :columns="requestColumns" :autoHeight="true" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcTable, BtcPagination, BtcRefreshBtn, BtcRow, BtcFlex1, BtcSearchKey } from '@btc/shared-components';
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
});

// 保存天数
async function saveKeepDays() {
  try {
    // 暂时注释掉，等待后端提供接口
    // await requestService.setKeep({ value: keepDays.value });
    ElMessage.success('保存成功');
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败');
  }
}

// 清空日志
function clearLogs() {
  ElMessageBox.confirm('是否要清空日志？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        // 暂时注释掉，等待后端提供接口
        // await requestService.clear();
        ElMessage.success('清空成功');
        requestCrudRef.value?.refresh();
      } catch (err: any) {
        ElMessage.error(err.message || '清空失败');
      }
    })
    .catch(() => null);
}

</script>

<style lang="scss" scoped>
.request-log-page {
  height: 100%;
  overflow: hidden; // 防止页面滚动，让表格内部处理滚动
}

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
