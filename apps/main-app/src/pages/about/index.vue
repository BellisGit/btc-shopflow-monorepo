<template>
  <div class="about-page">
    <el-card shadow="hover" class="about-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="var(--el-color-primary)"><InfoFilled /></el-icon>
          <span>关于系统</span>
        </div>
      </template>

      <div class="about-content">
        <!-- 系统信息 -->
        <div class="info-section">
          <div class="logo-section">
            <img v-if="appConfig.logo" :src="appConfig.logo" alt="Logo" class="system-logo" />
            <h2 class="system-name">{{ appConfig.name }}</h2>
            <p class="system-slogan">{{ t(appConfig.company.sloganKey) }}</p>
            <el-tag type="primary" effect="plain">v{{ appConfig.version }}</el-tag>
          </div>

          <el-divider />

          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统简称">
              {{ appConfig.shortName }}
            </el-descriptions-item>
            <el-descriptions-item label="系统版本">
              {{ appConfig.version }}
            </el-descriptions-item>
            <el-descriptions-item label="公司名称">
              {{ appConfig.company.fullName }}
            </el-descriptions-item>
            <el-descriptions-item label="公司官网">
              <el-link :href="appConfig.company.website" type="primary" target="_blank">
                {{ appConfig.company.website }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="联系邮箱">
              <el-link :href="`mailto:${appConfig.contact.email}`" type="primary">
                {{ appConfig.contact.email }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ appConfig.contact.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="公司地址" :span="2">
              {{ appConfig.contact.address }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 版权信息 -->
        <div class="copyright-section">
          <el-divider />
          <div class="copyright-text">
            <el-icon><CopyrightFilled /></el-icon>
            <span>{{ appConfig.copyright.text }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 技术栈信息 -->
    <el-card shadow="hover" class="tech-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="var(--el-color-success)"><Trophy /></el-icon>
          <span>技术栈</span>
        </div>
      </template>

      <div class="tech-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="tech-item">
              <el-tag type="success" effect="dark">Vue 3</el-tag>
              <span>渐进式 JavaScript 框架</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="tech-item">
              <el-tag type="primary" effect="dark">TypeScript</el-tag>
              <span>类型安全的 JavaScript 超集</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="tech-item">
              <el-tag type="warning" effect="dark">Vite</el-tag>
              <span>下一代前端构建工具</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="tech-item">
              <el-tag type="danger" effect="dark">Qiankun</el-tag>
              <span>微前端框架</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="tech-item">
              <el-tag type="info" effect="dark">Element Plus</el-tag>
              <span>Vue 3 组件库</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="tech-item">
              <el-tag effect="dark">Pinia</el-tag>
              <span>Vue 状态管理</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, CopyrightFilled, Trophy } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { appConfig } from '@/config/app';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.about-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.about-card {
  .about-content {
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 20px 0;

      .system-logo {
        width: 120px;
        height: 120px;
        object-fit: contain;
      }

      .system-name {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .system-slogan {
        margin: 8px 0;
        font-size: 14px;
        font-style: italic;
        color: var(--el-color-primary);
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    .copyright-section {
      margin-top: 20px;

      .copyright-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--el-text-color-secondary);
        font-size: 13px;

        .el-icon {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.tech-card {
  .tech-content {
    padding: 10px 0;

    .tech-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      background: var(--el-fill-color-lighter);
      margin-bottom: 10px;
      transition: all 0.2s;

      &:hover {
        background: var(--el-fill-color-light);
        transform: translateX(4px);
      }

      .el-tag {
        min-width: 100px;
        justify-content: center;
      }

      span {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }
    }
  }
}
</style>

