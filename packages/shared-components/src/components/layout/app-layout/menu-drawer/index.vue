<template>
  <teleport to="body">
    <!-- 关键：使用 v-show 替代 v-if，保持 DOM 节点始终存在，避免销毁重建导致的 DOM 操作冲突 -->
    <!-- 保证在子应用切换时，menu-drawer 的 DOM 不被销毁，避免 insertBefore 等报错 -->
    <transition name="drawer-slide">
      <div v-show="visible" class="menu-drawer">
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
                  {{ app.description || t(`micro_app.${app.name}.description`) }}
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

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Right, Loading } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';

// 通过全局函数获取应用特定的依赖
// 这些函数需要由使用共享布局的应用提供
declare global {
  interface Window {
    __APP_EPS_SERVICE__?: any;
    __APP_GET_DOMAIN_LIST__?: (service: any) => Promise<any>;
    __APP_CLEAR_DOMAIN_CACHE__?: () => void;
    __APP_FINISH_LOADING__?: () => void;
    __APP_GET_APP_CONFIG__?: (appName: string) => any;
    __APP_GET_ALL_DEV_PORTS__?: () => string[];
    __APP_GET_ALL_PRE_PORTS__?: () => string[];
  }
}

// 获取 EPS 服务（从全局或应用提供）
function getEpsService() {
  return (window as any).__APP_EPS_SERVICE__ || (window as any).service || null;
}

// 获取域名列表（从全局或应用提供）
async function getDomainList(service: any) {
  const getDomainListFn = (window as any).__APP_GET_DOMAIN_LIST__;
  if (getDomainListFn) {
    return await getDomainListFn(service);
  }
  // 如果没有提供，返回空数组（静默处理，不输出警告）
  return [];
}

// 开始加载（立即显示 loading，避免白屏）
function startLoading() {
  // 立即设置 loading 状态，确保在路由切换前就显示 loading
  const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
  if (viewport) {
    viewport.setAttribute('data-qiankun-loading', 'true');
    // 确保容器可见
    viewport.style.setProperty('display', 'flex', 'important');
    viewport.style.setProperty('visibility', 'visible', 'important');
    viewport.style.setProperty('opacity', '1', 'important');
    // 触发自定义事件，通知 Layout 组件立即更新状态
    window.dispatchEvent(new CustomEvent('qiankun:before-load', {
      detail: { appName: 'switching' }
    }));
  }
}

// 完成加载（从全局或应用提供）
function finishLoading() {
  const finishLoadingFn = (window as any).__APP_FINISH_LOADING__;
  if (finishLoadingFn) {
    finishLoadingFn();
  } else {
    // 如果没有全局函数，直接清除 loading 状态
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      viewport.removeAttribute('data-qiankun-loading');
    }
  }
}

// 获取应用配置（从全局或应用提供）
function getAppConfig(appName: string) {
  const getAppConfigFn = (window as any).__APP_GET_APP_CONFIG__;
  if (getAppConfigFn) {
    const config = getAppConfigFn(appName);
    if (!config) {
      // 静默处理，不输出警告
      return null;
    }
    return config;
  }
  // 静默处理，不输出警告
  return null;
}

// 获取所有开发端口（从全局或应用提供）
function getAllDevPorts(): string[] {
  const getAllDevPortsFn = (window as any).__APP_GET_ALL_DEV_PORTS__;
  if (getAllDevPortsFn) {
    return getAllDevPortsFn();
  }
  return [];
}

