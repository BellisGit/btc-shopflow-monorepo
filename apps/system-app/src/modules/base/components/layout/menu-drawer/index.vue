<template>
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-if="visible" class="menu-drawer">
        <div class="menu-drawer__header">
          <h3>{{ t('app_center.title') }}</h3>
          <span class="menu-drawer__subtitle">{{ t('app_center.subtitle') }}</span>
        </div>

        <div class="menu-drawer__content">
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ t('common.loading') }}...</span>
          </div>
          <div v-else class="app-list">
            <div
              v-for="app in applications"
              :key="app.name"
              class="app-card"
              :class="{ 'is-active': app.name === currentApp }"
              @click="handleSwitchApp(app)"
            >
              <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                <btc-svg :name="app.icon" :size="32" />
              </div>
              <div class="app-card__info">
                <div class="app-card__title">
                  {{ getDomainDisplayName(app) }}
                  <el-tag v-if="app.name === currentApp" size="small" type="success">
                    {{ t('app_center.current') }}
                  </el-tag>
                </div>
                <div class="app-card__description">
                  {{ getDomainDescription(app) }}
                </div>
              </div>
              <div class="app-card__action">
                <el-icon v-if="app.name === currentApp" color="#67c23a">
                  <Check />
                </el-icon>
                <el-icon v-else>
                  <Right />
                </el-icon>
              </div>
            </div>
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

import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Right, Loading } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { BtcSvg } from '@btc/shared-components';
import { service } from '@/services/eps';
import { getDomainList } from '@/utils/domain-cache';
import { finishLoading } from '@/utils/loadingManager';
import { getAppConfig } from '@configs/app-env.config';
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
    entry: '//localhost:8082',
    activeRule: '/logistics',
  },
  'ENGINEERING': {
    icon: 'design',
    color: '#e6a23c',
    entry: '//localhost:8085',
    activeRule: '/engineering',
  },
  'QUALITY': {
    icon: 'approve',
    color: '#f56c6c',
    entry: '//localhost:8083',
    activeRule: '/quality',
  },
  'PRODUCTION': {
    icon: 'work',
    color: '#909399',
    entry: '//localhost:8084',
    activeRule: '/production',
  },
  'FINANCE': {
    icon: 'amount-alt',
    color: '#1890ff',
    entry: '//localhost:8086',
    activeRule: '/finance',
  },
  'SYSTEM': {
    icon: 'user',
    color: '#722ed1',
    entry: '//localhost:8081',
    activeRule: '/system',
  },
  'ADMIN': {
    icon: 'settings',
    color: '#13c2c2',
    entry: '//localhost:8080',
    activeRule: '/admin',
  },
};

const applications = ref<MicroApp[]>([]);

// 存储域数据映射
const domainDataMap = ref<Map<string, any>>(new Map());

// 域代码到国际化键的映射
const domainCodeToI18nKey: Record<string, string> = {
  'SYSTEM': 'domain.type.system',
  'ADMIN': 'domain.type.admin',
  'QUALITY': 'domain.type.quality',
  'ENGINEERING': 'domain.type.engineering',
  'PRODUCTION': 'domain.type.production',
  'LOGISTICS': 'domain.type.logistics',
  'FINANCE': 'domain.type.finance',
};

