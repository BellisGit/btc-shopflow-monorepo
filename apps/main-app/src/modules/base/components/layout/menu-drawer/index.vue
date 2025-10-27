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

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Right, Loading } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { service } from '@/services/eps';

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

// 根据当前路由判断当前应用
const currentApp = ref('main');

// 加载状态
const loading = ref(false);

const detectCurrentApp = () => {
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
  } else {
    currentApp.value = 'main';
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

// 固定显示的应用配置（文档域始终显示，不受域列表影响）
const fixedApplications: MicroApp[] = [
  {
    name: 'docs',
    icon: 'icon-tutorial',
    color: '#7c3aed',
    entry: '//localhost:8080/docs',
    activeRule: '/docs',
    description: '文档中心 - 系统使用指南和API文档'
  },
];

// 域到应用的映射配置（不包括系统域和文档域）
const domainAppMapping: Record<string, Omit<MicroApp, 'name' | 'description'>> = {
  'LOGISTICS': {
    icon: 'icon-map',
    color: '#67c23a',
    entry: '//localhost:8081',
    activeRule: '/logistics',
  },
  'ENGINEERING': {
    icon: 'icon-design',
    color: '#e6a23c',
    entry: '//localhost:8082',
    activeRule: '/engineering',
  },
  'QUALITY': {
    icon: 'icon-approve',
    color: '#f56c6c',
    entry: '//localhost:8083',
    activeRule: '/quality',
  },
  'PRODUCTION': {
    icon: 'icon-work',
    color: '#909399',
    entry: '//localhost:8084',
    activeRule: '/production',
  },
};

const applications = ref<MicroApp[]>([]);

// 存储域数据映射
const domainDataMap = ref<Map<string, any>>(new Map());

// 获取域显示名称
const getDomainDisplayName = (app: MicroApp) => {
  // 固定应用使用国际化配置
  if (app.name === 'docs') {
    return t(`micro_app.${app.name}.title`);
  }

  // 系统域（主应用）使用域数据中的系统域名称
  if (app.name === 'main') {
    const systemDomain = Array.from(domainDataMap.value.values())
      .find((domain: any) => domain.domainCode === 'SYSTEM' || domain.name === '系统域');
    if (systemDomain && systemDomain.name) {
      return systemDomain.name;
    }
    return t(`micro_app.${app.name}.title`);
  }

  // 其他域使用对应的域名称
  const domain = domainDataMap.value.get(app.name.toUpperCase());
  if (domain && domain.name) {
    return domain.name;
  }

  // 兜底使用国际化配置
  return t(`micro_app.${app.name}.title`);
};

// 从域列表服务获取域信息，构建应用列表
const loadApplications = async () => {
  loading.value = true;
  try {
    // 调用域列表的 list 服务
    const response = await service.system?.iam?.sys.domain?.list({});

    if (response?.list) {

      // 创建完整的域映射表（包括所有域）
      const domainMap = new Map();
      response.list.forEach((domain: any) => {
        // 直接使用 domainCode，不做大小写转换
        const domainCode = domain.domainCode;
        if (domainCode) {
          domainMap.set(domainCode, domain);
        }
      });

      // 更新域数据映射（用于显示名称）
      domainDataMap.value = domainMap;

      // 构建应用列表
      const appList: MicroApp[] = [];

      // 1. 添加主应用（系统域）
      const systemDomain = Array.from(domainMap.values())
        .find((domain: any) => domain.domainCode === 'SYSTEM' || domain.name === '系统域');

      appList.push({
        name: 'main',
        icon: 'home',
        color: '#409eff',
        entry: '//localhost:8080',
        activeRule: '/',
        description: systemDomain ?
          (systemDomain.description || `${systemDomain.name} - 核心管理功能`) :
          '主应用 - 平台管理、组织架构、权限控制等核心功能'
      });

      // 2. 添加其他业务域应用（排除系统域和文档域）
      response.list
        .filter((domain: any) =>
          domain.domainCode !== 'SYSTEM' &&
          domain.name !== '系统域' &&
          domain.domainCode !== 'DOCS' &&
          domain.name !== '文档中心'
        )
        .forEach((domain: any) => {
          const domainCode = domain.domainCode;
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

      // 3. 添加固定应用（文档域）
      appList.push(...fixedApplications);

      applications.value = appList;
    } else {
      // 如果服务不可用，使用默认配置
      applications.value = [
        {
          name: 'main',
          icon: 'home',
          color: '#409eff',
          entry: '//localhost:8080',
          activeRule: '/',
          description: '主应用 - 平台管理、组织架构、权限控制等核心功能'
        },
        ...fixedApplications
      ];
      domainDataMap.value.clear();
    }
  } catch (error) {
    console.warn('获取域列表失败，使用默认应用配置:', error);
    // 服务不可用时，使用默认配置
    applications.value = [
      {
        name: 'main',
        icon: 'home',
        color: '#409eff',
        entry: '//localhost:8080',
        activeRule: '/',
        description: '主应用 - 平台管理、组织架构、权限控制等核心功能'
      },
      ...fixedApplications
    ];
    domainDataMap.value.clear();
  } finally {
    loading.value = false;
  }
};

const handleSwitchApp = (app: MicroApp) => {
  if (app.name === currentApp.value) {
    // 当前应用，不提示
    return;
  }

  // 关闭抽屉
  handleClose();

  // 确保使用绝对路径
  const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;

  // 使用主应用的 router.push，Qiankun 会自动卸载当前子应用并加载目标子应用
  router.push(targetPath).then(() => {
    detectCurrentApp();
  });
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
