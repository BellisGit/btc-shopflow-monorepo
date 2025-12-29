<template>
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-if="visible" class="menu-drawer">
        <div class="menu-drawer__header">
          <div class="menu-drawer__header-top">
            <h3>{{ t('app_center.title') }}</h3>
            <span class="menu-drawer__subtitle">{{ t('app_center.subtitle') }}</span>
          </div>
          <div class="menu-drawer__search">
            <el-input
              v-model="searchKeyword"
              :placeholder="t('app_center.search_placeholder')"
              clearable
              size="small"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="menu-drawer__content">
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ t('common.loading') }}...</span>
          </div>
          <div v-else-if="filteredApplications.length > 0" class="app-list">
            <div class="app-list__column">
              <template
                v-for="(app, index) in filteredApplications.filter((_, i) => i % 2 === 0)"
                :key="app.name"
              >
                <el-tooltip
                  :content="getDomainDescription(app)"
                  placement="right"
                  :show-after="300"
                  trigger="hover"
                >
                  <div
                    class="app-card"
                    :class="{ 'is-active': app.name === currentApp }"
                    @click="handleSwitchApp(app)"
                  >
                    <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                      <btc-svg :name="app.icon" :size="22" />
                    </div>
                    <div class="app-card__info">
                      <div class="app-card__title">
                        {{ getDomainDisplayName(app) }}
                      </div>
                    </div>
                    <div class="app-card__action" v-if="app.name === currentApp">
                      <el-icon color="#67c23a">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </el-tooltip>
              </template>
            </div>
            <div class="app-list__column">
              <template
                v-for="(app, index) in filteredApplications.filter((_, i) => i % 2 === 1)"
                :key="app.name"
              >
                <el-tooltip
                  :content="getDomainDescription(app)"
                  placement="right"
                  :show-after="300"
                  trigger="hover"
                >
                  <div
                    class="app-card"
                    :class="{ 'is-active': app.name === currentApp }"
                    @click="handleSwitchApp(app)"
                  >
                    <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                      <btc-svg :name="app.icon" :size="22" />
                    </div>
                    <div class="app-card__info">
                      <div class="app-card__title">
                        {{ getDomainDisplayName(app) }}
                      </div>
                    </div>
                    <div class="app-card__action" v-if="app.name === currentApp">
                      <el-icon color="#67c23a">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </el-tooltip>
              </template>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-state__icon">
              <Search />
            </el-icon>
            <p class="empty-state__text">{{ t('app_center.no_results') }}</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutMenuDrawer'
});

import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Right, Loading, Search } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { BtcSvg } from '@btc/shared-components';
import { service } from '@/services/eps';
import { getDomainList } from '@/utils/domain-cache';
import { getAppConfig, getAllDevPorts, getAllPrePorts } from '@configs/app-env.config';
import { getActiveApp } from '@/store/tabRegistry';

interface MicroApp {
  name: string;
  icon: string;
  color: string;
  entry: string;
  activeRule: string;
  description?: string;
}

interface Props {
  visible: boolean;
  topbarHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  topbarHeight: 46,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const { t } = useI18n();
const router = useRouter();

/**
 * 环境类型
 */
type EnvironmentType = 'development' | 'preview' | 'production';

/**
 * 检测当前环境类型
 */
const getEnvironmentType = (): EnvironmentType => {
  if (typeof window === 'undefined') {
    return import.meta.env.PROD ? 'production' : 'development';
  }

  const port = window.location.port || '';
  const previewPorts = getAllPrePorts();
  const devPorts = getAllDevPorts();

  if (previewPorts.includes(port)) {
    return 'preview';
  }

  if (devPorts.includes(port)) {
    return 'development';
  }

  if (import.meta.env.PROD) {
    return 'production';
  }

  return 'development';
};

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const envType = getEnvironmentType();
  const appConfig = getAppConfig(`${appName}-app`);

  if (!appConfig) {
    console.warn(`[menu-drawer] 未找到应用配置: ${appName}-app`);
    return `/${appName}/`;
  }

