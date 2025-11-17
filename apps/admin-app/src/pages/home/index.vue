<template>
  <div class="main-home">
    <el-row :gutter="20" class="main-home__top-row">
      <el-col :span="16">
        <BtcCard :title="t('main.home.quick_access')" class="main-home__card">
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ t('common.loading') }}...</span>
          </div>
          <div v-else class="quick-access-grid">
            <div
              v-for="domain in quickAccessDomains"
              :key="domain.domainCode"
              class="access-item"
              @click="goToModule(domain.domainCode.toLowerCase())"
            >
              <btc-svg :name="domain.icon" :size="36" />
              <span>{{ domain.name }}</span>
            </div>
          </div>
        </BtcCard>
      </el-col>

      <el-col :span="8">
        <BtcCard :title="t('main.home.system_info')" class="main-home__card">
          <div class="system-info">
            <div class="info-item">
              <span class="label">{{ t('main.home.version') }}:</span>
              <el-tag size="small">v1.0.0</el-tag>
            </div>
            <div class="info-item">
              <span class="label">{{ t('main.home.environment') }}:</span>
              <el-tag type="success" size="small">Development</el-tag>
            </div>
            <div class="info-item">
              <span class="label">{{ t('main.home.apps') }}:</span>
              <el-tag type="info" size="small">6 {{ t('main.home.apps_loaded') }}</el-tag>
            </div>
          </div>
        </BtcCard>
      </el-col>
    </el-row>

    <!-- 策略监控图表分析 -->
    <el-row :gutter="20" class="main-home__bottom-row">
      <el-col :span="24">
        <div class="strategy-charts">
          <BtcContainer :gap="10">
            <div class="chart-item">
              <h4>执行次数趋势</h4>
              <BtcLineChart
                :data="executionTrendData"
                :x-axis-data="executionTrendXAxis"
                height="100%"
              />
            </div>
            <div class="chart-item">
              <h4>响应时间分布</h4>
              <BtcBarChart
                :data="responseTimeData"
                :x-axis-data="responseTimeXAxis"
                height="100%"
              />
            </div>
            <div class="chart-item">
              <h4>策略类型分布</h4>
              <BtcPieChart
                :data="typeDistributionData"
                height="100%"
              />
            </div>
            <div class="chart-item">
              <h4>成功率统计</h4>
              <BtcBarChart
                :data="successRateData"
                :x-axis-data="successRateXAxis"
                y-axis-formatter="%"
                height="100%"
              />
            </div>
          </BtcContainer>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import {
  BtcCard,
  BtcContainer,
  BtcLineChart,
  BtcBarChart,
  BtcPieChart
} from '@btc/shared-components';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '@btc/shared-components';
import { service } from '@services/eps';
import { getDomainList } from '@/utils/domain-cache';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();


// 域到应用的映射配置（与 menu-drawer 保持一致）
const domainAppMapping: Record<string, { icon: string; color: string }> = {
  'LOGISTICS': {
    icon: 'map',
    color: '#67c23a',
  },
  'ENGINEERING': {
    icon: 'design',
    color: '#e6a23c',
  },
  'QUALITY': {
    icon: 'approve',
    color: '#f56c6c',
  },
  'PRODUCTION': {
    icon: 'work',
    color: '#909399',
  },
  'FINANCE': {
    icon: 'amount-alt',
    color: '#1890ff',
  },
  'ADMIN': {
    icon: 'settings',
    color: '#13c2c2',
  },
};

// 加载状态
const loading = ref(false);

// 快速入口域列表
const quickAccessDomains = ref<Array<{ domainCode: string; name: string; icon: string; color: string }>>([]);