// 获取域显示名称
const getDomainDisplayName = (app: MicroApp) => {
  // 固定应用使用国际化配置
  if (app.name === 'docs') {
    return t(`micro_app.${app.name}.title`);
  }

  // 获取域代码（从应用名称或域数据中）
  let domainCode: string;

  // 从域数据映射中查找
  const domain = domainDataMap.value.get(app.name.toUpperCase());
  if (domain) {
    domainCode = domain.domainCode || app.name.toUpperCase();
  } else {
    domainCode = app.name.toUpperCase();
  }

  // 使用国际化映射
  const i18nKey = domainCodeToI18nKey[domainCode];
  if (i18nKey) {
    return t(i18nKey);
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
        entry: '//localhost:8081',
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
          entry: '//localhost:8080',
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
          entry: '//localhost:8081',
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
        entry: '//localhost:8081',
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

  // 关闭抽屉
  handleClose();

  // 判断是否为生产环境（通过 hostname 判断）
  const isProduction = window.location.hostname.includes('bellis.com.cn');

  // 生产环境：使用子域名跳转
  if (isProduction) {
    // 文档应用特殊处理（文档应用可能没有独立的子域名）
    if (app.name === 'docs') {
      // 文档应用在生产环境可能仍使用路径方式，或者有独立的子域名
      // 这里先使用路径方式，如果需要可以后续配置
      const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
      await router.push(targetPath);
      await nextTick();
      detectCurrentApp();
      return;
    }

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
      const targetUrl = `${protocol}//${appConfig.prodHost}/`;

      // 使用 window.location.href 跳转到子域名
      window.location.href = targetUrl;
      return;
    } else {
      console.warn(`[MenuDrawer] 未找到应用 ${app.name} 的生产环境配置，使用路径方式切换`);
    }
  }

  // 开发/预览环境：使用路径方式切换（原有逻辑）
  // 确保使用绝对路径
  const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;

  // 如果是切换到主应用（system），确保使用 replace 模式，避免历史记录堆积
  const isSystemApp = app.name === 'system';
  
  // 设置超时保护，确保 loading 状态最终会被清除
  // 注意：超时时间应该大于 single-spa 的 bootstrap 超时时间，给应用足够的加载时间
  // 生产环境资源加载可能较慢，需要更长的超时时间
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
  const isDev = import.meta.env.DEV;
  const maxLoadingTime = isDev ? 12000 : 20000; // 开发环境 12 秒，生产环境 20 秒（考虑网络延迟）

  // 监听 afterMount 事件，确保 loading 状态被清除
  const handleAfterMount = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    window.removeEventListener('qiankun:after-mount', handleAfterMount);
  };

  // 设置超时保护
  loadingTimeout = setTimeout(() => {
    console.warn(`[MenuDrawer] 应用 ${app.name} 加载超时，强制清除 loading 状态`);
    finishLoading(); // 强制清除 loading 状态
    window.removeEventListener('qiankun:after-mount', handleAfterMount);
    loadingTimeout = null;
  }, maxLoadingTime);

  // 监听 afterMount 事件（仅当不是切换到主应用时，因为主应用不需要加载子应用）
  if (!isSystemApp) {
    window.addEventListener('qiankun:after-mount', handleAfterMount);
  }

  try {
    // 使用主应用的 router.push，Qiankun 会自动卸载当前子应用并加载目标子应用
    // 切换到主应用时使用 replace，避免历史记录堆积
    if (isSystemApp) {
      await router.replace(targetPath);
    } else {
      await router.push(targetPath);
    }
    await nextTick();
    detectCurrentApp();
    
    // 如果是切换到主应用，立即清除 loading 状态和超时
    if (isSystemApp) {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
      finishLoading();
    }
  } catch (error) {
    // 如果路由切换失败，清除监听和超时，并强制清除 loading 状态
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    finishLoading(); // 强制清除 loading 状态
    if (!isSystemApp) {
      window.removeEventListener('qiankun:after-mount', handleAfterMount);
    }
    console.error(`[MenuDrawer] 切换到应用 ${app.name} 失败:`, error);
  }
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleClickOutside = (event: MouseEvent) => {
  if (!props.visible) return;

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
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('iframe-clicked', handleIframeClick);
});
</script>

<style lang="scss" scoped>
.menu-drawer {
  position: fixed;
  top: 48px;
  left: 0;
  width: 25%;
  min-width: 320px;
  max-width: 450px;
  height: calc(100vh - 48px);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-extra-light);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 999;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    background-color: var(--el-bg-color);

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  &__subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
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

.app-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &.is-active {
    border-color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);

    .app-card__icon {
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
    }
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;

    .el-tag {
      font-size: 12px;
    }
  }

  &__description {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__action {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 20px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;
  }

  &:hover &__action {
    color: var(--el-color-primary);
  }

  &.is-active &__action {
    color: var(--el-color-success);
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
