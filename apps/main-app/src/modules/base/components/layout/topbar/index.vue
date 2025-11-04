<template>
  <div class="topbar" :class="{ 'is-dark-menu': isDarkMenuStyle }">
    <!-- 左侧：汉堡菜单 + Logo 区域（与侧边栏宽度一致） -->
      <div
        class="topbar__brand"
        :class="{
          'is-collapse': isCollapse && props.menuType !== 'top' && props.menuType !== 'dual-menu',
          'menu-type-top': props.menuType === 'top',
          'menu-type-dual-menu': props.menuType === 'dual-menu',
        }"
      >
      <!-- 汉堡菜单 -->
      <div
        class="topbar__hamburger"
        :class="{ 'is-active': drawerVisible }"
        @click.stop="$emit('toggle-drawer')"
        @mouseenter="$emit('open-drawer')"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>

      <!-- Logo + 标题（顶部菜单和双栏菜单模式下隐藏） -->
      <div
        v-if="props.menuType !== 'top' && props.menuType !== 'dual-menu'"
        class="topbar__logo-content"
        :class="{ 'is-dark-menu': isDarkMenuStyle }"
        :style="{
          backgroundColor: menuThemeConfig.background,
        }"
      >
        <img src="/logo.png" alt="BTC Logo" class="topbar__logo-img" />
        <h2
          class="topbar__logo-text"
          :style="{ color: menuThemeConfig.systemNameColor }"
        >{{ t('app.title') }}</h2>
      </div>
    </div>

    <!-- 中间：工具区域（折叠按钮 + 搜索框 + 顶部菜单） -->
    <div class="topbar__left">
      <!-- 折叠按钮（仅左侧菜单和混合菜单显示） -->
      <div
        v-if="props.menuType === 'left' || props.menuType === 'top-left'"
        class="btc-comm__icon"
        @click="$emit('toggle-sidebar')"
      >
        <btc-svg :name="isCollapse ? 'expand' : 'fold'" />
      </div>

      <!-- 全局搜索（移动端隐藏，且设置中启用，顶部菜单模式下也显示） -->
      <GlobalSearch v-if="!browser.isMini && showGlobalSearch" />

      <!-- 顶部菜单（仅顶部菜单模式显示，在搜索框右侧） -->
      <TopMenu v-if="props.menuType === 'top'" />

      <!-- 混合菜单顶部（仅混合菜单模式显示，在搜索框右侧） -->
      <TopLeftMenu v-if="props.menuType === 'top-left'" />
    </div>

    <div class="topbar__right">
      <!-- 工具栏 -->
      <ul class="topbar__tools">
        <!-- 动态插件工具栏组件（按order排序，根据移动端/桌面端过滤） -->
        <li v-for="toolbarConfig in filteredToolbarComponents" :key="toolbarConfig.order">
          <component :is="toolbarConfig.component" />
        </li>
      </ul>

      <!-- 用户信息 -->
      <el-dropdown
        class="topbar__user-dropdown"
        placement="bottom-end"
        popper-class="topbar__user-popper"
        @command="handleCommand"
      >
        <div class="topbar__user">
          <span class="topbar__user-name">{{ userInfo.name }}</span>
          <el-avatar :size="26" :src="userInfo.avatar" />
        </div>

        <template #dropdown>
          <div class="topbar__user-info">
            <el-avatar :size="50" :src="userInfo.avatar" />
            <div class="topbar__user-details">
              <el-text size="default" tag="p">{{ userInfo.name }}</el-text>
              <el-text size="small" type="info">{{ userInfo.email || t('common.no_email') }}</el-text>
            </div>
          </div>

          <el-dropdown-menu>
                   <el-dropdown-item command="profile">
                     <btc-svg name="my" :size="16" />
                     <span>{{ t('common.profile') }}</span>
                   </el-dropdown-item>
                   <el-dropdown-item command="settings">
                     <btc-svg name="set" :size="16" />
                     <span>{{ t('common.settings') }}</span>
                   </el-dropdown-item>
                   <el-dropdown-item divided command="logout">
                     <btc-svg name="exit" :size="16" />
                     <span>{{ t('common.logout') }}</span>
                   </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopbar'
});

