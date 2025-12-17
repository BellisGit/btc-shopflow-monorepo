<template>
  <div class="main-home">
    <div class="main-home__top-row">
      <div class="main-home__quick-access">
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
              @click="goToModule(domain.domainCode)"
            >
              <btc-svg :name="domain.icon" :size="36" />
              <span>{{ domain.name }}</span>
            </div>
          </div>
        </BtcCard>
      </div>

      <div class="main-home__system-info">
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
      </div>
    </div>

    <!-- 策略监控图表分析 -->
    <div class="main-home__bottom-row">
      <div class="strategy-charts">
        <BtcChartDemo :gap="8" :cols-per-row="4" chart-height="300px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import {
  BtcCard,
  BtcChartDemo
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
      // 过滤出需要显示在快速入口的域（排除 SYSTEM、DOCS 和 ADMIN）
      const domains = response.list
        .filter((domain: any) =>
          domain.domainCode !== 'SYSTEM' &&
          domain.name !== '系统域' &&
          domain.domainCode !== 'DOCS' &&
          domain.name !== '文档中心' &&
          domain.domainCode !== 'ADMIN' &&
          domain.name !== '管理域'
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

const goToModule = (domainCode: string) => {
  // 将域代码转换为路径，直接跳转到对应域（参考汉堡菜单的切换逻辑）
  // 域代码到路径的映射
  const domainPathMap: Record<string, string> = {
    'LOGISTICS': '/logistics',
    'ENGINEERING': '/engineering',
    'QUALITY': '/quality',
    'PRODUCTION': '/production',
    'FINANCE': '/finance'
  };

  const targetPath = domainPathMap[domainCode] || `/${domainCode.toLowerCase()}`;
  router.push(targetPath);
};

// 生命周期
onMounted(() => {
  loadDomains();
});
</script>

<style scoped lang="scss">
// 页面内容样式（不包含布局相关的 padding、margin、background）
.main-home {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &__top-row {
    margin-bottom: 10px;
    height: 300px;
    display: flex;
    gap: 8px; // 与底部 BtcContainer 的 gap 保持一致

    .main-home__quick-access {
      // 精确计算：3个图表宽度 = (100% - 3 * gap) * 3/4 + 2 * gap
      width: calc((100% - 3 * 8px) * 3 / 4 + 2 * 8px);
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .main-home__system-info {
      // 精确计算：1个图表宽度 = (100% - 3 * gap) * 1/4
      width: calc((100% - 3 * 8px) * 1 / 4);
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
      flex-shrink: 0;
    }
  }

  &__bottom-row {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__card {
    height: 100%;
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
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
  // 水平均匀分布，垂直居中
  justify-content: space-around;
  align-content: center;
  align-items: center;
  height: 100%;
}

.access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  // 正方形卡片
  width: 100px;
  height: 100px;
  aspect-ratio: 1;
  // 设计感增强
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  // 添加微妙的背景渐变效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);

    &::before {
      opacity: 1;
    }

    .btc-svg {
      transform: scale(1.1);
    }
  }

  .btc-svg {
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-primary);
    font-weight: 500;
    text-align: center;
    line-height: 1.3;
    z-index: 1;
    // 限制文字最多显示两行
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
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
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // 确保容器链条有明确高度，让图表能够正常渲染
  :deep(.btc-chart-demo) {
    height: 100%;
    min-height: 0;
    flex: 1;
  }

  :deep(.btc-container) {
    height: 100%;
    min-height: 0;
    flex: 1;

    // 确保 el-scrollbar 及其内部元素填充高度
    .el-scrollbar {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .el-scrollbar__wrap {
      height: 100%;
      flex: 1;
      min-height: 0;
    }

    .el-scrollbar__view {
      height: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  // 确保 btc-container__content 填充高度
  :deep(.btc-container__content) {
    height: 100%;
    min-height: 100%;
    // 使用 1fr 让行高填充可用空间，确保图表项能够充分利用空间
    grid-auto-rows: 1fr;
    // 确保内容区域至少填充父容器
    align-content: start;
  }

  :deep(.chart-item) {
    min-height: 300px;
    height: 100%; // 让图表项填充网格行的高度
    // 确保图表项内部使用 flex 布局，让图表组件填充剩余空间
    display: flex;
    flex-direction: column;
  }
}

// 暗色模式样式（使用 :deep() 确保样式能够穿透 scoped）
:deep(html.dark) {
  // 快速访问项在暗色模式下的样式
  .access-item {
    background: var(--el-bg-color) !important;
    border-color: var(--el-border-color) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;

    span {
      color: var(--el-text-color-primary) !important;
    }

    &:hover {
      background-color: var(--el-fill-color-light) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
    }

    // 暗色模式下的渐变效果
    &::before {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
    }
  }
}

</style>

