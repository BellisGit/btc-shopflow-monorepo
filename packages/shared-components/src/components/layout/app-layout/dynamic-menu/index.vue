<template>
  <el-menu
    :key="menuKey"
    ref="menuRef"
    :active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="isCollapse"
    :collapse-transition="false"
    :unique-opened="uniqueOpened"
    :class="[menuThemeClass, 'sidebar__menu']"
    :text-color="menuThemeConfig.textColor"
    :active-text-color="menuThemeConfig.textActiveColor"
    @select="handleMenuSelect"
  >
    <!-- 使用配置文件动态渲染菜单 -->
    <MenuRenderer
      :menu-items="currentMenuItems"
      :search-keyword="searchKeyword"
      :is-collapse="isCollapse"
    />
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDynamicMenu',
});

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useSettingsState, useSettingsConfig } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { MenuThemeEnum } from '@btc/shared-components/components/others/btc-user-setting/config/enums';
import { useCurrentApp } from '@btc/shared-components/composables/useCurrentApp';
import { getMenusForApp, getMenuRegistry } from '@btc/shared-components/store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';

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
const { uniqueOpened, menuThemeType, isDark } = useSettingsState();
const { menuStyleList } = useSettingsConfig();

const activeMenu = ref(route.path);

// 菜单 ref
const menuRef = ref();
const menuKey = ref(0); // 用于强制重新渲染菜单

// 获取菜单注册表的响应式引用
// 关键：每次都从全局对象获取，确保使用最新的注册表实例
const getMenuRegistryRef = () => {
  if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
    return (window as any).__BTC_MENU_REGISTRY__;
  }
  return getMenuRegistry();
};

// 获取当前应用的菜单项（从注册表读取，响应式）
const currentMenuItems = computed(() => {
  const app = currentApp.value;
  // 关键：每次都从全局对象获取最新的注册表，确保使用正确的实例
  const menuRegistry = getMenuRegistryRef();

  // 确保注册表存在
  if (!menuRegistry) {
    if (import.meta.env.DEV) {
      console.warn('[DynamicMenu] 菜单注册表不存在');
    }
    return [];
  }

  // 直接访问 menuRegistry.value[app] 以确保响应式追踪
  // 这样当 menuRegistry.value[app] 变化时，computed 会自动重新计算
  const menus = menuRegistry.value[app] || [];

  // 如果菜单为空，尝试通过全局函数注册菜单（作为后备机制）
  if (menus.length === 0) {
    const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
    if (typeof registerMenusFn === 'function') {
      try {
        registerMenusFn(app);
        // 重新获取菜单（注册后可能已更新）
        const retryMenus = menuRegistry.value[app] || [];
        if (retryMenus.length > 0) {
          return retryMenus;
        }
      } catch (error) {
        // 静默失败
      }
    }
  }

  return menus;
});

// 菜单由 manifest 决定，是固定的，不需要监听变化重新渲染
// 只在应用切换时更新菜单（通过 currentMenuItems computed 自动响应）

// 监听 currentApp 的变化，确保应用切换时菜单也更新
watch(
  () => currentApp.value,
  (newApp, oldApp) => {
    if (newApp !== oldApp) {
      // 应用切换时，尝试注册新应用的菜单
      const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
      if (typeof registerMenusFn === 'function') {
        try {
          registerMenusFn(newApp);
        } catch (error) {
          // 静默失败
        }
      }
      // 强制重新渲染菜单
      menuKey.value++;
    }
  }
);

