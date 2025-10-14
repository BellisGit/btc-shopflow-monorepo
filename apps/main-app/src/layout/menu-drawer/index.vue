<template>
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-if="visible" class="menu-drawer">
        <div class="menu-drawer__header">
          <h3>{{ t('app_center.title') }}</h3>
          <span class="menu-drawer__subtitle">{{ t('app_center.subtitle') }}</span>
        </div>

        <div class="menu-drawer__content">
          <div class="app-list">
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
                  {{ t(`micro_app.${app.name}.title`) }}
                  <el-tag v-if="app.name === currentApp" size="small" type="success">
                    {{ t('app_center.current') }}
                  </el-tag>
                </div>
                <div class="app-card__description">
                  {{ t(`micro_app.${app.name}.description`) }}
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
import { Check, Right } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';

interface MicroApp {
  name: string;
  icon: string;
  color: string;
  entry: string;
  activeRule: string;
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

  // 监听路由变化
  window.addEventListener('popstate', detectCurrentApp);
});

onUnmounted(() => {
  window.removeEventListener('popstate', detectCurrentApp);
});

const applications = ref<MicroApp[]>([
  {
    name: 'main',
    icon: 'home',
    color: '#409eff',
    entry: '//localhost:8080',
    activeRule: '/', // 主应用首页
  },
  {
    name: 'logistics',
    icon: 'icon-map',
    color: '#67c23a',
    entry: '//localhost:8081',
    activeRule: '/logistics',
  },
  {
    name: 'engineering',
    icon: 'icon-design',
    color: '#e6a23c',
    entry: '//localhost:8082',
    activeRule: '/engineering',
  },
  {
    name: 'quality',
    icon: 'icon-approve',
    color: '#f56c6c',
    entry: '//localhost:8083',
    activeRule: '/quality',
  },
  {
    name: 'production',
    icon: 'icon-work',
    color: '#909399',
    entry: '//localhost:8084',
    activeRule: '/production',
  },
  {
    name: 'docs',
    icon: 'icon-tutorial',
    color: '#7c3aed',
    entry: '//localhost:8080/docs', // 通过主应用路由访问文档中心
    activeRule: '/docs', // 文档中心（iframe 嵌入）
  },
]);

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
