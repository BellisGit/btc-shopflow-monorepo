<template>
  <div class="grid-wrapper-v2 overview">
    <div class="overview__area">
      <div class="overview__left-grid">
        <!-- 工具栏：视图切换（左上角） -->
        <div class="overview__toolbar">
          <el-radio-group v-model="viewMode">
            <el-radio-button value="card">
              <el-icon><Grid /></el-icon>
              <span>{{ t('overview.cardView') }}</span>
            </el-radio-button>
            <el-radio-button value="list">
              <el-icon><List /></el-icon>
              <span>{{ t('overview.listView') }}</span>
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 最近访问 -->
        <div v-if="recentItems.length > 0" class="overview__visit-card">
          <div class="overview__visit-title">{{ t('overview.recentAccess') }}</div>
          <div class="overview__visit-items">
            <div
              v-for="item in recentItems"
              :key="item.path"
              class="overview__visit-item"
              @click="handleRecentAccessClick(item)"
            >
              {{ getRecentAccessLabel(item as any) }}
            </div>
          </div>
        </div>

        <!-- 卡片视图：按应用分组（恢复之前的样式） -->
        <div v-if="viewMode === 'card'" class="overview__resource">
          <div
            v-for="app in appDataList"
            :key="app.appId"
            class="overview__app-card"
          >
            <!-- 应用标题（可点击，作为父级卡片标题） -->
            <div class="overview__app-title" @click="handleAppClick(app)">
              <btc-svg
                v-if="getAppIcon(app.appId)"
                :name="getAppIcon(app.appId)!"
                :size="18"
                class="overview__app-icon"
              />
              {{ getAppDisplayName(app) }}
            </div>
            <!-- 一级菜单子卡片（水平排列，数量取决于一级菜单数量） -->
            <div class="overview__menu-cards">
              <div
                v-for="menu in filteredMenus(app.menus)"
                :key="menu.index"
                class="overview__menu-card"
              >
                <!-- 一级菜单标题（可点击，作为子卡片标题） -->
                <div class="overview__menu-card-title" @click="handleMenuClick(app, menu)">
                  {{ getMenuLabelReactive(menu) }}
                </div>
                <!-- 二级菜单（水平排列在子卡片内容区域） -->
                <div v-if="menu.children && menu.children.length > 0" class="overview__menu-card-content">
                  <div
                    v-for="subMenu in menu.children"
                    :key="subMenu.index"
                    class="overview__sub-menu-item"
                    @click.stop="handleSubMenuClick(app, menu, subMenu)"
                  >
                    {{ getMenuLabelReactive(subMenu) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="overview__table">
          <el-table :data="tableData">
            <el-table-column :label="t('overview.appName')" prop="appName" width="200" />
            <el-table-column :label="t('overview.menuName')" prop="menuName" />
            <el-table-column :label="t('overview.path')" prop="path" width="300" />
            <el-table-column :label="t('overview.actions')" width="120">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="handleTableRowClick(row)"
                >
                  {{ t('overview.viewAll') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OverviewPage',
});

import { computed, ref, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import {
  Grid,
  List,
} from '@element-plus/icons-vue';
import { useRecentAccessStore } from '@/store/recentAccess';
import { BtcSvg } from '@btc/shared-components';
import {
  getAllAppData,
  getAppDisplayName,
  getMenuLabel,
  buildMenuPath,
  type AppDataItem,
  type MenuItem,
} from '../utils/appData';
import { tSync } from '@/i18n/getters';
import { getAppIdFromPath, getAppById } from '@btc/shared-core';
// 不再使用菜单聚合服务，恢复原有的应用卡片样式
// import { useMenuAggregation, type OverviewMenuCategory, type OverviewMenuModule, type OverviewMenuItem } from '../composables/useMenuAggregation';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const recentAccessStore = useRecentAccessStore();

const viewMode = ref<'card' | 'list'>('card');
const currentPath = computed(() => route?.path || '');

// 预加载所有子应用的国际化数据（用于概览页面显示所有应用信息）
onBeforeMount(async () => {
  try {
    const { preloadAllSubAppsI18n } = await import('@/i18n/subapp-i18n-manager');
    const { i18n } = await import('@/i18n');
    await preloadAllSubAppsI18n(i18n);
  } catch (error) {
    console.warn('[Overview] Failed to preload all sub-apps i18n:', error);
  }
});

// 保留原有的 appDataList 用于列表视图和兼容性
const appDataList = computed(() => {
  const allApps = getAllAppData();
  // 将 system app 放在最前面，其他应用保持原有顺序
  const systemApp = allApps.find(app => app.appId === 'system');
  const otherApps = allApps.filter(app => app.appId !== 'system');
  
  return systemApp ? [systemApp, ...otherApps] : allApps;
});

// 应用图标映射（与汉堡菜单保持一致）
const appIconMap: Record<string, string> = {
  'system': 'user',
  'logistics': 'map',
  'engineering': 'design',
  'quality': 'approve',
  'production': 'work',
  'finance': 'amount-alt',
  'dashboard': 'trend',
  'personnel': 'team',
  'docs': 'document',
};

// 获取应用图标
function getAppIcon(appId: string): string | undefined {
  return appIconMap[appId];
}

// 过滤没有二级菜单的一级菜单卡片
function filteredMenus(menus: MenuItem[]): MenuItem[] {
  return menus.filter(menu => menu.children && menu.children.length > 0);
}

// 响应式获取菜单标签（使用响应式的 t() 函数，确保国际化数据加载后能自动更新）
function getMenuLabelReactive(menu: MenuItem): string {
  if (menu.labelKey) {
    // 使用响应式的 t() 函数，确保国际化数据加载后能自动更新
    const translated = t(menu.labelKey);
    // 如果翻译成功（返回值不是 key），使用翻译结果
    if (translated && translated !== menu.labelKey) {
      return translated;
    }
  }
  // 如果有 label，优先使用 label
  if (menu.label) {
    return menu.label;
  }
  // 最后回退到 index，但如果是路径格式，提取最后一部分
  if (menu.index.startsWith('/')) {
    const parts = menu.index.split('/').filter(Boolean);
    return parts[parts.length - 1] || menu.index;
  }
  return menu.index;
}

// 获取最近访问项的显示标签
function getRecentAccessLabel(item: { 
  labelKey?: string; 
  label?: string; 
  path?: string;
  appId?: string;
  appName?: string;
}): string {
  // 确保有 appId（从 path 推断）
  let appId = item.appId;
  if (!appId && item.path) {
    appId = getAppIdFromPath(item.path);
  }
  
  let displayLabel = '';
  
  // 1. 优先使用 labelKey 进行国际化翻译
  if (item.labelKey) {
    // 先尝试使用响应式的 t() 函数
    let translated = t(item.labelKey);
    // 如果翻译失败（返回值是 key），尝试使用 tSync
    if (translated === item.labelKey) {
      translated = tSync(item.labelKey);
    }
    // 如果翻译成功（返回值不是 key），使用翻译结果
    if (translated && translated !== item.labelKey) {
      displayLabel = translated;
    }
  }
  
  // 2. 如果翻译失败，使用 label
  if (!displayLabel && item.label) {
    displayLabel = item.label;
  }
  
  // 3. 如果还是没有，从 path 提取最后一部分（但如果是首页路径，不提取）
  if (!displayLabel && item.path) {
    const parts = item.path.split('/').filter(Boolean);
    displayLabel = parts[parts.length - 1] || item.path;
  }
  
  // 4. 检查是否是"首页"（通过 label、labelKey 或路径判断）
  const homeLabel = t('menu.home') || '首页';
  const normalizedPath = item.path?.replace(/\/+$/, '') || '';
  
  // 判断是否是首页路径
  const isHomePagePath = 
    normalizedPath === '/' ||
    (appId && normalizedPath === `/${appId}`) ||
    (appId && normalizedPath === `/${appId}/`);
  
  // 判断是否是首页标签
  const isHomePageLabel = 
    displayLabel === '首页' || 
    displayLabel === 'Home' ||
    displayLabel === homeLabel ||
    (item.labelKey && (
      item.labelKey.includes('home') || 
      item.labelKey.includes('Home') ||
      item.labelKey === 'menu.home'
    ));
  
  const isHomePage = isHomePagePath || isHomePageLabel;
  
  // 5. 如果是首页，显示"应用名 - 首页"
  if (isHomePage && appId) {
    // 获取应用显示名称
    let appDisplayName = item.appName;
    
    // 如果 appName 不存在或就是 appId，尝试获取显示名称
    if (!appDisplayName || appDisplayName === appId) {
      // 尝试从所有应用数据中查找
      const allApps = getAllAppData();
      const appData = allApps.find(app => app.appId === appId);
      if (appData) {
        appDisplayName = getAppDisplayName(appData);
      } else {
        // 如果找不到，尝试从 app-scanner 获取
        const appConfig = getAppById(appId);
        if (appConfig?.name) {
          appDisplayName = appConfig.name;
        } else {
          // 使用 domain.type.{appId} 翻译
          const domainTypeKey = `domain.type.${appId}`;
          const translated = tSync(domainTypeKey);
          if (translated && translated !== domainTypeKey) {
            appDisplayName = translated;
          } else {
            appDisplayName = appId;
          }
        }
      }
    }
    
    // 如果是首页，强制使用"首页"而不是路径
    const finalHomeLabel = isHomePageLabel ? displayLabel : homeLabel;
    if (appDisplayName && appDisplayName !== appId) {
      return `${appDisplayName} - ${finalHomeLabel}`;
    } else if (appDisplayName) {
      return `${appDisplayName} - ${finalHomeLabel}`;
    }
  }
  
  // 6. 如果翻译失败且显示的是路径，尝试从路径提取更好的显示名称
  if (!displayLabel || displayLabel.startsWith('/') || displayLabel === item.path) {
    if (item.path) {
      const parts = item.path.split('/').filter(Boolean);
      if (parts.length > 0) {
        // 使用最后一部分，但如果是单个部分且等于 appId，尝试使用更好的名称
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart !== appId) {
          displayLabel = lastPart;
        }
      }
    }
  }
  
  return displayLabel || item.path || '';
}

// 最近访问列表（最多显示 8 个）
const recentItems = computed(() => {
  return recentAccessStore.getRecentItems(8);
});

// 表格数据（列表视图使用）
const tableData = computed(() => {
  const data: Array<{
    appId: string;
    appName: string;
    menuName: string;
    path: string;
    appData: AppDataItem;
    menu: MenuItem;
  }> = [];

  appDataList.value.forEach((app) => {
    app.menus.forEach((menu) => {
      data.push({
        appId: app.appId,
        appName: getAppDisplayName(app),
        menuName: getMenuLabelReactive(menu),
        path: buildMenuPath(app, menu),
        appData: app,
        menu,
      });
    });
  });

  return data;
});

// 处理应用点击
function handleAppClick(app: AppDataItem) {
  // 跳转到应用的第一个菜单（过滤后的菜单）
  const filtered = filteredMenus(app.menus);
  const firstMenu = filtered[0];
  if (firstMenu) {
    handleMenuClick(app, firstMenu);
  }
}

// 处理菜单点击
function handleMenuClick(app: AppDataItem, menu: MenuItem) {
  const path = buildMenuPath(app, menu);

  // 记录最近访问
  recentAccessStore.addAccess({
    appId: app.appId,
    appName: getAppDisplayName(app),
    path,
    label: getMenuLabelReactive(menu),
    ...(menu.labelKey && { labelKey: menu.labelKey }),
    ...(menu.icon && { icon: menu.icon }),
  });

  // 跳转到对应路径
  router.push(path);
}

// 构建二级菜单路径
function buildSubMenuPath(app: AppDataItem, parentMenu: MenuItem, subMenu: MenuItem): string {
  const parentPath = buildMenuPath(app, parentMenu);

  // 如果子菜单有 path，直接使用
  if (subMenu.path) {
    if (subMenu.path.startsWith('/')) {
      // 如果 basePath 是 /，则直接使用 path
      if (app.basePath === '/') {
        return subMenu.path;
      }
      return `${app.basePath}${subMenu.path}`;
    }
    return `${parentPath}/${subMenu.path}`;
  }

  // 如果 index 是路径格式（以 / 开头），使用 index 作为路径
  if (subMenu.index.startsWith('/')) {
    if (app.basePath === '/') {
      return subMenu.index;
    }
    return `${app.basePath}${subMenu.index}`;
  }

  // 否则使用 index 作为路径的一部分，相对于父菜单路径
  return `${parentPath}/${subMenu.index}`;
}

// 处理二级菜单点击
function handleSubMenuClick(app: AppDataItem, parentMenu: MenuItem, subMenu: MenuItem) {
  const path = buildSubMenuPath(app, parentMenu, subMenu);

  // 记录最近访问
  recentAccessStore.addAccess({
    appId: app.appId,
    appName: getAppDisplayName(app),
    path,
    label: getMenuLabelReactive(subMenu),
    ...(subMenu.labelKey && { labelKey: subMenu.labelKey }),
    ...(subMenu.icon && { icon: subMenu.icon }),
  });

  // 跳转
  router.push(path);
}

// 处理表格行点击
function handleTableRowClick(row: {
  appData: AppDataItem;
  menu: MenuItem;
  path: string;
}) {
  handleMenuClick(row.appData, row.menu);
}

// 处理最近访问点击
function handleRecentAccessClick(item: {
  path: string;
  label: string;
  appId: string;
  appName: string;
}) {
  // 记录最近访问（更新时间戳）
  recentAccessStore.addAccess({
    appId: item.appId,
    appName: item.appName,
    path: item.path,
    label: item.label,
  });

  // 跳转
  router.push(item.path);
}

// 已移除阿里云风格的菜单处理函数，恢复使用原有的应用卡片样式
</script>

<style lang="scss" scoped>
.grid-wrapper-v2.overview {
  width: 100%;
  max-width: 100%;
  background-color: #0a0a0a; // 统一使用深色背景，与其他应用保持一致
  min-height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.overview__area {
  width: 100%;
}

.overview__left-grid {
  width: 100%;
}

// 工具栏（左上角）
.overview__toolbar {
  margin-bottom: 10px;
}

// 最近访问卡片
.overview__visit-card {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.overview__visit-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.overview__visit-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.overview__visit-item {
  padding: 6px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

  // 资源卡片区域（根据子卡片数量自适应）
  .overview__resource {
    display: flex;
    flex-direction: column;
    gap: 32px; // 阿里云风格：分类间距更大，更通透
  }

  // 概览分类（阿里云控制台风格）
  .overview__category {
    margin-bottom: 32px;
  }

  // 分类标题（阿里云风格：图标+标题+描述）
  .overview__category-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--overview-border-light);
  }

  .overview__category-icon {
    font-size: 20px;
    color: var(--el-text-color-secondary);
    margin-right: 12px;
    flex-shrink: 0;
  }

  .overview__category-title-wrap {
    flex: 1;
  }

  .overview__category-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
  }

  .overview__category-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin: 4px 0 0 0;
  }

  // 高频标签（阿里云风格）
  .overview__hot-tag {
    font-size: 10px;
    background: #ff7d00;
    color: #fff;
    padding: 2px 4px;
    border-radius: 2px;
    margin-left: 8px;
  }

  // 应用卡片（父级卡片，根据内容自适应宽度）
  .overview__app-card {
    background: var(--overview-card-parent-bg);
    border: 1px solid var(--overview-border-light);
    border-radius: 8px;
    padding: 16px;
    flex: 0 1 auto;
    min-width: 0;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

// 应用标题（可点击，父级卡片标题）
.overview__app-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    color: var(--el-color-primary);
  }
}

