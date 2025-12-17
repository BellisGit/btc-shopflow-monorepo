<template>
  <div class="inventory-ticket-print-page">
    <BtcViewGroup
      ref="viewGroupRef"
      :left-service="domainService"
      :left-title="t('inventory.dataSource.domain')"
      :show-unassigned="false"
      :enable-key-search="false"
      :left-size="'small'"
      @select="onDomainSelect"
    >
      <template #right>
        <div class="ticket-print-wrapper">
          <BtcInventoryTicketPrintToolbar
            v-model:position-filter="positionFilter"
            :position-placeholder="positionPlaceholder"
            :on-refresh="handleRefresh"
            :on-print="handlePrint"
            :on-position-search="handlePositionSearch"
            :on-position-clear="handlePositionClear"
          />

          <BtcCrud ref="crudRef" :service="ticketService" :auto-load="false">
            <BtcRow>
              <div ref="printContentRef" style="width: 100%">
                <BtcTable
                  :columns="tableColumns"
                  border
                  auto-height
                  :disable-auto-created-at="true"
                />
              </div>
            </BtcRow>

            <BtcRow>
              <btc-flex1 />
              <el-config-provider :locale="elLocale">
                <BtcPagination />
              </el-config-provider>
            </BtcRow>
          </BtcCrud>
        </div>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcViewGroup, BtcFlex1, BtcRow, BtcTable, BtcCrud, BtcPagination } from '@btc/shared-components';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useTicketService } from './composables/useTicketService';
import { useInventoryTicketPrint } from './composables/useInventoryTicketPrint';
import BtcInventoryTicketPrintToolbar from './components/BtcInventoryTicketPrintToolbar.vue';
import './styles/index.scss';

defineOptions({
  name: 'BtcInventoryTicketPrint',
});

const { t, locale } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const printContentRef = ref<HTMLElement>();

// 使用 ticket service composable
const {
  ticketList,
  selectedDomain,
  positionFilter,
  pagination,
  positionPlaceholder,
  tableColumns,
  ticketService,
  domainService,
} = useTicketService();

// 使用打印相关的 composable
const {
  loadTicketData,
  handlePrint,
} = useInventoryTicketPrint(
  selectedDomain,
  positionFilter,
  ticketList,
  crudRef,
  printContentRef
);

// Element Plus 国际化
const elLocale = computed(() => {
  const currentLocale = locale.value || 'zh-CN';
  return currentLocale === 'zh-CN' ? zhCn : en;
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
  pagination.value.page = 1;
  // 使用 nextTick 确保 selectedDomain 已更新且 crudRef 已初始化
  nextTick(() => {
    loadTicketData();
  });
};

// 仓位搜索处理
const handlePositionSearch = () => {
  pagination.value.page = 1;
  loadTicketData();
};

// 仓位清空处理
const handlePositionClear = () => {
  pagination.value.page = 1;
  loadTicketData();
};

// 刷新数据
const handleRefresh = () => {
  loadTicketData();
  // 同时刷新左侧域列表
  viewGroupRef.value?.refresh?.();
};

// 组件挂载时初始化打印时间
onMounted(() => {
  // BtcViewGroup 会在加载完左侧列表后自动选中第一项，触发 @select 事件
  // 不需要在这里手动加载数据，因为 @select 事件会自动触发数据加载
});
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
