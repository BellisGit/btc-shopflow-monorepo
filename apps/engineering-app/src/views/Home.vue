<template>
  <div class="engineering-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('engineering.home.stats.ongoing')" :value="12" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('engineering.home.stats.completed')" :value="8" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('engineering.home.stats.workers')" :value="234" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>{{ t('engineering.home.management') }}</span>
      </template>
      <el-space wrap>
        <el-button type="primary" disabled>{{ t('engineering.home.project_list') }}</el-button>
        <el-button type="success" disabled>{{ t('engineering.home.progress') }}</el-button>
        <el-button type="warning" disabled>{{ t('engineering.home.monitoring') }}</el-button>
      </el-space>
      <el-alert type="info" :closable="false" style="margin-top: 20px">
        工程应用功能页面待开发
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.engineering-home {
  .content {
    p {
      font-size: 16px;
    }
  }
}
</style>

