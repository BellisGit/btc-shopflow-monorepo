<template>
  <div class="main-home">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('main.home.stats.users')" :value="1234">
            <template #prefix>
              <el-icon color="#409EFF"><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('main.home.stats.orders')" :value="5678">
            <template #prefix>
              <el-icon color="#67C23A"><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('main.home.stats.revenue')" :value="89012" :precision="0">
            <template #prefix>
              <el-icon color="#E6A23C"><Money /></el-icon>
            </template>
            <template #suffix>
              <span style="font-size: 18px; margin-left: 4px;">元</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('main.home.stats.growth')" :value="23.5" :precision="1" suffix="%">
            <template #prefix>
              <el-icon color="#F56C6C"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ t('main.home.quick_access') }}</span>
            </div>
          </template>
          <div class="quick-access-grid">
            <div class="access-item" @click="goToModule('logistics')">
              <btc-svg name="logistics" :size="48" />
              <span>{{ t('micro_app.logistics.title') }}</span>
            </div>
            <div class="access-item" @click="goToModule('engineering')">
              <btc-svg name="engineering" :size="48" />
              <span>{{ t('micro_app.engineering.title') }}</span>
            </div>
            <div class="access-item" @click="goToModule('quality')">
              <btc-svg name="quality" :size="48" />
              <span>{{ t('micro_app.quality.title') }}</span>
            </div>
            <div class="access-item" @click="goToModule('production')">
              <btc-svg name="production" :size="48" />
              <span>{{ t('micro_app.production.title') }}</span>
            </div>
            <div class="access-item" @click="goToModule('finance')">
              <btc-svg name="amount-alt" :size="48" />
              <span>{{ t('micro_app.finance.title') }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ t('main.home.system_info') }}</span>
            </div>
          </template>
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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { User, Document, Money, TrendCharts } from '@element-plus/icons-vue';

const router = useRouter();
const { t } = useI18n();

const goToModule = (module: string) => {
  router.push(`/${module}`);
};
</script>

<style scoped lang="scss">
// 页面内容样式（不包含布局相关的 padding、margin、background）
.main-home {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}

.stat-card {
  :deep(.el-statistic__head) {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-statistic__content) {
    font-size: 28px;
    font-weight: 600;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
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

  span {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 500;
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
</style>