.overview__app-icon {
  flex-shrink: 0;
}

  // 一级菜单子卡片容器（水平排列，数量取决于一级菜单数量）
  .overview__menu-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px; // 阿里云风格：gap替代margin，更规整
    width: 100%;
  }

  // 一级菜单子卡片
  .overview__menu-card {
    background: var(--overview-card-child-bg);
    border: 1px solid var(--overview-border-light);
    border-radius: 8px; // 阿里云风格：圆角更大
    min-height: 80px;
    min-width: 240px; // 阿里云风格：子卡片更宽，更符合控制台布局
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02); // 微阴影，轻微提层，不突兀
  }

  // 一级菜单标题（可点击，子卡片顶栏）
  .overview__menu-card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    padding: 12px;
    background: var(--overview-card-child-bg);
    border-bottom: 1px solid var(--overview-border-light);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-bottom: 0;
    border-radius: 0;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  // 子卡片内容区域（二级菜单水平排列）
  .overview__menu-card-content {
    display: flex;
    flex-wrap: wrap;
    gap: 4px; // 减少间距
    padding: 8px; // 减少内边距
    flex: 1;
    background: var(--overview-card-child-bg);
  }

// 二级菜单项
.overview__sub-menu-item {
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 8px; // 减少内边距
  margin-right: 0; // 移除右边距，使用 gap 控制间距
  border-radius: 4px;
  white-space: nowrap;
  background: var(--overview-menu-item-bg);

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

// 列表视图
.overview__table {
  background-color: var(--el-bg-color);
  border-radius: 4px;
  overflow: hidden;
}
</style>







