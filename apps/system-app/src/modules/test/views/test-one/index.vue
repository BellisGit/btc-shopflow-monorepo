<template>
  <div class="test-one-page">
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="sub-title">
              <btc-svg name="windmill" :size="24" color="#409EFF" />
              <span>风车图标示例</span>
            </div>
          </template>
          <div class="icon-demo">
            <btc-svg name="windmill" :size="64" />
            <btc-svg name="windmill" :size="48" color="#FF0000" />
            <btc-svg name="windmill" :size="32" color="#00FF00" />
            <btc-svg name="windmill" :size="24" color="#0000FF" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="sub-title">
              <btc-svg name="windmill" :size="24" color="#67C23A" />
              <span>图标动画效果</span>
            </div>
          </template>
          <div class="icon-demo">
            <div class="icon-item">
              <btc-svg name="windmill" :size="48" animation="spin" />
              <span>旋转</span>
            </div>
            <div class="icon-item">
              <btc-svg name="windmill" :size="48" animation="pulse" />
              <span>脉冲</span>
            </div>
            <div class="icon-item">
              <btc-svg name="windmill" :size="48" animation="bounce" />
              <span>弹跳</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="10" style="margin-top: 10px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="sub-title">
              <btc-svg name="star" :size="24" color="#409EFF" />
              <span>星型图标示例</span>
            </div>
          </template>
          <div class="icon-demo">
            <btc-svg name="star" :size="64" />
            <btc-svg name="star" :size="48" color="#FF0000" />
            <btc-svg name="star" :size="32" color="#00FF00" />
            <btc-svg name="star" :size="24" color="#0000FF" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="sub-title">
              <btc-svg name="star" :size="24" color="#67C23A" />
              <span>星型图标动画效果</span>
            </div>
          </template>
          <div class="icon-demo">
            <div class="icon-item">
              <btc-svg name="star" :size="48" animation="spin" />
              <span>旋转</span>
            </div>
            <div class="icon-item">
              <btc-svg name="star" :size="48" animation="pulse" />
              <span>脉冲</span>
            </div>
            <div class="icon-item">
              <btc-svg name="star" :size="48" animation="bounce" />
              <span>弹跳</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { BtcSvg } from '@btc/shared-components';
</script>

<style scoped lang="scss">
.test-one-page {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;

  :deep(.el-row) {
    display: flex;
    align-items: stretch;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  :deep(.el-col) {
    display: flex;
    flex-direction: column;
    padding-left: 5px !important;
    padding-right: 5px !important;

    .el-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .el-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  .sub-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .icon-demo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: wrap;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>
