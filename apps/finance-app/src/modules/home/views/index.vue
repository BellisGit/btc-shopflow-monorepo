<template>
  <div class="finance-home">
    <section class="finance-home__intro">
      <h2 class="finance-home__title">
        {{ t('finance.home.todo.title', { date: todayLabel }) }}
      </h2>
      <p class="finance-home__subtitle">
        {{ t('finance.home.todo.subtitle') }}
      </p>
    </section>

    <BtcCrud ref="crudRef" class="finance-home__todo" :service="todoService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('finance.home.todo.searchPlaceholder')" />
        <BtcCrudActions />
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
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
import { computed, ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import {
  BtcCrud,
  BtcRow,
  BtcRefreshBtn,
  BtcFlex1,
  BtcSearchKey,
  BtcCrudActions,
  BtcTable,
  BtcPagination,
} from '@btc/shared-components';
import { formatDateTime } from '@btc/shared-utils';

interface TodoMeta {
  id: number;
  taskKey: 'report' | 'invoice' | 'budget' | 'reconciliation' | 'review';
  priority: 'high' | 'medium' | 'low';
  owner: string;
  dueTime: string;
  status: 'pending' | 'in_progress' | 'done';
}

interface TodoItem extends TodoMeta {
  task: string;
}

defineOptions({
  name: 'FinanceHome',
});

const { t } = useI18n();
const crudRef = ref();
const tableRef = ref();

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return formatDateTime(date, 'HH:mm');
};

const todayLabel = computed(() => formatDateTime(new Date(), 'YYYY-MM-DD'));

const todayTodosMeta = ref<TodoMeta[]>([
  {
    id: 1,
    taskKey: 'report',
    priority: 'high',
    owner: '王敏',
    dueTime: `${todayLabel.value}T09:30:00`,
    status: 'pending',
  },
  {
    id: 2,
    taskKey: 'invoice',
    priority: 'medium',
    owner: '李强',
    dueTime: `${todayLabel.value}T11:00:00`,
    status: 'in_progress',
  },
  {
    id: 3,
    taskKey: 'budget',
    priority: 'high',
    owner: '陈蕾',
    dueTime: `${todayLabel.value}T14:00:00`,
    status: 'pending',
  },
  {
    id: 4,
    taskKey: 'reconciliation',
    priority: 'low',
    owner: '赵云',
    dueTime: `${todayLabel.value}T15:30:00`,
    status: 'pending',
  },
  {
    id: 5,
    taskKey: 'review',
    priority: 'medium',
    owner: '刘波',
    dueTime: `${todayLabel.value}T17:00:00`,
    status: 'done',
  },
]);

const todoService: CrudService<TodoItem> = {
  async page(params: Record<string, any> = {}) {
    const page = Number(params.page ?? 1);
    const size = Number(params.size ?? 10);
    const keyword = String(params.keyword ?? '').trim().toLowerCase();

    const translated = todayTodosMeta.value.map<TodoItem>((item) => ({
      ...item,
      task: t(`finance.home.todo.items.${item.taskKey}`),
    }));

    let filtered = [...translated];

    if (keyword) {
      filtered = filtered.filter((item) => {
        return [item.task, item.owner].some((field) =>
          String(field).toLowerCase().includes(keyword),
        );
      });
    }

    const total = filtered.length;
    const start = (page - 1) * size;
    const end = start + size;

    return {
      list: filtered.slice(start, end),
      pagination: {
        page,
        size,
        total,
      },
    };
  },
};

const priorityDict = computed(() => [
  { label: t('finance.home.todo.priority.high'), value: 'high', type: 'danger' },
  { label: t('finance.home.todo.priority.medium'), value: 'medium', type: 'warning' },
  { label: t('finance.home.todo.priority.low'), value: 'low', type: 'info' },
]);

const statusDict = computed(() => [
  { label: t('finance.home.todo.status.pending'), value: 'pending', type: 'info' },
  { label: t('finance.home.todo.status.in_progress'), value: 'in_progress', type: 'warning' },
  { label: t('finance.home.todo.status.done'), value: 'done', type: 'success' },
]);

const columns = computed<TableColumn[]>(() => [
  { type: 'index', label: '#', width: 56 },
  { prop: 'task', label: t('finance.home.todo.columns.task'), minWidth: 220, showOverflowTooltip: true },
  { prop: 'priority', label: t('finance.home.todo.columns.priority'), width: 120, dict: priorityDict.value, dictColor: true },
  { prop: 'owner', label: t('finance.home.todo.columns.owner'), width: 140 },
  {
    prop: 'dueTime',
    label: t('finance.home.todo.columns.time'),
    width: 120,
    formatter: (_row, _column, value: string) => formatTime(value),
  },
  { prop: 'status', label: t('finance.home.todo.columns.status'), width: 140, dict: statusDict.value, dictColor: true },
]);
</script>

<style scoped lang="scss">
.finance-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.finance-home__intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.finance-home__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--btc-color-text-primary);
}

.finance-home__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--btc-color-text-regular);
}

.finance-home__todo {
  flex: 1;
  min-height: 0;
}
</style>