// 加载域列表
const loadDomains = async () => {
  loading.value = true;
  try {
    // 使用共享缓存获取域列表
    const response = await getDomainList(service);

    if (response?.list) {
      // 过滤出需要显示在快速入口的域（排除 SYSTEM 和 DOCS）
      const domains = response.list
        .filter((domain: any) =>
          domain.domainCode !== 'SYSTEM' &&
          domain.name !== '系统域' &&
          domain.domainCode !== 'DOCS' &&
          domain.name !== '文档中心'
        )
        .map((domain: any) => {
          const domainCode = domain.domainCode;
          const appConfig = domainAppMapping[domainCode];

          if (appConfig) {
            return {
              domainCode,
              name: domain.name,
              icon: appConfig.icon,
              color: appConfig.color,
            };
          }
          return null;
        })
        .filter((item): item is { domainCode: string; name: string; icon: string; color: string } => item !== null);

      quickAccessDomains.value = domains;
    } else {
      // 如果服务不可用，使用默认配置
      quickAccessDomains.value = [
        { domainCode: 'LOGISTICS', name: t('micro_app.logistics.title'), icon: 'map', color: '#67c23a' },
        { domainCode: 'ENGINEERING', name: t('micro_app.engineering.title'), icon: 'design', color: '#e6a23c' },
        { domainCode: 'QUALITY', name: t('micro_app.quality.title'), icon: 'approve', color: '#f56c6c' },
        { domainCode: 'PRODUCTION', name: t('micro_app.production.title'), icon: 'work', color: '#909399' },
        { domainCode: 'FINANCE', name: t('micro_app.finance.title'), icon: 'amount-alt', color: '#1890ff' },
      ];
    }
  } catch (error) {
    console.warn('获取域列表失败，使用默认配置:', error);
    // 服务不可用时，使用默认配置
    quickAccessDomains.value = [
      { domainCode: 'LOGISTICS', name: t('micro_app.logistics.title'), icon: 'map', color: '#67c23a' },
      { domainCode: 'ENGINEERING', name: t('micro_app.engineering.title'), icon: 'design', color: '#e6a23c' },
      { domainCode: 'QUALITY', name: t('micro_app.quality.title'), icon: 'approve', color: '#f56c6c' },
      { domainCode: 'PRODUCTION', name: t('micro_app.production.title'), icon: 'work', color: '#909399' },
      { domainCode: 'FINANCE', name: t('micro_app.finance.title'), icon: 'amount-alt', color: '#d48806' },
    ];
  } finally {
    loading.value = false;
  }
};

const goToModule = (module: string) => {
  router.push(`/admin/${module}`);
};

// 生命周期
onMounted(() => {
  loadDomains();
});

// 图表数据
const executionTrendData = ref<LineChartData[]>([
  {
    name: '执行次数',
    data: [120, 132, 101, 134, 90, 230, 210],
    color: '#409eff',
    smooth: true
  }
]);

const executionTrendXAxis = ref<string[]>(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);

const responseTimeData = ref<BarChartData[]>([
  {
    name: '响应时间分布',
    data: [320, 280, 150, 80, 20],
    color: '#67c23a'
  }
]);

const responseTimeXAxis = ref<string[]>(['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500ms+']);

const typeDistributionData = ref<PieChartDataItem[]>([
  { name: '权限策略', value: 35, color: '#f56c6c' },
  { name: '业务策略', value: 25, color: '#67c23a' },
  { name: '数据策略', value: 20, color: '#e6a23c' },
  { name: '工作流策略', value: 20, color: '#409eff' }
]);

const successRateData = ref<BarChartData[]>([
  {
    name: '成功率',
    data: [95, 88, 92, 85],
    color: '#67c23a'
  }
]);

const successRateXAxis = ref<string[]>(['权限策略', '业务策略', '数据策略', '工作流策略']);
</script>

<style scoped lang="scss">
// 页面内容样式（不包含布局相关的 padding、margin、background）
.main-home {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__top-row {
    flex-shrink: 0;
    margin-bottom: 20px;
    max-height: 300px;

    .el-col {
      height: 100%;
      max-height: 300px;
    }
  }

  &__bottom-row {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .el-col {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  &__card {
    height: 100%;
    max-height: 300px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.btc-card__body) {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
  gap: 12px;

  .el-icon {
    font-size: 24px;
  }

  span {
    font-size: 14px;
  }
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 8px 0;
}

.access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btc-svg {
    flex-shrink: 0;
  }

  span {
    font-size: 12px;
    color: var(--el-text-color-primary);
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
  }
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.strategy-charts {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  // BtcContainer 占据剩余空间
  :deep(.btc-container) {
    flex: 1;
    min-height: 0;
  }

  .chart-item {
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    min-height: 0;

    h4 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 500;
      flex-shrink: 0;
    }

    // 图表容器占据剩余空间
    :deep(.btc-line-chart),
    :deep(.btc-bar-chart),
    :deep(.btc-pie-chart) {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>