// 只监听当前应用的菜单变化，避免深度监听整个注册表导致的不必要重新渲染
// 关键：只在菜单数组引用真正变化时才更新 menuKey，避免路由变化时触发重绘
watch(
  () => {
    const app = currentApp.value;
    const menuRegistry = getMenuRegistryRef();
    const menus = menuRegistry?.value?.[app] || [];

    return menus;
  },
  (newMenus, oldMenus) => {
    // 如果数组引用相同，说明是同一个数组，不需要重新渲染
    if (newMenus === oldMenus) {
      return;
    }

    // 只有当菜单数组引用发生变化时才更新（菜单内容变化由 registerManifestMenusForApp 中的 menusEqual 检查）
    // 如果数组长度或内容相同但引用不同，说明是重复注册，不需要重新渲染
    if (newMenus.length !== (oldMenus?.length || 0)) {
      // 菜单数量变化，需要重新渲染
      menuKey.value++;
      return;
    }

    // 菜单数量相同，检查是否真的是内容变化（通过比较第一个和最后一个菜单项的引用）
    // 如果引用相同，说明是同一个数组，不需要重新渲染
    if (newMenus.length > 0 && oldMenus && oldMenus.length > 0) {
      const newFirst = newMenus[0];
      const oldFirst = oldMenus[0];
      const newLast = newMenus[newMenus.length - 1];
      const oldLast = oldMenus[oldMenus.length - 1];
      // 如果首尾项引用不同，说明是新的菜单数组，需要重新渲染
      if (newFirst !== oldFirst || newLast !== oldLast) {
        menuKey.value++;
      }
    } else if (newMenus.length === 0 && oldMenus && oldMenus.length > 0) {
      // 从有菜单变为无菜单，需要重新渲染
      menuKey.value++;
    } else if (newMenus.length > 0 && (!oldMenus || oldMenus.length === 0)) {
      // 从无菜单变为有菜单，需要重新渲染
      menuKey.value++;
    }
  }
);

// 组件挂载时检查菜单是否已注册
onMounted(() => {
  const checkAndRetryMenu = () => {
    const app = currentApp.value;
    const menuRegistry = getMenuRegistryRef();
    const menus = menuRegistry?.value?.[app] || [];

    if (menus.length === 0) {
      // 尝试通过全局函数注册菜单（如果存在）
      // 注意：菜单注册应该由应用启动时完成，这里只是作为后备
      const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
      if (typeof registerMenusFn === 'function') {
        try {
          registerMenusFn(app);
        } catch (error) {
          // 静默失败
        }
      }
      
      // 延迟检查，确保菜单已注册（最多重试 20 次，每次 100ms，总共 2 秒）
      let retryCount = 0;
      const maxRetries = 20;
      const checkInterval = setInterval(() => {
        retryCount++;
        const retryMenus = menuRegistry?.value?.[app] || [];
        if (retryMenus.length > 0) {
          clearInterval(checkInterval);
          menuKey.value++; // 强制重新渲染
        } else if (retryCount >= maxRetries) {
          clearInterval(checkInterval);
        }
      }, 100);
    } else {
      // 菜单已存在，确保 menuKey 已更新
      menuKey.value++;
    }
  };
  
  // 立即检查一次
  checkAndRetryMenu();
  
  // 延迟检查，确保菜单注册完成（菜单注册可能在组件挂载之后）
  setTimeout(checkAndRetryMenu, 200);
  setTimeout(checkAndRetryMenu, 500);
  setTimeout(checkAndRetryMenu, 1000);
});

// 递归获取所有菜单项的 index（用于搜索匹配）
const getAllMenuIndexes = (items: any[]): string[] => {
  const indexes: string[] = [];

  items.forEach(item => {
    if (item.index) {
      indexes.push(item.index);
    }
    if (item.children && item.children.length > 0) {
      indexes.push(...getAllMenuIndexes(item.children));
    }
  });

  return indexes;
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

    // 递归查找匹配的菜单项并展开其父级
    const findMatchingParents = (items: any[], parents: string[] = []): string[] => {
      const openeds: string[] = [];

      items.forEach(item => {
        const currentParents = [...parents, item.index];

        // 检查当前菜单项是否匹配
        const currentMatch = t(item.title).toLowerCase().includes(keyword);

        if (currentMatch) {
          // 如果当前项匹配，展开所有父级
          openeds.push(...parents);
        }

        // 递归检查子菜单
        if (item.children && item.children.length > 0) {
          const childMatch = findMatchingParents(item.children, currentParents);
          if (childMatch.length > 0) {
            // 如果子菜单有匹配项，展开当前项
            openeds.push(item.index);
            openeds.push(...childMatch);
          }
        }
      });

      return openeds;
    };

    return [...new Set(findMatchingParents(currentMenuItems.value))];
  }

  // 无搜索时的默认展开
  switch (currentApp.value) {
    case 'main':
      return ['platform', 'org', 'access', 'navigation', 'ops', 'test-features'];
    default:
      return [];
  }
});

