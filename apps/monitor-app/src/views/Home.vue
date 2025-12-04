<template>
  <div class="monitor-home">
    <section class="monitor-home__intro">
      <h2 class="monitor-home__title">
        {{ t('monitor.home.title') }}
      </h2>
      <p class="monitor-home__subtitle">
        {{ t('monitor.home.subtitle') }}
      </p>
    </section>

    <div class="monitor-home__stats">
      <BtcCard :title="t('monitor.home.errorStats.title')" class="monitor-home__card">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ todayErrorCount }}</div>
            <div class="stat-label">{{ t('monitor.home.errorStats.today') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalErrorCount }}</div>
            <div class="stat-label">{{ t('monitor.home.errorStats.total') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ warningCount }}</div>
            <div class="stat-label">{{ t('monitor.home.errorStats.warnings') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ errorCount }}</div>
            <div class="stat-label">{{ t('monitor.home.errorStats.errors') }}</div>
          </div>
        </div>
      </BtcCard>
    </div>

    <div class="monitor-home__actions">
      <BtcCard :title="t('monitor.home.quickActions.title')" class="monitor-home__card">
        <div class="actions-grid">
          <div class="action-item" @click="goToErrorMonitor">
            <BtcSvg name="warning" :size="32" />
            <span>{{ t('monitor.home.quickActions.errorMonitor') }}</span>
          </div>
          <div class="action-item" @click="goToDeploymentTest">
            <BtcSvg name="setting" :size="32" />
            <span>{{ t('monitor.home.quickActions.deploymentTest') }}</span>
          </div>
        </div>
      </BtcCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { BtcCard, BtcSvg } from '@btc/shared-components';
import { getErrorListSync, onErrorListUpdate, type FormattedError } from '@btc/shared-utils/error-monitor';

defineOptions({
  name: 'MonitorHome',
});

const router = useRouter();
const { t } = useI18n();

const errorList = ref<FormattedError[]>([]);

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayErrorCount = computed(() => {
  const today = getToday();
  return errorList.value.filter((error) => {
    // error.time 格式为 "yyyy-MM-dd HH:mm:ss"
    const errorDate = error.time.split(' ')[0];
    return errorDate === today;
  }).length;
});

const totalErrorCount = computed(() => errorList.value.length);

const warningCount = computed(() => {
  return errorList.value.filter((error) => error.isWarning).length;
});

const errorCount = computed(() => {
  return errorList.value.filter((error) => !error.isWarning).length;
});

const goToErrorMonitor = () => {
  router.push('/ops/error');
};

const goToDeploymentTest = () => {
  router.push('/ops/deployment-test');
};

const loadErrorList = () => {
  const list = getErrorListSync();
  errorList.value = list || [];
};

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  loadErrorList();
  
  // 监听错误列表更新事件
  unsubscribe = onErrorListUpdate((newErrorList) => {
    errorList.value = newErrorList || [];
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});
</script>

<style scoped lang="scss">
.monitor-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.monitor-home__intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.monitor-home__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--btc-color-text-primary);
}

.monitor-home__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--btc-color-text-regular);
}

.monitor-home__card {
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 16px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--btc-color-text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--btc-color-text-regular);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  span {
    font-size: 14px;
    color: var(--btc-color-text-regular);
  }
}
</style>
