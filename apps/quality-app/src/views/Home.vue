<template>
  <div class="quality-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('quality.home.stats.pending')" :value="45" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('quality.home.stats.defects')" :value="12" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('quality.home.stats.rate')" :value="98.5" suffix="%" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>{{ t('quality.home.management') }}</span>
      </template>
      <el-space wrap>
        <el-button type="primary" disabled>{{ t('quality.home.inspection') }}</el-button>
        <el-button type="danger" disabled>{{ t('quality.home.defect_handling') }}</el-button>
        <el-button type="success" disabled>{{ t('quality.home.reports') }}</el-button>
      </el-space>
      <el-alert type="info" :closable="false" style="margin-top: 20px">
        品质应用功能页面待开发
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.quality-home {
  .content {
    p {
      font-size: 16px;
    }
  }
}
</style>