  switch (envType) {
    case 'production':
      // 生产环境：根据子域名判断使用子域名还是相对路径
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomainMap: Record<string, string> = {
          'bellis.com.cn': 'system',
          'logistics.bellis.com.cn': 'logistics',
          'quality.bellis.com.cn': 'quality',
          'production.bellis.com.cn': 'production',
          'engineering.bellis.com.cn': 'engineering',
          'finance.bellis.com.cn': 'finance',
        };

        if (subdomainMap[hostname] === appName) {
          const protocol = window.location.protocol;
          return `${protocol}//${hostname}/`;
        }
      }
      return `/${appName}/`;

    case 'preview': {
      return `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
    }

    case 'development':
    default:
      return `//${appConfig.devHost}:${appConfig.devPort}`;
  }
};

// 根据当前路由判断当前应用（系统域是默认域）
const currentApp = ref('system');

// 加载状态
const loading = ref(false);

const detectCurrentApp = () => {
  // 使用统一的 getActiveApp 函数，确保子域名检测逻辑一致
  const path = window.location.pathname;
  currentApp.value = getActiveApp(path);
};

onMounted(() => {
  detectCurrentApp();
  loadApplications(); // 加载应用列表

  // 监听路由变化
  window.addEventListener('popstate', detectCurrentApp);
});

onUnmounted(() => {
  window.removeEventListener('popstate', detectCurrentApp);
});

// 固定显示的应用配置（文档域不再默认显示）
const fixedApplications: MicroApp[] = [];

// 域到应用的映射配置（不包括管理域和文档域）
const domainAppMapping: Record<string, Omit<MicroApp, 'name' | 'description'>> = {
  'LOGISTICS': {
    icon: 'map',
    color: '#67c23a',
    entry: getAppEntry('logistics'),
    activeRule: '/logistics',
  },
  'ENGINEERING': {
    icon: 'design',
    color: '#e6a23c',
    entry: getAppEntry('engineering'),
    activeRule: '/engineering',
  },
  'QUALITY': {
    icon: 'approve',
    color: '#f56c6c',
    entry: getAppEntry('quality'),
    activeRule: '/quality',
  },
  'PRODUCTION': {
    icon: 'work',
    color: '#909399',
    entry: getAppEntry('production'),
    activeRule: '/production',
  },
  'FINANCE': {
    icon: 'amount-alt',
    color: '#1890ff',
    entry: getAppEntry('finance'),
    activeRule: '/finance',
  },
  'SYSTEM': {
    icon: 'user',
    color: '#722ed1',
    entry: getAppEntry('system'),
    activeRule: '/system',
  },
  'ADMIN': {
    icon: 'settings',
    color: '#13c2c2',
    entry: getAppEntry('admin'),
    activeRule: '/admin',
  },
  'OPERATIONS': {
    icon: 'monitor',
    color: '#52c41a',
    entry: getAppEntry('operations'),
    activeRule: '/operations',
  },
  'DASHBOARD': {
    icon: 'trend',
    color: '#ff6b9d',
    entry: getAppEntry('dashboard'),
    activeRule: '/dashboard',
  },
  'PERSONNEL': {
    icon: 'team',
    color: '#ffc107',
    entry: getAppEntry('personnel'),
    activeRule: '/personnel',
  },
};

const applications = ref<MicroApp[]>([]);

// 搜索关键词
const searchKeyword = ref('');

// 存储域数据映射
const domainDataMap = ref<Map<string, any>>(new Map());

// 过滤后的应用列表
const filteredApplications = computed(() => {
  if (!searchKeyword.value.trim()) {
    return applications.value;
  }
  const keyword = searchKeyword.value.toLowerCase().trim();
  return applications.value.filter((app) => {
    const displayName = getDomainDisplayName(app).toLowerCase();
    const description = getDomainDescription(app).toLowerCase();
    return displayName.includes(keyword) || description.includes(keyword);
  });
});