import { ref, onMounted, markRaw, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { usePluginManager } from '@btc/shared-core';
import { useSettingsState, useSettingsConfig } from '@/plugins/user-setting/composables';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { useUser } from '@/composables/useUser';
import { useLogout } from '@/composables/useLogout';
import { useBrowser } from '@/composables/useBrowser';
import GlobalSearch from '../global-search/index.vue';
import TopMenu from '../top-menu/index.vue';
import TopLeftMenu from '../top-left-menu/index.vue';

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
  menuType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
  menuType: 'left',
});

defineEmits<{
  'toggle-sidebar': [];
  'toggle-drawer': [];
  'open-drawer': [];
}>();

const { t } = useI18n();
const router = useRouter();

// 浏览器信息
const { browser } = useBrowser();

// 获取设置状态
const { showGlobalSearch, menuThemeType, isDark } = useSettingsState();
const { menuStyleList } = useSettingsConfig();

// 判断是否为深色菜单风格（展示层逻辑）
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 获取当前菜单主题配置（类似 art-design-pro 的 getMenuTheme）
const menuThemeConfig = computed(() => {
  // 深色主题下强制使用深色菜单配置（展示层逻辑）
  if (isDark?.value === true) {
    return {
      background: 'var(--el-bg-color)',
      systemNameColor: '#BABBBD',
      rightLineColor: '#EDEEF0',
    };
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;
  const themeConfig = menuStyleList.value.find(item => item.theme === theme);

  if (themeConfig) {
    return {
      background: themeConfig.background,
      systemNameColor: themeConfig.systemNameColor,
      rightLineColor: themeConfig.rightLineColor,
    };
  }

  // 默认配置
  return {
    background: '#FFFFFF',
    systemNameColor: 'var(--el-text-color-primary)',
    rightLineColor: '#EDEEF0',
  };
});

// 插件管理器
const pluginManager = usePluginManager();

// 用户相关
const { userInfo: userInfoComputed, getUserInfo } = useUser();
const { logout } = useLogout();

// 动态工具栏组件
const toolbarComponents = ref<any[]>([]);

// 过滤后的工具栏组件（根据移动端/桌面端显示）
const filteredToolbarComponents = computed(() => {
  return toolbarComponents.value.filter(config => {
    // 与 cool-admin 完全一致的过滤逻辑
    if (browser.isMini) {
      // 移动端：使用 h5 属性，如果未定义则默认为 true
      // 注意：如果 h5 为 false，则隐藏；如果 h5 为 true 或 undefined，则显示
      const shouldShow = config.h5 ?? true;
      return shouldShow;
    } else {
      // 桌面端：使用 pc 属性，如果未定义则默认为 true
      // 注意：如果 pc 为 false，则隐藏；如果 pc 为 true 或 undefined，则显示
      const shouldShow = config.pc ?? true;
      return shouldShow;
    }
  });
});

// 用户信息（从 useUser 获取，提供默认值）
const userInfo = computed(() => {
  const info = userInfoComputed.value;
  if (info) {
    return {
      name: info.name || info.username || 'Admin',
      email: info.email || '',
      avatar: info.avatar || '/logo.png',
    };
  }
  // 如果没有用户信息，尝试从 localStorage 获取
  const stored = getUserInfo();
  if (stored) {
    return {
      name: stored.name || stored.username || 'Admin',
      email: stored.email || '',
      avatar: stored.avatar || '/logo.png',
    };
  }
  // 默认值
  return {
    name: 'Admin',
    email: 'admin@btc-saas.com',
    avatar: '/logo.png',
  };
});

// 初始化工具栏组件
onMounted(async () => {
  try {
    const toolbarConfigs = pluginManager.getToolbarComponents();

    for (const config of toolbarConfigs) {
      try {
        const component = await config.component();
        toolbarComponents.value.push({
          ...config,
          component: markRaw(component.default || component)
        });
      } catch (error) {
        console.error('Failed to load toolbar component:', error);
      }
    }
  } catch (error) {
    console.error('Failed to get toolbar components:', error);
  }
});

// 处理用户下拉菜单命令
const message = useMessage();

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      message.info(t('common.settings'));
      break;
    case 'logout':
      ElMessageBox.confirm(
        t('common.logout_confirm'),
        t('common.tip'),
        {
          type: 'warning',
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
        }
      )
      .then(() => {
        // 执行退出登录
        logout();
      })
      .catch(() => {
        // 取消操作，不需要任何处理
      });
      break;
  }
};
</script>