// 获取所有预览端口（从全局或应用提供）
function getAllPrePorts(): string[] {
  const getAllPrePortsFn = (window as any).__APP_GET_ALL_PRE_PORTS__;
  if (getAllPrePortsFn) {
    return getAllPrePortsFn();
  }
  return [];
}

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
    // 静默处理，使用默认路径
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
  if (typeof window === 'undefined') {
    return;
  }

  // 检测是否在生产环境的子域名下
  const hostname = window.location.hostname;
  const isProduction = hostname.includes('bellis.com.cn');
  const isProductionSubdomain = isProduction && hostname !== 'bellis.com.cn';

  // 子域名映射
  const subdomainMap: Record<string, string> = {
    'admin.bellis.com.cn': 'admin',
    'logistics.bellis.com.cn': 'logistics',
    'quality.bellis.com.cn': 'quality',
    'production.bellis.com.cn': 'production',
    'engineering.bellis.com.cn': 'engineering',
    'finance.bellis.com.cn': 'finance',
  };

  // 如果在生产环境子域名下，直接通过 hostname 判断
  if (isProductionSubdomain && subdomainMap[hostname]) {
    currentApp.value = subdomainMap[hostname];
    return;
  }

  // 如果在生产环境主域名下，通过路径前缀判断
  if (isProduction && hostname === 'bellis.com.cn') {
    const path = window.location.pathname;
    if (path.startsWith('/docs')) {
      currentApp.value = 'docs';
    } else if (path.startsWith('/logistics')) {
      currentApp.value = 'logistics';
    } else if (path.startsWith('/engineering')) {
      currentApp.value = 'engineering';
    } else if (path.startsWith('/quality')) {
      currentApp.value = 'quality';
    } else if (path.startsWith('/production')) {
      currentApp.value = 'production';
    } else if (path.startsWith('/finance')) {
      currentApp.value = 'finance';
    } else if (path.startsWith('/admin')) {
      currentApp.value = 'admin';
    } else {
      // 系统域是默认域，负责全域系统用户处理日常事务的共享域
      currentApp.value = 'system';
    }
    return;
  }

  // 开发/预览环境：通过路径前缀判断
  const path = window.location.pathname;
  if (path.startsWith('/docs')) {
    currentApp.value = 'docs';
  } else if (path.startsWith('/logistics')) {
    currentApp.value = 'logistics';
  } else if (path.startsWith('/engineering')) {
    currentApp.value = 'engineering';
  } else if (path.startsWith('/quality')) {
    currentApp.value = 'quality';
  } else if (path.startsWith('/production')) {
    currentApp.value = 'production';
  } else if (path.startsWith('/finance')) {
    currentApp.value = 'finance';
  } else if (path.startsWith('/admin')) {
    currentApp.value = 'admin';
  } else {
    // 系统域是默认域，负责全域系统用户处理日常事务的共享域
    currentApp.value = 'system';
  }
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
};

const applications = ref<MicroApp[]>([]);

// 存储域数据映射
const domainDataMap = ref<Map<string, any>>(new Map());

// 域代码到国际化键的映射（用于显示名称）
const domainCodeToI18nKey: Record<string, string> = {
  'SYSTEM': 'domain.type.system',
  'ADMIN': 'domain.type.admin',
  'QUALITY': 'domain.type.quality',
  'ENGINEERING': 'domain.type.engineering',
  'PRODUCTION': 'domain.type.production',
  'LOGISTICS': 'domain.type.logistics',
  'FINANCE': 'domain.type.finance',
  'MONITOR': 'domain.type.monitor',
};

