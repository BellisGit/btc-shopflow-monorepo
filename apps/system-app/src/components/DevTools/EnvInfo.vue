<template>
  <div class="env-info">
    <div class="env-info__header">
      <h3>系统信息</h3>
    </div>
    
    <div class="env-info__content">
      <div class="info-card">
        <div class="info-card__icon">
          <el-icon :size="24">
            <Monitor />
          </el-icon>
        </div>
        <div class="info-card__content">
          <div class="info-card__label">运行环境</div>
          <div class="info-card__value">
            <el-tag :type="envTagType" size="small" effect="dark">{{ envLabel }}</el-tag>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-card__icon">
          <el-icon :size="24">
            <Grid />
          </el-icon>
        </div>
        <div class="info-card__content">
          <div class="info-card__label">当前应用</div>
          <div class="info-card__value">
            <el-tag type="info" size="small" effect="dark">{{ currentAppLabel }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Monitor, Grid } from '@element-plus/icons-vue';
import { getEnvironment, getCurrentSubApp } from '@configs/unified-env-config';
import { getAllApps, getMainApp } from '@configs/app-scanner';

// 当前环境和应用信息（响应式）
const currentEnvironment = ref(getEnvironment());
const currentSubApp = ref(getCurrentSubApp());
const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');
const mainApp = computed(() => getMainApp());

// 根据当前路径动态计算当前应用
const currentApp = computed(() => {
  // 使用 window.location.pathname 而不是 route.path（因为组件可能不在 Router 上下文中）
  const path = currentPath.value;
  const apps = getAllApps();
  
  // 查找匹配的子应用
  for (const app of apps) {
    if (app.type === 'sub' && app.enabled) {
      const normalizedPathPrefix = app.pathPrefix.endsWith('/') 
        ? app.pathPrefix.slice(0, -1) 
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;
      
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
        return app.name;
      }
    }
  }
  
  // 如果没有匹配到子应用，返回主应用
  return mainApp.value?.name || 'system';
});

const envLabel = computed(() => {
  const env = currentEnvironment.value;
  const envMap: Record<string, string> = {
    development: '开发',
    preview: '预览',
    production: '生产',
  };
  return envMap[env] || env;
});

const envTagType = computed(() => {
  const env = currentEnvironment.value;
  if (env === 'production') return 'warning';
  if (env === 'preview') return 'info';
  return 'success';
});

const currentAppLabel = computed(() => currentApp.value);

// 更新环境和应用信息
function updateEnvInfo() {
  currentEnvironment.value = getEnvironment();
  currentSubApp.value = getCurrentSubApp();
  currentPath.value = typeof window !== 'undefined' ? window.location.pathname : '';
}

onMounted(() => {
  // 初始化环境信息（立即更新路径）
  currentPath.value = typeof window !== 'undefined' ? window.location.pathname : '';
  updateEnvInfo();
  
  // 监听事件总线的应用切换事件
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    // 监听应用切换事件（汉堡菜单切换应用时会触发）
    emitter.on('app.switch', updateEnvInfo);
    // 监听路由变化事件（作为兜底）
    emitter.on('route.change', updateEnvInfo);
  }
  
  // 监听浏览器历史记录变化（popstate 事件）
  window.addEventListener('popstate', updateEnvInfo);
  
  // 监听 pushState 和 replaceState（通过重写 history API）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    // 延迟更新，确保路径已变化
    setTimeout(updateEnvInfo, 0);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    // 延迟更新，确保路径已变化
    setTimeout(updateEnvInfo, 0);
  };
  
  // 保存原始方法以便清理
  (window as any).__ENV_INFO_ORIGINAL_PUSH_STATE__ = originalPushState;
  (window as any).__ENV_INFO_ORIGINAL_REPLACE_STATE__ = originalReplaceState;
});

onUnmounted(() => {
  // 清理事件监听
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.off('app.switch', updateEnvInfo);
    emitter.off('route.change', updateEnvInfo);
  }
  
  // 恢复原始 history API
  const originalPushState = (window as any).__ENV_INFO_ORIGINAL_PUSH_STATE__;
  const originalReplaceState = (window as any).__ENV_INFO_ORIGINAL_REPLACE_STATE__;
  
  if (originalPushState) {
    history.pushState = originalPushState;
  }
  if (originalReplaceState) {
    history.replaceState = originalReplaceState;
  }
  
  window.removeEventListener('popstate', updateEnvInfo);
});
</script>

<style lang="scss" scoped>
.env-info {
  padding: 20px;
  
  &__header {
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      letter-spacing: 0.5px;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    border-radius: 10px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  &__value {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}
</style>