// 菜单主题类 - 实现类似 art-design-pro 的展示层逻辑
// 深色主题下强制显示深色菜单风格，但不修改 menuThemeType 的值
const menuThemeClass = computed(() => {
  // 深色主题下强制显示深色菜单风格（展示层逻辑）
  if (isDark?.value === true) {
    return 'el-menu-dark';
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的类名
  const theme = menuThemeType?.value;
  if (!theme) {
    return 'el-menu-design';
  }

  // 直接比较枚举值，确保只返回一个类名
  switch (theme) {
    case MenuThemeEnum.DARK:
      return 'el-menu-dark';
    case MenuThemeEnum.LIGHT:
      return 'el-menu-light';
    case MenuThemeEnum.DESIGN:
    default:
      return 'el-menu-design';
  }
});

// 菜单主题配置 - 类似 art-design-pro 的 getMenuTheme
const menuThemeConfig = computed(() => {
  // 深色系统主题下，菜单背景必须和内容区域一致（都使用 var(--el-bg-color)）
  if (isDark?.value === true) {
    // 深色系统主题下，菜单使用与内容区域一致的深色背景
    return {
      background: 'var(--el-bg-color)',
      textColor: '#FFFFFF',
      textActiveColor: '#FFFFFF',
    };
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;
  const themeConfig = menuStyleList.value.find(item => item.theme === theme);

  if (themeConfig) {
    return {
      background: themeConfig.background,
      textColor: themeConfig.textColor,
      textActiveColor: themeConfig.textActiveColor,
    };
  }

  // 默认配置
  return {
    background: '#FFFFFF',
    textColor: '#29343D',
    textActiveColor: '#3F8CFF',
  };
});

// 监听菜单主题和系统主题变化，强制重新渲染菜单
watch(
  () => [menuThemeType?.value, isDark?.value],
  () => {
    menuKey.value++;
  }
);

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

const isExternalLink = (value: string) => /^(https?:|mailto:|tel:)/.test(value);

const linkHandler = (index: string) => {
  if (!index) return false;

  if (isExternalLink(index)) {
    window.open(index, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
};

const handleMenuSelect = (index: string) => {
    // 动态菜单跳转处理
    if (!index) return;

    if (!currentApp.value) {
      throw new Error('动态菜单未找到所属应用');
    }

    // 如果点击的是外链，直接打开新窗口
    if (linkHandler(index)) {
      return;
    }

    // 关键：检查 index 是否为分组节点（只有 children 没有实际路由的节点）
    // 分组节点的 index 通常是虚拟路径（如 "access-config"），在路由表中不存在
    // 判断方法：在当前菜单树中查找匹配的菜单项，如果它有 children，说明是分组节点，不应该导航
    const absolutePath = index.startsWith('/') ? index : `/${index}`;

    // 递归查找菜单项
    const findMenuItem = (items: typeof currentMenuItems.value, targetIndex: string): typeof items[0] | null => {
      for (const item of items) {
        // 检查 index 是否匹配（支持带/和不带/的格式）
        if (item.index === targetIndex || item.index === absolutePath) {
          return item;
        }
        // 递归检查子菜单
        if (item.children && item.children.length > 0) {
          const found = findMenuItem(item.children, targetIndex);
          if (found) return found;
        }
      }
      return null;
    };

    const matchedItem = findMenuItem(currentMenuItems.value, index);

    // 如果找到的菜单项有 children，说明是分组节点，不应该导航
    if (matchedItem && matchedItem.children && matchedItem.children.length > 0) {
      if (import.meta.env.DEV) {
        console.log('[dynamic-menu] 跳过分组节点导航:', index, matchedItem);
      }
      return;
    }

    // 菜单路径已经在加载时被规范化了（manifest 中没有前缀，开发环境会自动添加，生产环境保持原样）
    // 所以这里直接使用 index，不需要再次规范化
    // 使用 catch 捕获路由跳转错误，避免未匹配路由时导致的问题
    router.push(absolutePath).catch((err) => {
      // 路由跳转失败（通常是路由未匹配），记录错误但不抛出
      // 这通常发生在点击分组节点时，虽然我们已经过滤了，但作为兜底处理
      if (import.meta.env.DEV) {
        console.warn('[dynamic-menu] 路由跳转失败:', absolutePath, err);
      }
    });
};
</script>

<style lang="scss" scoped>
.sidebar__menu {
  // 只保留基础布局样式，菜单风格样式已移至全局样式文件
  flex: 1;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