<style lang="scss" scoped>
.topbar {
  height: 47px;
  min-height: 47px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 10px 0 0; // 右侧 10px，左侧 0（让汉堡菜单贴边）
  box-sizing: border-box;
  flex-shrink: 0;

  // 品牌区域（汉堡菜单 + Logo，与侧边栏宽度一致）
  // 无论屏幕大小，都与侧边栏同步折叠和展开
  &__brand {
    display: flex;
    align-items: stretch;
    width: 255px; // 与侧边栏宽度一致
    height: 47px;
    border-right: 1px solid var(--el-border-color); // 右侧分隔线
    border-bottom: 1px solid var(--el-border-color-extra-light); // 底部分隔线（logo区域和搜索区域之间），与 tabbar 和面包屑保持一致
    position: relative;
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    // 与侧边栏同步折叠
    &.is-collapse {
      width: 64px; // 折叠时只显示汉堡菜单

      .topbar__logo-content {
        opacity: 0;
        visibility: hidden;
      }
    }

    // 顶部菜单模式：只显示汉堡菜单，隐藏logo和标题
    &.menu-type-top {
      width: 64px; // 只显示汉堡菜单

      .topbar__logo-content {
        display: none;
      }
    }

    // 双栏菜单模式：品牌区域宽度固定，隐藏 logo 和标题
    &.menu-type-dual-menu {
      width: 64px; // 与折叠菜单和双栏菜单左侧栏宽度一致

      .topbar__logo-content {
        display: none !important; // 完全隐藏 logo 和标题
      }
    }
  }

  // 汉堡菜单样式（主题色背景）
  &__hamburger {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 47px;
    cursor: pointer;
    flex-shrink: 0;
    gap: 5px;
    background-color: var(--el-color-primary); // 主题色背景
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: var(--el-color-primary-light-3); // 悬停时浅色主题色

      .hamburger-line {
        background-color: #fff;
      }
    }

    &:active {
      background-color: var(--el-color-primary-dark-2); // 按下时深色主题色
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background-color: #fff; // 白色线条
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    // 交叉状态（抽屉打开时）
    &.is-active {
      .hamburger-line {
        &:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        &:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        &:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }
  }

  // Logo 内容区域（填充剩余空间）
  &__logo-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    overflow: hidden;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  // 深色菜单风格下的 logo 文字颜色
  &__logo-content.is-dark-menu &__logo-text {
    color: #BABBBD;
  }

  // 左侧工具区（折叠按钮 + 搜索 + 顶部菜单）
  &__left {
    display: flex;
    align-items: center;
    gap: 5px; // 与 tabbar 的按钮间距保持一致
    padding-left: 10px; // 与品牌区域的间距（对应 tabbar 内容区的 padding-left）
    flex: 1; // 占据剩余空间，让顶部菜单可以展开
    overflow: hidden; // 防止溢出
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    user-select: none;
  }

  &__right {
    display: flex;
    align-items: center;
    margin-left: auto; // 自动靠右
  }

  &__tools {
    display: flex;
    margin-right: 10px;

    & > li {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      height: 45px;
      cursor: pointer;
      margin-left: 10px;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    padding: 5px 5px 5px 10px;
    border-radius: 6px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-right: 10px;
    }
  }
}
</style>

<style lang="scss">
// 用户下拉菜单样式（非 scoped）
.topbar__user-popper {
  .el-dropdown-menu__item {
    padding: 6px 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .topbar__user-info {
    display: flex;
    align-items: center;
    padding: 10px;
    width: 200px;
    border-bottom: 1px solid var(--el-color-info-light-9);

    .topbar__user-details {
      margin-left: 10px;
      flex: 1;
      font-size: 12px;

      p {
        margin: 0;
        font-weight: 500;
      }
    }
  }

  .btc-svg {
    margin-right: 8px;
    font-size: 16px;
  }
}
</style>