// 获取域显示名称
const getDomainDisplayName = (app: MicroApp) => {
  // 固定应用使用国际化配置
  if (app.name === 'docs') {
    return t(`micro_app.${app.name}.title`);
  }

  // 优先使用国际化配置，确保名称一致性
  // 首先尝试从域数据中获取 domainCode，然后使用国际化映射
  let domainCode: string | undefined;

  // 系统域
  if (app.name === 'system') {
    const systemDomain = Array.from(domainDataMap.value.values())
      .find((domain: any) =>
        domain.domainCode === 'SYSTEM' ||
        domain.name === '系统域' ||
        domain.id === '17601901464201'
      );
    domainCode = systemDomain?.domainCode || 'SYSTEM';
  }
  // 管理域
  else if (app.name === 'admin') {
    const adminDomain = Array.from(domainDataMap.value.values())
      .find((domain: any) =>
        domain.domainCode === 'ADMIN' ||
        domain.name === '管理域' ||
        domain.id === 'SDOM-9473'
      );
    domainCode = adminDomain?.domainCode || 'ADMIN';
  }
  // 其他域
  else {
    // 首先尝试使用 app.name 的大写形式作为 key
    let domain = domainDataMap.value.get(app.name.toUpperCase());

    // 如果找不到，尝试从所有域中查找匹配的域
    if (!domain) {
      domain = Array.from(domainDataMap.value.values())
        .find((d: any) => {
          const code = d.domainCode || d.id || d.name;
          return code && code.toUpperCase() === app.name.toUpperCase();
        });
    }

    // 如果还是找不到，尝试使用其他可能的匹配方式
    if (!domain) {
      const domainNameMap: Record<string, string> = {
        'logistics': '物流域',
        'finance': '财务域',
        'quality': '品质域',
        'production': '生产域',
        'engineering': '工程域',
      };
      const domainName = domainNameMap[app.name];
      if (domainName) {
        domain = Array.from(domainDataMap.value.values())
          .find((d: any) => d.name === domainName);
      }
    }

    domainCode = domain?.domainCode || app.name.toUpperCase();
  }

  // 使用国际化映射获取显示名称
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

// 等待 EPS 服务可用（轮询方式，最多等待5秒）
const waitForEpsService = async (maxWaitTime = 5000, interval = 100): Promise<any> => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    const currentService = getEpsService();
    if (currentService) {
      return currentService;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return null;
};

// 从域列表服务获取域信息，构建应用列表
const loadApplications = async () => {
  loading.value = true;
  try {
    // 获取 EPS 服务，如果不可用则等待
    let service = getEpsService();
    if (!service) {
      // 在子域环境下，layout-app 可能还在初始化，等待一下
      service = await waitForEpsService(5000, 100);
      if (!service) {
        console.warn('[menu-drawer] EPS service not available after waiting');
        loading.value = false;
        finishLoading();
        return;
      }
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
          (domain.name === '系统域' ? 'SYSTEM' :
           domain.name === '管理域' ? 'ADMIN' :
           domain.name === '物流域' ? 'LOGISTICS' :
           domain.name === '财务域' ? 'FINANCE' :
           domain.name === '品质域' ? 'QUALITY' :
           domain.name === '生产域' ? 'PRODUCTION' :
           domain.name === '工程域' ? 'ENGINEERING' :
           domain.id || domain.name);
        if (domainCode) {
          // 使用 domainCode 作为主 key
          domainMap.set(domainCode, domain);
          // 同时使用 domainCode 的大写形式作为 key（用于查找）
          if (typeof domainCode === 'string') {
            domainMap.set(domainCode.toUpperCase(), domain);
          }
          // 使用 domain.name 作为 key（用于中文名称查找）
          if (domain.name) {
            domainMap.set(domain.name, domain);
          }
          // 使用小写的 domainCode 作为 key（用于 app.name 查找）
          if (typeof domainCode === 'string') {
            domainMap.set(domainCode.toLowerCase(), domain);
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
        description: systemDomain ?
          (systemDomain.description || `${systemDomain.name} - 全域系统用户处理日常事务的共享域`) :
          '系统应用 - 全域系统用户处理日常事务的共享域，可以处理不需要具体区分域的业务'
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
          description: adminDomain.description || `${adminDomain.name} - 平台管理、组织架构、权限管理、导航管理`
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
              description: domain.description || `${domain.name} - 业务域应用`
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
          description: '系统应用 - 全域系统用户处理日常事务的共享域，可以处理不需要具体区分域的业务'
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
        description: '系统应用 - 全域系统用户处理日常事务的共享域，可以处理不需要具体区分域的业务'
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
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('bellis.com.cn');

  // 生产环境：使用子域名跳转
  if (isProduction) {
    // 文档应用特殊处理（文档应用可能没有独立的子域名）
    if (app.name === 'docs') {
      // 立即关闭抽屉，不等待动画完成
      handleClose();
      
      // 文档应用在生产环境可能仍使用路径方式，或者有独立的子域名
      // 这里先使用路径方式，如果需要可以后续配置
      const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
      await router.push(targetPath);
      await nextTick();
      detectCurrentApp();

      // 发送应用切换事件
      const emitter = (window as any).__APP_EMITTER__;
      if (emitter) {
        emitter.emit('app.switch', { appName: app.name, path: targetPath });
      }
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
      'docs': 'docs-site-app', // 文档应用使用 docs-site-app
    };
    const mappedAppName = appNameMapping[app.name] || `${app.name}-app`;
    const appConfig = getAppConfig(mappedAppName);
    if (appConfig && appConfig.prodHost) {
      // 立即关闭抽屉，不等待动画完成
      handleClose();
      
      // 清除域列表缓存，确保子应用重新请求域列表
      const clearDomainCacheFn = (window as any).__APP_CLEAR_DOMAIN_CACHE__;
      if (clearDomainCacheFn && typeof clearDomainCacheFn === 'function') {
        clearDomainCacheFn();
      }

      // 构建完整的 URL，直接跳转到子域名根路径（不添加任何参数）
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

  // 关键：立即显示 loading，避免白屏
  // 在路由切换前就显示 loading，确保用户看到加载状态而不是白屏
  startLoading();

  // 设置超时保护，确保 loading 状态最终会被清除
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
  const maxLoadingTime = 10000; // 10秒超时

  // 监听 afterMount 事件，确保 loading 状态被清除
  const handleAfterMount = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    finishLoading(); // 清除 loading 状态
    window.removeEventListener('qiankun:after-mount', handleAfterMount);
  };

  // 设置超时保护
  loadingTimeout = setTimeout(() => {
    console.warn(`[MenuDrawer] 应用 ${app.name} 加载超时，强制清除 loading 状态`);
    finishLoading(); // 强制清除 loading 状态
    window.removeEventListener('qiankun:after-mount', handleAfterMount);
    loadingTimeout = null;
  }, maxLoadingTime);

  // 监听 afterMount 事件
  window.addEventListener('qiankun:after-mount', handleAfterMount);

  // 立即关闭抽屉，不等待动画完成，让路由切换可以立即开始
  handleClose();

  try {
  // 使用主应用的 router.push，Qiankun 会自动卸载当前子应用并加载目标子应用
  // 使用 nextTick 确保路由切换完成，容器准备好后再继续
  await router.push(targetPath);
  await nextTick();
  detectCurrentApp();

  // 发送应用切换事件，通知其他组件（如 ApiSwitch）更新
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.emit('app.switch', { appName: app.name, path: targetPath });
  }
  } catch (error) {
    // 如果路由切换失败，清除监听和超时，并强制清除 loading 状态
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    finishLoading(); // 强制清除 loading 状态
    window.removeEventListener('qiankun:after-mount', handleAfterMount);
    console.error(`[MenuDrawer] 切换到应用 ${app.name} 失败:`, error);
  }
};

// 辅助函数：检查是否应该处理抽屉事件
const shouldHandleDrawerEvent = (): boolean => {
  const isLayoutAppSelf = !!(window as any).__IS_LAYOUT_APP__;
  if (isLayoutAppSelf) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port || '';
    const isLayoutAppDomain = hostname === 'layout.bellis.com.cn' || 
                             (hostname === 'localhost' && (port === '4192' || port === '4188'));
    if (isLayoutAppDomain) {
      return true;
    }
  }
  const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
  if (isUsingLayoutApp) {
    return false;
  }
  return true;
};

const handleClose = () => {
  // 关键：检查是否应该处理抽屉关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

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

const handleClickOutside = (event: MouseEvent) => {
  // 关键：检查是否应该处理点击外部关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

  if (!props.visible) return;

  const drawer = document.querySelector('.menu-drawer');
  if (drawer && !drawer.contains(event.target as Node)) {
    handleClose();
  }
};

// 监听 iframe 内部点击（由 DocsIframe 转发）
const handleIframeClick = () => {
  // 关键：检查是否应该处理 iframe 点击关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

  if (props.visible) {
    handleClose();
  }
};

// 监听抽屉打开，重新加载应用列表（确保获取最新的域数据）
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 清除域列表缓存，确保获取最新数据
      const clearDomainCacheFn = (window as any).__APP_CLEAR_DOMAIN_CACHE__;
      if (clearDomainCacheFn && typeof clearDomainCacheFn === 'function') {
        clearDomainCacheFn();
      }
      // 重新加载应用列表
      loadApplications();
    }
  }
);

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
  
  // 关键：当通过 v-show 隐藏时，确保元素不可见且不占用空间
  // v-show="false" 会自动设置 display: none，这里只是确保样式正确
  &[style*="display: none"] {
    pointer-events: none;
  }

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