// 域代码到国际化键的映射
const domainCodeToI18nKey: Record<string, string> = {
  'SYSTEM': 'domain.type.system',
  'ADMIN': 'domain.type.admin',
  'QUALITY': 'domain.type.quality',
  'ENGINEERING': 'domain.type.engineering',
  'PRODUCTION': 'domain.type.production',
  'LOGISTICS': 'domain.type.logistics',
  'FINANCE': 'domain.type.finance',
  'OPERATIONS': 'domain.type.operations',
  'DASHBOARD': 'domain.type.dashboard',
  'PERSONNEL': 'domain.type.personnel',
};

// 获取域显示名称
const getDomainDisplayName = (app: MicroApp) => {
  // 固定应用使用国际化配置
  if (app.name === 'docs') {
    return t(`micro_app.${app.name}.title`);
  }

  // 从域数据映射中查找
  const domain = domainDataMap.value.get(app.name.toUpperCase());

  // 优先使用后端返回的 domainType
  if (domain && domain.domainType) {
    return domain.domainType;
  }

  // 如果后端没有返回 domainType，使用国际化映射
  const domainCode = domain?.domainCode || app.name.toUpperCase();
  const i18nKey = domainCodeToI18nKey[domainCode];
  if (i18nKey) {
    const i18nValue = t(i18nKey);
    // 如果国际化值存在且不是 key 本身，则使用国际化值
    if (i18nValue && i18nValue !== i18nKey) {
      return i18nValue;
    }
  }

  // 兜底使用国际化配置
  return t(`micro_app.${app.name}.title`);
};

// 获取域描述
const getDomainDescription = (app: MicroApp) => {
  // 固定应用使用国际化配置
  if (app.name === 'docs') {
    return t(`micro_app.${app.name}.description`);
  }

  // 优先使用国际化配置
  const i18nKey = `micro_app.${app.name}.description`;
  if (t(i18nKey) !== i18nKey) {
    return t(i18nKey);
  }

  // 如果国际化配置不存在，使用后端返回的描述
  return app.description || '';
};

