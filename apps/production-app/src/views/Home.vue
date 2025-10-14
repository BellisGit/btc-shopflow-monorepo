<template>
  <div class="production-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('production.home.stats.plans')" :value="32" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('production.home.stats.ongoing')" :value="18" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('production.home.stats.utilization')" :value="87.3" suffix="%" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>{{ t('production.home.management') }}</span>
      </template>
      <el-space wrap>
        <el-button type="primary" disabled>{{ t('production.home.plan') }}</el-button>
        <el-button type="success" disabled>{{ t('production.home.schedule') }}</el-button>
        <el-button type="warning" disabled>{{ t('production.home.materials') }}</el-button>
      </el-space>
      <el-alert type="info" :closable="false" style="margin-top: 20px">
        生产应用功能页面待开发
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.production-home {
  .content {
    p {
      font-size: 16px;
    }
  }
}
</style>

