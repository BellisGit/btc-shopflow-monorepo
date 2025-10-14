<template>
  <div class="logistics-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('logistics.home.stats.pending')" :value="28" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('logistics.home.stats.shipping')" :value="156" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic :title="t('logistics.home.stats.completed')" :value="982" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>{{ t('logistics.home.quick_actions') }}</span>
        </div>
      </template>
      <div class="content">
        <el-space wrap>
          <el-button type="primary" disabled>{{ t('logistics.home.view_orders') }}</el-button>
          <el-button type="success" disabled>{{ t('logistics.home.create_shipping') }}</el-button>
          <el-button type="warning" disabled>{{ t('logistics.home.query_inventory') }}</el-button>
        </el-space>
        <el-alert type="info" :closable="false" style="margin-top: 20px">
          物流应用功能页面待开发
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.logistics-home {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .content {
    p {
      font-size: 16px;
      margin-bottom: 20px;
    }
  }
}
</style>