// 从域列表服务获取域信息，构建应用列表
const loadApplications = async () => {
  loading.value = true;
  try {
    // 确保 service 存在，避免 undefined 错误
    if (!service) {
      console.warn('[menu-drawer] EPS service not available');
      applications.value = [...fixedApplications];
      loading.value = false;
      return;
    }
    // 使用共享缓存获取域列表
    const response = await getDomainList(service);

    // me 接口返回的数据结构：{ code: 200, msg: "...", data: [...] }
    // 兼容处理：支持 response.data（me接口）、response.list（list接口）、直接数组
    const domainList = Array.isArray(response)
      ? response
      : (response?.data || response?.list || []);

    if (Array.isArray(domainList) && domainList.length > 0) {
      // 创建完整的域映射表（包括所有域）
      const domainMap = new Map();
      domainList.forEach((domain: any) => {
        // me 接口返回的域数据可能没有 domainCode，需要根据 name 或 id 推断
        // 或者使用 name 作为 key
        const domainCode = domain.domainCode ||
          (domain.name === '系统域' || domain.name === 'System Domain' ? 'SYSTEM' :
           domain.name === '运维域' ? 'OPERATIONS' :
           domain.name === '看板域' ? 'DASHBOARD' :
           domain.name === '人事域' ? 'PERSONNEL' :
           domain.name === '管理域' || domain.name === 'Admin Domain' ? 'ADMIN' :
           domain.name === '品质域' || domain.name === 'Quality Domain' ? 'QUALITY' :
           domain.name === '工程域' || domain.name === 'Engineering Domain' ? 'ENGINEERING' :
           domain.name === '生产域' || domain.name === 'Production Domain' ? 'PRODUCTION' :
           domain.name === '物流域' || domain.name === 'Logistics Domain' ? 'LOGISTICS' :
           domain.name === '财务域' || domain.name === 'Finance Domain' ? 'FINANCE' :
           domain.id || domain.name);
        if (domainCode) {
          // 同时使用 domainCode 和 name 作为 key，确保能找到
          domainMap.set(domainCode, domain);
          if (domain.name && domain.name !== domainCode) {
            domainMap.set(domain.name, domain);
          }
        }
      });

      // 更新域数据映射（用于显示名称）
      domainDataMap.value = domainMap;

      // 构建应用列表
      const appList: MicroApp[] = [];

      // 1. 添加主应用（系统域 - 默认域）
      const systemDomain = Array.from(domainMap.values())
        .find((domain: any) =>
          domain.domainCode === 'SYSTEM' ||
          domain.name === '系统域' ||
          domain.id === '17601901464201'
        );

      appList.push({
        name: 'system',
        icon: 'user',
        color: '#722ed1',
        entry: getAppEntry('system'),
        activeRule: '/',
        description: systemDomain?.description || ''
      });

      // 2. 添加管理域应用
      const adminDomain = Array.from(domainMap.values())
        .find((domain: any) =>
          domain.domainCode === 'ADMIN' ||
          domain.name === '管理域' ||
          domain.id === 'SDOM-9473'
        );

      if (adminDomain) {
        appList.push({
          name: 'admin',
          icon: 'settings',
          color: '#13c2c2',
          entry: getAppEntry('admin'),
          activeRule: '/admin',
          description: adminDomain.description || ''
        });
      }

      // 3. 添加其他业务域应用（排除系统域、管理域和文档域）
      domainList
        .filter((domain: any) =>
          domain.domainCode !== 'SYSTEM' &&
          domain.name !== '系统域' &&
          domain.id !== '17601901464201' &&
          domain.domainCode !== 'ADMIN' &&
          domain.name !== '管理域' &&
          domain.id !== 'SDOM-9473' &&
          domain.domainCode !== 'DOCS' &&
          domain.name !== '文档中心'
        )
        .forEach((domain: any) => {
          const domainCode = domain.domainCode || domain.id || domain.name;
          const appConfig = domainAppMapping[domainCode];

          if (appConfig) {
            const app = {
              name: domainCode.toLowerCase(), // 应用名称使用小写，用于路由匹配
              ...appConfig,
              description: domain.description || ''
            };
            appList.push(app);
          }
        });

      applications.value = appList;
    } else {
      // 如果服务不可用，使用默认配置
      applications.value = [
        {
          name: 'system',
          icon: 'user',
          color: '#722ed1',
          entry: getAppEntry('system'),
          activeRule: '/',
          description: ''
        }
      ];
      domainDataMap.value.clear();
    }
  } catch (error) {
    console.warn('获取域列表失败，使用默认应用配置:', error);
    // 服务不可用时，使用默认配置
    applications.value = [
      {
        name: 'system',
        icon: 'user',
        color: '#722ed1',
        entry: getAppEntry('system'),
        activeRule: '/',
        description: ''
      }
    ];
    domainDataMap.value.clear();
  } finally {
    loading.value = false;
  }
};

