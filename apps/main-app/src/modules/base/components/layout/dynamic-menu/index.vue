<template>
  <el-menu
    :key="menuKey"
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="isCollapse"
    :collapse-transition="false"
    class="sidebar__menu"
    @select="handleMenuSelect"
  >
    <!-- 物流应用菜单 -->
    <template v-if="currentApp === 'logistics'">
      <el-menu-item index="/logistics">
        <el-icon><House /></el-icon>
        <span>{{ t('menu.logistics.overview') }}</span>
      </el-menu-item>
    </template>

    <!-- 工程应用菜单 -->
    <template v-else-if="currentApp === 'engineering'">
      <el-menu-item index="/engineering">
        <el-icon><House /></el-icon>
        <span>{{ t('menu.engineering.overview') }}</span>
      </el-menu-item>
    </template>

    <!-- 品质应用菜单 -->
    <template v-else-if="currentApp === 'quality'">
      <el-menu-item index="/quality">
        <el-icon><House /></el-icon>
        <span>{{ t('menu.quality.overview') }}</span>
      </el-menu-item>
    </template>

    <!-- 生产应用菜单 -->
    <template v-else-if="currentApp === 'production'">
      <el-menu-item index="/production">
        <el-icon><House /></el-icon>
        <span>{{ t('menu.production.overview') }}</span>
      </el-menu-item>
    </template>

    <!-- 主应用菜单（默认） -->
    <template v-else>
      <!-- 平台治理 -->
      <el-sub-menu
        v-show="hasVisibleChildren(menuStructure.main.platform.children)"
        index="platform"
      >
        <template #title>
          <el-icon><Coin /></el-icon>
          <span>{{ t('menu.platform') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.platform.domains')" index="/platform/domains">
          <el-icon><Location /></el-icon>
          <span>{{ t('menu.platform.domains') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.platform.modules')" index="/platform/modules">
          <el-icon><Files /></el-icon>
          <span>{{ t('menu.platform.modules') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.platform.plugins')" index="/platform/plugins">
          <el-icon><Connection /></el-icon>
          <span>{{ t('menu.platform.plugins') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 组织与账号 -->
      <el-sub-menu v-show="hasVisibleChildren(menuStructure.main.org.children)" index="org">
        <template #title>
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ t('menu.org') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.org.tenants')" index="/org/tenants">
          <el-icon><School /></el-icon>
          <span>{{ t('menu.org.tenants') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.org.departments')" index="/org/departments">
          <el-icon><Postcard /></el-icon>
          <span>{{ t('menu.org.departments') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.org.users')" index="/org/users">
          <el-icon><User /></el-icon>
          <span>{{ t('menu.org.users') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 访问控制 -->
      <el-sub-menu v-show="hasVisibleChildren(menuStructure.main.access.children)" index="access">
        <template #title>
          <el-icon><Lock /></el-icon>
          <span>{{ t('menu.access') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.access.resources')" index="/access/resources">
          <el-icon><FolderOpened /></el-icon>
          <span>{{ t('menu.access.resources') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.access.actions')" index="/access/actions">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ t('menu.access.actions') }}</span>
        </el-menu-item>
        <el-menu-item
          v-show="isMenuItemVisible('menu.access.permissions')"
          index="/access/permissions"
        >
          <el-icon><Key /></el-icon>
          <span>{{ t('menu.access.permissions') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.access.roles')" index="/access/roles">
          <el-icon><UserFilled /></el-icon>
          <span>{{ t('menu.access.roles') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.access.policies')" index="/access/policies">
          <el-icon><Document /></el-icon>
          <span>{{ t('menu.access.policies') }}</span>
        </el-menu-item>
        <el-menu-item
          v-show="isMenuItemVisible('menu.access.perm_compose')"
          index="/access/perm-compose"
        >
          <el-icon><Grid /></el-icon>
          <span>{{ t('menu.access.perm_compose') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 导航与可见性 -->
      <el-sub-menu
        v-show="hasVisibleChildren(menuStructure.main.navigation.children)"
        index="navigation"
      >
        <template #title>
          <el-icon><Menu /></el-icon>
          <span>{{ t('menu.navigation') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.navigation.menus')" index="/navigation/menus">
          <el-icon><List /></el-icon>
          <span>{{ t('menu.navigation.menus') }}</span>
        </el-menu-item>
        <el-menu-item
          v-show="isMenuItemVisible('menu.navigation.menu_preview')"
          index="/navigation/menus/preview"
        >
          <el-icon><View /></el-icon>
          <span>{{ t('menu.navigation.menu_preview') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 运维与审计 -->
      <el-sub-menu v-show="hasVisibleChildren(menuStructure.main.ops.children)" index="ops">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>{{ t('menu.ops') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.ops.audit')" index="/ops/audit">
          <el-icon><DocumentCopy /></el-icon>
          <span>{{ t('menu.ops.audit') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.ops.baseline')" index="/ops/baseline">
          <el-icon><Histogram /></el-icon>
          <span>{{ t('menu.ops.baseline') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.ops.simulator')" index="/ops/simulator">
          <el-icon><Odometer /></el-icon>
          <span>{{ t('menu.ops.simulator') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu
        v-show="hasVisibleChildren(menuStructure.main['test-features'].children)"
        index="test-features"
      >
        <template #title>
          <el-icon><Coin /></el-icon>
          <span>{{ t('menu.test_features') }}</span>
        </template>
        <el-menu-item v-show="isMenuItemVisible('menu.test_features.crud')" index="/test/crud">
          <el-icon><Tickets /></el-icon>
          <span>{{ t('menu.test_features.crud') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.test_features.svg')" index="/test/svg-plugin">
          <el-icon><Picture /></el-icon>
          <span>{{ t('menu.test_features.svg') }}</span>
        </el-menu-item>
        <el-menu-item v-show="isMenuItemVisible('menu.test_features.i18n')" index="/test/i18n">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ t('menu.test_features.i18n') }}</span>
        </el-menu-item>
        <el-menu-item
          v-show="isMenuItemVisible('menu.test_features.select_button')"
          index="/test/select-button"
        >
          <el-icon><Coin /></el-icon>
          <span>{{ t('menu.test_features.select_button') }}</span>
        </el-menu-item>
        <el-menu-item
          v-show="isMenuItemVisible('menu.test_features.message_notification')"
          index="/test/message-notification"
        >
          <el-icon><Message /></el-icon>
          <span>{{ t('menu.test_features.message_notification') }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 文档中心已移至汉堡菜单 -->
    </template>
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDynamicMenu',
});

import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useCurrentApp } from '@/composables/useCurrentApp';
import {
  Lock,
  Location,
  Connection,
  Files,
  User,
  OfficeBuilding,
  Menu,
  TrendCharts,
  UserFilled,
  FolderOpened,
  Postcard,
  Coin,
  School,
  Key,
  List,
  Monitor,
  DocumentCopy,
  Histogram,
  Odometer,
  Document,
  Tickets,
  ChatDotRound,
  Picture,
  House,
  Grid,
  View,
  Reading as _Reading,
  Bell as _Bell,
  Message,
} from '@element-plus/icons-vue';

interface Props {
  isCollapse?: boolean;
  searchKeyword?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  searchKeyword: '',
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();

const activeMenu = ref(route.path);

// 菜单 ref
const menuRef = ref();
const menuKey = ref(0); // 用于强制重新渲染菜单

// 判断菜单项是否匹配搜索关键词
const isMenuItemVisible = (i18nKey: string) => {
  if (!props.searchKeyword) return true;
  const keyword = props.searchKeyword.toLowerCase().trim();
  if (!keyword) return true;

  // 获取翻译后的文本进行匹配
  const translatedText = t(i18nKey);
  return translatedText.toLowerCase().includes(keyword);
};

// 判断子菜单是否有可见的子项（递归检查）
const hasVisibleChildren = (children: Record<string, any>) => {
  if (!props.searchKeyword) return true;
  const keyword = props.searchKeyword.toLowerCase().trim();
  if (!keyword) return true;

  return Object.values(children).some((child: any) => {
    if (typeof child === 'string') {
      return child.toLowerCase().includes(keyword);
    } else if (child.children) {
      return Object.values(child.children).some(
        (grandChild: any) =>
          typeof grandChild === 'string' && grandChild.toLowerCase().includes(keyword)
      );
    }
    return false;
  });
};

// 菜单结构定义（用于搜索匹配）
const menuStructure = {
  main: {
    platform: {
      text: '平台治理',
      children: {
        '/platform/domains': '域列表',
        '/platform/modules': '模块列表',
        '/platform/plugins': '插件列表',
      },
    },
    org: {
      text: '组织与账号',
      children: {
        '/org/tenants': '租户列表',
        '/org/departments': '部门列表',
        '/org/users': '用户列表',
      },
    },
    access: {
      text: '访问控制',
      children: {
        '/access/resources': '资源列表',
        '/access/actions': '操作列表',
        '/access/permissions': '权限列表',
        '/access/roles': '角色列表',
        '/access/policies': '策略列表',
        '/access/perm-compose': '权限组合',
      },
    },
    navigation: {
      text: '导航与可见性',
      children: {
        '/navigation/menus': '菜单列表',
        '/navigation/menus/preview': '菜单预览',
      },
    },
    ops: {
      text: '运维与审计',
      children: {
        '/ops/audit': '操作日志',
        '/ops/baseline': '权限基线',
        '/ops/simulator': '策略模拟器',
      },
    },
    'test-features': {
      text: '测试功能',
      children: {
        '/test/crud': 'CRUD测试',
        '/test/svg-plugin': 'SVG插件测试',
        '/test/i18n': '国际化测试',
        '/test/select-button': '选择按钮测试',
        '/test/message-notification': '消息通知测试',
      },
    },
    // 文档中心已移至汉堡菜单
  },
};

const defaultOpeneds = computed(() => {
  if (props.isCollapse) return [];

  // 如果有搜索关键词，根据匹配结果精确展开菜单
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      // 空搜索，恢复默认展开
      return currentApp.value === 'main'
        ? ['platform', 'org', 'access', 'navigation', 'ops', 'test-features']
        : [];
    }

    const openeds: string[] = [];

    if (currentApp.value === 'main') {
      const structure = menuStructure.main;

      // 遍历菜单结构，查找匹配项
      Object.entries(structure).forEach(([key1, level1]) => {
        const children1 = level1.children || {};

        Object.entries(children1).forEach(([key2, level2]: [string, any]) => {
          if (typeof level2 === 'string') {
            // 二级菜单项
            if (level2.toLowerCase().includes(keyword)) {
              openeds.push(key1);
            }
          } else if (level2.children) {
            // 三级菜单
            Object.entries(level2.children).forEach(([, text]: [string, any]) => {
              if (typeof text === 'string' && text.toLowerCase().includes(keyword)) {
                openeds.push(key1, key2);
              }
            });
          }
        });
      });
    }

    return [...new Set(openeds)];
  }

  // 无搜索时的默认展开
  switch (currentApp.value) {
    case 'main':
      return ['system', 'system-permission', 'vite-plugins', 'components', 'i18n']; // 修正：使用正确的 index
    default:
      return [];
  }
});

// 监听搜索关键词变化，强制重新渲染菜单以应用新的 defaultOpeneds
watch(
  () => props.searchKeyword,
  () => {
    menuKey.value++;
  }
);

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

const handleMenuSelect = (index: string) => {
  // 确保使用绝对路径，避免相对路径拼接
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.sidebar__menu {
  $slider-menu-height: 50px;

  flex: 1;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--el-bg-color) !important;

  :deep(.el-sub-menu__title) {
    height: $slider-menu-height;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    // 移除一级菜单的激活样式
    &.is-active {
      background-color: transparent;
    }
  }

  :deep(.el-menu-item) {
    height: $slider-menu-height;
    font-size: 14px;
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      background-color: var(--el-color-primary) !important;
      color: #fff !important;
    }
  }

  :deep(.el-sub-menu__icon-arrow) {
    color: var(--el-text-color-secondary);
  }

  :deep(.el-icon) {
    transition: margin 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    margin-right: 16px; // 图标和文字间距 16px（与 cool-admin 一致）
  }

  :deep(span) {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition:
      max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 200px;
    opacity: 1;
    font-size: 14px; // 文字大小 14px
    letter-spacing: 0.05em; // 字间距
  }

  &.el-menu--collapse {
    width: 64px;

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
      justify-content: center;
      padding-left: 0 !important;
      padding-right: 0 !important;

      .el-icon {
        margin-right: 0 !important;
      }

      span {
        max-width: 0 !important;
        opacity: 0 !important;
      }
    }

    :deep(.el-sub-menu) {
      text-align: center;
    }
  }
}
</style>