const handleSwitchApp = async (app: MicroApp) => {
  if (app.name === currentApp.value) {
    // 当前应用，不提示
    return;
  }

  // 判断是否为生产环境（通过 hostname 判断）
  const isProduction = window.location.hostname.includes('bellis.com.cn');

  let targetUrl: string;

  // 生产环境：使用子域名跳转
  if (isProduction) {
    // 文档应用特殊处理（文档应用可能没有独立的子域名）
    if (app.name === 'docs') {
      // 文档应用在生产环境可能仍使用路径方式，或者有独立的子域名
      // 这里先使用路径方式，如果需要可以后续配置
      const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      targetUrl = `${protocol}//${hostname}${targetPath}`;
    } else {
      // 根据应用名称获取生产环境域名配置
      // 应用名称映射：finance -> finance-app, quality -> quality-app, etc.
      const appNameMapping: Record<string, string> = {
        'system': 'system-app',
        'admin': 'admin-app',
        'logistics': 'logistics-app',
        'engineering': 'engineering-app',
        'quality': 'quality-app',
        'production': 'production-app',
        'finance': 'finance-app',
        'mobile': 'mobile-app',
        'docs': 'docs-app', // 文档应用可能没有配置，但先加上
      };
      const mappedAppName = appNameMapping[app.name] || `${app.name}-app`;
      const appConfig = getAppConfig(mappedAppName);
      if (appConfig && appConfig.prodHost) {
        // 构建完整的 URL，直接跳转到子域名的根路径
        // 注意：生产环境子域名是独立部署的，不需要路径前缀
        const protocol = window.location.protocol;
        targetUrl = `${protocol}//${appConfig.prodHost}/`;
      } else {
        console.warn(`[MenuDrawer] 未找到应用 ${app.name} 的生产环境配置，使用路径方式切换`);
        const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        targetUrl = `${protocol}//${hostname}${targetPath}`;
      }
    }
  } else {
    // 开发/预览环境：基于主应用 URL 拼接路径
    const envType = getEnvironmentType();
    const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
    
    // 开发环境和预览环境都使用当前主应用的 URL + 路径前缀
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    targetUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}${targetPath}`;
  }

  // 使用 window.open 在新标签页打开
  window.open(targetUrl, '_blank');
};

const handleClose = () => {
  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      emit('update:visible', false);
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
      if (import.meta.env.DEV) {
        console.warn('[MenuDrawer] handleClose error:', error);
      }
    }
  });
};

// 记录页面变为可见的时间戳，用于忽略页面刚变为可见时的误触发事件
let lastVisibilityChangeTime = 0;
const VISIBILITY_CHANGE_IGNORE_DURATION = 200; // 页面变为可见后 200ms 内忽略点击事件

// 监听页面可见性变化
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 记录页面变为可见的时间
    lastVisibilityChangeTime = Date.now();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!props.visible) return;

  // 检查事件是否可信（避免程序触发的事件）
  if (event.isTrusted === false) {
    return;
  }

  // 检查页面是否可见（避免关闭标签页时触发）
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return;
  }

  // 关键：忽略页面刚变为可见后的短时间内的点击事件（避免切换回标签页时误触发）
  const now = Date.now();
  if (lastVisibilityChangeTime > 0 && (now - lastVisibilityChangeTime) < VISIBILITY_CHANGE_IGNORE_DURATION) {
    return;
  }

  const drawer = document.querySelector('.menu-drawer');
  if (drawer && !drawer.contains(event.target as Node)) {
    handleClose();
  }
};

// 监听 iframe 内部点击（由 DocsIframe 转发）
const handleIframeClick = () => {
  if (props.visible) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('iframe-clicked', handleIframeClick);
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('iframe-clicked', handleIframeClick);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style lang="scss" scoped>
.menu-drawer {
  position: fixed;
  top: 48px;
  left: 0;
  width: 255px;
  height: calc(100vh - 48px);
  height: calc(100vh - 48px);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-extra-light);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 999;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    background-color: var(--el-bg-color);
  }

  &__header-top {
    margin-bottom: 12px;

    h3 {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  &__subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__search {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
    }

    :deep(.el-input__wrapper:hover) {
      box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
    }

    :deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    background-color: var(--el-bg-color);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--el-text-color-secondary);
  gap: 12px;

  &__icon {
    font-size: 32px;
    color: var(--el-text-color-placeholder);
  }

  &__text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.app-list {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 2px 0;
  width: 100%;
  box-sizing: border-box;
}

.app-list__column {
  flex: 1 1 calc(50% - 5px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  box-sizing: border-box;
}

/* 响应式优化 - 小屏幕下恢复单列 */
@media (max-width: 768px) {
  .app-list {
    flex-direction: column;
  }

  .app-list__column {
    width: 100%;
  }
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 6px;
  min-height: 64px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  &.is-active {
    border-color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);

    .app-card__icon {
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
      transform: scale(1.05);
    }
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden; // 防止文字溢出到勾选标记区域
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // 不需要 padding-right，勾选标记是绝对定位的，不会影响文字布局
  }

  &__action {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 9px;
    color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);
    border: 1.5px solid var(--el-color-success);
    border-radius: 50%;
    transition: all 0.3s;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(103, 194, 58, 0.08);
  }
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

.menu-drawer__content {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color);
    border-radius: 3px;

    &:hover {
      background-color: var(--el-border-color-dark);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
</style>
