<template>
  <div class="global-search">
    <!-- 搜索触发器 -->
    <div
      class="global-search__trigger"
      @click="openModal"
    >
      <el-input
        :model-value="''"
        placeholder=""
        readonly
      >
        <template #prefix>
          <btc-svg name="search" :size="16" />
        </template>
        <template #suffix>
          <el-tag size="small" type="info">
            Ctrl+K
          </el-tag>
        </template>
      </el-input>
    </div>

    <!-- 搜索弹窗 -->
    <Teleport to="body">
      <Transition name="search-modal">
        <div
          v-if="isModalOpen"
          class="global-search-modal"
          @click.self="closeModal"
        >
          <!-- 遮罩层 -->
          <div class="search-modal__backdrop"></div>

          <!-- 弹窗内容 -->
          <div class="search-modal__container">
            <!-- 搜索输入区 -->
            <div class="search-modal__header">
              <form class="search-modal__form" @submit.prevent="handleEnter">
                <label class="search-modal__icon" for="global-search-input">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.4"></circle>
                    <path d="m21 21-4.3-4.3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </label>
                <input
                  id="global-search-input"
                  name="global-search"
                  ref="inputRef"
                  v-model="searchKeyword"
                  type="search"
                  :placeholder="t('common.global_search_placeholder')"
                  class="search-modal__input"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  maxlength="512"
                  @keydown.up.prevent="handleArrowUp"
                  @keydown.down.prevent="handleArrowDown"
                  @keydown.enter.prevent="handleEnter"
                  @keydown.esc="closeModal"
                />
                <div class="search-modal__actions">
                  <button
                    v-if="searchKeyword"
                    type="reset"
                    class="search-modal__clear"
                    :aria-label="t('common.clear_search')"
                    @click="searchKeyword = ''"
                  >
                    {{ t('common.clear_search') }}
                  </button>
                  <div v-if="searchKeyword" class="search-modal__divider"></div>
                  <button
                    type="button"
                    class="search-modal__close"
                    :aria-label="t('common.close')"
                    :title="t('common.close')"
                    @click="closeModal"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <!-- 搜索结果区域 -->
            <div class="search-modal__body">
              <div v-if="searchResults.length > 0" class="search-results">
                <!-- 结果分组 -->
                <section
                  v-for="(group, groupIndex) in groupedResults"
                  :key="groupIndex"
                  class="result-section"
                >
                  <div class="result-section__source">
                    {{ group.title }}
                  </div>
                  <ul role="listbox" class="result-section__list">

                    <li
                      v-for="(item, itemIndex) in group.items"
                      :key="item.id"
                      role="option"
                      :aria-selected="selectedIndex === item.globalIndex"
                      class="result-hit"
                      :class="{ 'is-active': selectedIndex === item.globalIndex }"
                    >
                      <a
                        href="javascript:void(0)"
                        @click.prevent="handleSelectResult(item)"
                        @mouseenter="selectedIndex = item.globalIndex"
                      >
                        <div class="result-hit__container">
                          <div class="result-hit__icon">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                              <path v-if="item.type === 'menu'" d="M17 5H3h14zm0 5H3h14zm0 5H3h14z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path>
                              <path v-else d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path>
                            </svg>
                          </div>
                          <div class="result-hit__content">
                            <span class="result-hit__title" v-html="highlightKeyword(item.title)"></span>
                            <span v-if="item.breadcrumb" class="result-hit__path">{{ item.breadcrumb }}</span>
                          </div>
                          <div class="result-hit__action">
                            <svg width="20" height="20" viewBox="0 0 20 20" class="result-hit__select-icon">
                              <g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 3v4c0 2-2 4-4 4H2"></path>
                                <path d="M8 17l-6-6 6-6"></path>
                              </g>
                            </svg>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </section>
              </div>

              <!-- 空状态 -->
              <div v-else-if="searchKeyword && searchResults.length === 0" class="search-empty">
                <el-icon :size="64" class="search-empty__icon">
                  <Search />
                </el-icon>
                <div class="search-empty__message">
                  {{ t('common.no_results_for') }} "{{ searchKeyword }}"
                </div>
                <div class="search-empty__suggestions">
                  <div class="search-empty__suggestions-title">
                    {{ t('common.try_searching_for') }}
                  </div>
                  <div class="search-empty__suggestions-list">
                    <button
                      v-for="suggestion in suggestedKeywords"
                      :key="suggestion"
                      class="search-empty__suggestion-item"
                      @click="searchKeyword = suggestion"
                    >
                      {{ suggestion }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 初始状态（历史/热门） -->
              <div v-else class="search-hints">
                <div v-if="recentSearches.length > 0" class="hint-group">
                  <div class="hint-group__title">{{ t('common.recent_searches') }}</div>
                  <div
                    v-for="(recent, index) in recentSearches"
                    :key="index"
                    class="hint-item"
                    @click="searchKeyword = recent"
                  >
                    <el-icon><Clock /></el-icon>
                    <span>{{ recent }}</span>
                  </div>
                </div>

                <div class="hint-group">
                  <div class="hint-group__title">{{ t('common.quick_access') }}</div>
                  <div
                    v-for="(quick, index) in quickAccess"
                    :key="index"
                    class="hint-item"
                    @click="handleSelectResult(quick)"
                  >
                    <el-icon><Star /></el-icon>
                    <span>{{ quick.title }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部提示 -->
            <div class="search-modal__footer">
              <ul class="search-commands">
                <li>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="向下箭头" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <path d="M12 5v14"></path>
                        <path d="m19 12-7 7-7-7"></path>
                      </g>
                    </svg>
                  </kbd>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="向上箭头" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <path d="m5 12 7-7 7 7"></path>
                        <path d="M12 19V5"></path>
                      </g>
                    </svg>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.navigate') }}</span>
                </li>
                <li>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="Enter 键" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <polyline points="9 10 4 15 9 20"></polyline>
                        <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                      </g>
                    </svg>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.select') }}</span>
                </li>
                <li>
                  <kbd class="search-commands__key">
                    <span class="search-commands__escape">ESC</span>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.close') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'GlobalSearch'
});

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { Star, Search, Clock } from '@element-plus/icons-vue';
import { getMenuRegistry, type MenuItem } from '@btc/shared-components/store/menuRegistry';
import { useCurrentApp } from '@btc/shared-components/composables/useCurrentApp';
import { useSearchIndex, type SearchDataItem as SearchDataItemType } from './useSearchIndex';

// DocSearchResult 类型定义
interface DocSearchResult {
  title: string;
  content: string;
  url: string;
  [key: string]: any;
}

// 使用 useSearchIndex 中定义的 SearchDataItem 类型
type SearchDataItem = SearchDataItemType;

const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();

const inputRef = ref();
const searchKeyword = ref('');
const isModalOpen = ref(false);
const selectedIndex = ref(0);

// 扁平化菜单树，提取所有可搜索的菜单项
function flattenMenuItems(
  items: MenuItem[],
  parentBreadcrumb: string[] = [],
  app: string = '',
  basePath: string = '',
  translateFn?: (key: string) => string
): SearchDataItem[] {
  const result: SearchDataItem[] = [];
  let itemIndex = 0;

  for (const item of items) {
    // 处理标题：菜单项中的 title 都是国际化key，需要翻译
    // 参考 menu-renderer 的实现：直接使用 t(item.title) 翻译
    let displayTitle = item.title;

    if (translateFn && item.title) {
      try {
        // 直接翻译，就像 menu-renderer 中那样
        const translated = translateFn(item.title);

        // 检查翻译结果：如果翻译成功，结果应该与key不同
        if (translated && translated !== item.title) {
          displayTitle = translated;
        } else {
          // 如果翻译返回的还是key，可能的原因：
          // 1. 翻译文件中没有这个key
          // 2. 翻译函数还没有完全初始化
          // 3. key格式不正确

          // 尝试去掉 menu. 前缀后再翻译（某些key可能没有 menu. 前缀）
          if (item.title.startsWith('menu.')) {
            const keyWithoutPrefix = item.title.replace(/^menu\./, '');
            try {
              const retryTranslated = translateFn(keyWithoutPrefix);
              if (retryTranslated && retryTranslated !== keyWithoutPrefix) {
                displayTitle = retryTranslated;
              } else {
                // 如果还是失败，使用原始key作为兜底（虽然不理想，但至少不会崩溃）
                displayTitle = item.title;
              }
            } catch {
              // 忽略错误，使用原始key作为兜底
              displayTitle = item.title;
            }
          } else {
            // 如果key不是以 menu. 开头，但翻译失败，使用原始key
            displayTitle = item.title;
          }
        }
      } catch (error) {
        // 如果翻译抛出异常，使用原始key作为兜底
        displayTitle = item.title;
      }
    }

    // 构建面包屑
    const breadcrumbParts = parentBreadcrumb.length > 0
      ? [...parentBreadcrumb, displayTitle]
      : [displayTitle];
    const breadcrumb = breadcrumbParts.length > 1
      ? breadcrumbParts.slice(0, -1).join(' · ')
      : undefined;

    // 构建完整路径
    let fullPath = item.index;
    if (!fullPath.startsWith('/')) {
      // 如果路径不是以 / 开头，需要根据应用添加前缀
      if (app === 'admin' && !fullPath.startsWith('/admin')) {
        fullPath = `/admin${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;
      } else if (app !== 'system' && app !== 'admin' && !fullPath.startsWith(`/${app}`)) {
        fullPath = `/${app}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;
      } else if (!fullPath.startsWith('/')) {
        fullPath = `/${fullPath}`;
      }
    }

    // 如果菜单项有标题且有有效路径，则添加到搜索结果
    if (displayTitle && fullPath && fullPath !== '/') {
      result.push({
        id: `menu-${app}-${item.index}-${itemIndex++}`,
        type: 'menu',
        title: displayTitle,
        path: fullPath,
        breadcrumb,
        app,
      });
    }

    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      const childBreadcrumb = displayTitle
        ? [...parentBreadcrumb, displayTitle]
        : parentBreadcrumb;
      const childResults = flattenMenuItems(
        item.children,
        childBreadcrumb,
        app,
        fullPath,
        translateFn
      );
      result.push(...childResults);
    }
  }

  return result;
}

// 从路由获取页面数据
function getRoutesData(): SearchDataItem[] {
  const routes = router.getRoutes();
  const result: SearchDataItem[] = [];
  let routeIndex = 0;

  for (const route of routes) {
    // 跳过隐藏的路由、公开路由和没有 meta 的路由
    if (
      route.meta?.isHide ||
      route.meta?.public ||
      !route.meta?.title &&
      !route.meta?.titleKey
    ) {
      continue;
    }

    // 获取标题
    const title = route.meta?.title
      ? String(route.meta.title)
      : route.meta?.titleKey
      ? t(route.meta.titleKey as string)
      : route.name
      ? String(route.name)
      : route.path;

    // 获取面包屑（从 meta.breadcrumbs 或 meta.label）
    const breadcrumb = route.meta?.breadcrumbs
      ? Array.isArray(route.meta.breadcrumbs)
        ? route.meta.breadcrumbs.map((b: any) =>
            b.labelKey ? t(b.labelKey) : b.label || ''
          ).filter(Boolean).join(' · ')
        : undefined
      : route.meta?.label
      ? String(route.meta.label)
      : undefined;

    // 确定应用
    let app = 'system';
    if (route.path.startsWith('/admin')) app = 'admin';
    else if (route.path.startsWith('/logistics')) app = 'logistics';
    else if (route.path.startsWith('/engineering')) app = 'engineering';
    else if (route.path.startsWith('/quality')) app = 'quality';
    else if (route.path.startsWith('/production')) app = 'production';
    else if (route.path.startsWith('/finance')) app = 'finance';
    else if (route.path.startsWith('/monitor')) app = 'monitor';
    else if (route.path.startsWith('/docs')) app = 'docs';

    result.push({
      id: `route-${app}-${routeIndex++}`,
      type: 'page',
      title,
      path: route.path,
      breadcrumb,
      app,
    });
  }

  return result;
}

// 构建搜索数据的函数（可复用）
function buildSearchData(): SearchDataItem[] {
  const result: SearchDataItem[] = [];

  try {
    // 1. 从菜单注册表获取所有应用的菜单
    const menuRegistry = getMenuRegistry();
    // 关键：访问整个注册表对象，建立完整的响应式依赖
    const registryValue = menuRegistry.value;
    const allApps = ['admin', 'system', 'logistics', 'engineering', 'quality', 'production', 'finance', 'monitor', 'docs'];

    for (const app of allApps) {
      const menus = registryValue[app] || [];

      if (menus.length > 0) {
        // 确保传递翻译函数
        const flattenedMenus = flattenMenuItems(menus, [], app, '', t);
        result.push(...flattenedMenus);
      } else {
        // 如果某个应用的菜单为空，尝试主动注册
        if (typeof window !== 'undefined') {
          const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
          if (typeof registerMenusFn === 'function') {
            try {
              registerMenusFn(app);
              // 重新获取菜单（从响应式对象中获取最新值）
              const retryMenus = menuRegistry.value[app] || [];
              if (retryMenus.length > 0) {
                const flattenedMenus = flattenMenuItems(retryMenus, [], app, '', t);
                result.push(...flattenedMenus);
              }
            } catch (error) {
              // 静默失败
            }
          }
        }
      }
    }

    // 2. 从路由获取页面数据（补充菜单中没有的路由）
    const routesData = getRoutesData();

    // 去重：如果路由路径已在菜单数据中，则跳过
    const menuPaths = new Set(result.map(item => item.path));
    for (const routeItem of routesData) {
      if (!menuPaths.has(routeItem.path)) {
        result.push(routeItem);
      }
    }
  } catch (error) {
    console.error('[GlobalSearch] 构建搜索数据失败:', error);
  }

  return result;
}

// 动态构建搜索数据源（响应式）
const searchData = computed<SearchDataItem[]>(() => {
  // 关键：访问整个菜单注册表，建立完整的响应式依赖
  const menuRegistry = getMenuRegistry();
  // 访问注册表的所有应用，确保响应式追踪
  void menuRegistry.value.admin;
  void menuRegistry.value.system;
  void menuRegistry.value.logistics;
  void menuRegistry.value.engineering;
  void menuRegistry.value.quality;
  void menuRegistry.value.production;
  void menuRegistry.value.finance;
  void menuRegistry.value.monitor;
  void menuRegistry.value.docs;

  const data = buildSearchData();
  return data;
});

// 监听菜单注册表的变化，确保菜单注册后搜索数据能更新
const menuRegistry = getMenuRegistry();
watch(
  () => menuRegistry.value,
  () => {
    // 菜单注册表变化时，computed 会自动重新计算
    // 这里只是确保响应式追踪
  },
  { deep: true }
);

// 构建搜索索引（使用 lunr.js）
const { searchIndex, search: searchWithLunr, mapResultsToItems, createDataMap } = useSearchIndex(searchData);

// 监听索引构建
watch(searchIndex, () => {
  // 索引变化时自动更新
}, { immediate: true });

// 创建数据映射表（用于快速查找）
const dataMap = computed(() => {
  const map = createDataMap(searchData.value);
  return map;
});

// 简单搜索函数（兜底方案，当索引构建失败时使用）
function simpleSearch(items: SearchDataItem[], keyword: string): SearchDataItem[] {
  const lowerKeyword = keyword.toLowerCase().trim();
  return items.filter(item => {
    // 1. 匹配翻译后的标题
    if (item.title.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 2. 如果原始标题存在，尝试翻译并匹配
    if (item.originalTitle) {
      if (item.originalTitle.includes('.') || item.originalTitle.startsWith('menu.')) {
        try {
          const translated = t(item.originalTitle);
          if (translated && translated !== item.originalTitle && translated.toLowerCase().includes(lowerKeyword)) {
            return true;
          }
        } catch {
          // 忽略翻译错误
        }
      }

      if (item.originalTitle !== item.title && item.originalTitle.toLowerCase().includes(lowerKeyword)) {
        return true;
      }
    }

    // 3. 匹配面包屑
    if (item.breadcrumb && item.breadcrumb.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 4. 匹配路径
    const pathWithoutParams = item.path.split('?')[0].split(':')[0];
    const pathSegments = pathWithoutParams.split('/').filter(Boolean);
    for (const segment of pathSegments) {
      if (segment.toLowerCase().includes(lowerKeyword)) {
        return true;
      }
    }

    return false;
  });
}

// 最近搜索（从 localStorage 读取）
const recentSearches = ref<string[]>([]);

// 快捷访问（包含文档）
const quickAccess = computed<SearchDataItem[]>(() => [] as SearchDataItem[]);

// 推荐搜索词（空状态时显示）
const suggestedKeywords = ref([]);

// 搜索结果状态
const searchResults = ref<any[]>([]);
const isSearching = ref(false);

// 监听搜索关键词变化，异步搜索
watch(searchKeyword, async (keyword) => {
  if (!keyword || !keyword.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  const lowerKeyword = keyword.toLowerCase().trim();

  try {
    let menuResults: SearchDataItem[] = [];

    // 检查是否为中文搜索
    const isChineseSearch = /[\u4e00-\u9fff]/.test(keyword);

    // 混合搜索策略：
    // - 中文搜索：直接使用 simpleSearch（lunr 对中文支持有限）
    // - 英文搜索：优先使用 lunr（性能更好）
    if (isChineseSearch) {
      // 中文搜索：直接使用简单搜索
      menuResults = simpleSearch(searchData.value, keyword);
    } else if (searchIndex.value) {
      // 英文搜索：使用 lunr
      try {
        // 使用 lunr 进行搜索
        const lunrResults = searchWithLunr(keyword);

        // 将 lunr 搜索结果映射回原始的 SearchDataItem
        menuResults = mapResultsToItems(lunrResults, dataMap.value);

        // 如果 lunr 没有结果，降级到简单搜索（兜底）
        if (menuResults.length === 0) {
          menuResults = simpleSearch(searchData.value, keyword);
        }
      } catch (error) {
        menuResults = simpleSearch(searchData.value, keyword);
      }
    } else {
      // 索引不可用时使用简单搜索
      menuResults = simpleSearch(searchData.value, keyword);
    }

    // 搜索文档（异步）
    // 通过全局函数获取文档搜索服务
    const getDocsSearchService = (window as any).__APP_GET_DOCS_SEARCH_SERVICE__;
    const docResults = getDocsSearchService
      ? await getDocsSearchService(lowerKeyword)
      : [];

    // 合并结果并添加全局索引
    // 注意：lunr 搜索结果已经按相关性排序，不需要再次排序
    const allResults = [...menuResults, ...docResults];
    searchResults.value = allResults.map((item, index) => ({ ...item, globalIndex: index }));
  } catch (_error) {
    // 搜索失败时仍然显示菜单结果（使用简单搜索）
    const menuResults = simpleSearch(searchData.value, keyword);
    searchResults.value = menuResults.map((item, index) => ({ ...item, globalIndex: index }));
  } finally {
    isSearching.value = false;
  }
}, { immediate: false });

// 分组结果（菜单 + 页面 + 文档）
const groupedResults = computed(() => {
  const groups: any[] = [];
  const menuItems = searchResults.value.filter(r => r.type === 'menu');
  const pageItems = searchResults.value.filter(r => r.type === 'page');
  const docItems = searchResults.value.filter(r => r.type === 'doc');

  if (menuItems.length > 0) {
    groups.push({
      title: t('common.menu_items'),
      items: menuItems
    });
  }

  if (pageItems.length > 0) {
    groups.push({
      title: t('common.pages'),
      items: pageItems
    });
  }

  if (docItems.length > 0) {
    groups.push({
      title: t('common.documents'),
      items: docItems
    });
  }

  return groups;
});

// 打开弹窗
const openModal = () => {
  isModalOpen.value = true;
  selectedIndex.value = 0;
  searchKeyword.value = '';

  // 打开搜索弹窗时，尝试注册所有应用的菜单（确保菜单已加载）
  if (typeof window !== 'undefined') {
    const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
    if (typeof registerMenusFn === 'function') {
      const allApps = ['admin', 'system', 'logistics', 'engineering', 'quality', 'production', 'finance', 'monitor', 'docs'];
      for (const app of allApps) {
        try {
          registerMenusFn(app);
        } catch (error) {
          // 静默失败
        }
      }
    }
  }

  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false;
  searchKeyword.value = '';
};

// 键盘导航
const handleArrowUp = () => {
  if (searchResults.value.length === 0) return;
  selectedIndex.value = selectedIndex.value > 0
    ? selectedIndex.value - 1
    : searchResults.value.length - 1;
};

const handleArrowDown = () => {
  if (searchResults.value.length === 0) return;
  selectedIndex.value = selectedIndex.value < searchResults.value.length - 1
    ? selectedIndex.value + 1
    : 0;
};

const handleEnter = () => {
  if (searchResults.value.length === 0) return;
  const selected = searchResults.value[selectedIndex.value];
  if (selected) {
    handleSelectResult(selected);
  }
};


// 选择结果
const handleSelectResult = (item: any) => {
  // 保存到最近搜索
  if (searchKeyword.value.trim()) {
    addRecentSearch(searchKeyword.value.trim());
  }

  // 根据类型处理跳转
  if (item.type === 'doc') {
    // 文档结果：先跳转到文档应用，然后导航到具体页面
    handleDocNavigation(item);
  } else {
    // 菜单/页面结果：直接跳转
    router.push(item.path);
  }

  // 关闭弹窗
  closeModal();
};

// 处理文档导航（跨 iframe，使用 VitePress 内部路由）
const handleDocNavigation = (doc: DocSearchResult) => {
  const currentPath = router.currentRoute.value.path;

  // 如果已经在文档页面，直接通知 iframe 进行内部导航
  if (currentPath === '/docs') {
    // 触发文档导航事件（由 DocsIframe 组件监听）
    window.dispatchEvent(new CustomEvent('docs-navigate', {
      detail: { path: doc.path }
    }));
  } else {
    // 如果不在文档页面，先导航过去（路由守卫会显示 Loading）
    router.push('/docs').then(() => {
      // 等待 iframe 加载完成后，再导航到具体页面
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('docs-navigate', {
          detail: { path: doc.path }
        }));
      }, 500); // 等待文档应用 iframe 渲染完成
    });
  }
};

// 高亮关键词（同时处理国际化key的翻译）
const highlightKeyword = (text: string) => {
  // 如果文本看起来像国际化key，尝试翻译
  let displayText = text;
  if (text && (text.includes('.') || text.startsWith('menu.'))) {
    try {
      const translated = t(text);
      if (translated && translated !== text) {
        displayText = translated;
      } else if (text.startsWith('menu.')) {
        // 尝试去掉 menu. 前缀
        const keyWithoutPrefix = text.replace(/^menu\./, '');
        try {
          const retryTranslated = t(keyWithoutPrefix);
          if (retryTranslated && retryTranslated !== keyWithoutPrefix) {
            displayText = retryTranslated;
          }
        } catch {
          // 忽略错误
        }
      }
    } catch {
      // 忽略错误，使用原始文本
    }
  }

  // 高亮关键词
  if (!searchKeyword.value.trim()) return displayText;
  const keyword = searchKeyword.value.trim();
  const regex = new RegExp(`(${keyword})`, 'gi');
  return displayText.replace(regex, '<mark>$1</mark>');
};

// 添加到最近搜索
const addRecentSearch = (keyword: string) => {
  const searches = recentSearches.value.filter(s => s !== keyword);
  searches.unshift(keyword);
  recentSearches.value = searches.slice(0, 5); // 最多保存5条
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value));
};

// 加载最近搜索
const loadRecentSearches = () => {
  const saved = localStorage.getItem('recent-searches');
  if (saved) {
    try {
      recentSearches.value = JSON.parse(saved);
    } catch (_e) {
      recentSearches.value = [];
    }
  }
};

// 全局快捷键 Ctrl+K
const handleGlobalShortcut = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (isModalOpen.value) {
      closeModal();
    } else {
      openModal();
    }
  }
};

onMounted(() => {
  loadRecentSearches();
  document.addEventListener('keydown', handleGlobalShortcut);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalShortcut);
});
</script>

<style lang="scss" scoped>
.global-search {
  width: 200px;

  &__trigger {
    cursor: pointer;

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      border-radius: 6px;
      border: 1px solid var(--el-fill-color-dark); // 添加默认边框
      transition: all 0.2s ease;
      cursor: pointer;
      height: 26px; // 与折叠按钮高度一致
      padding: 0 8px;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      cursor: pointer;
      line-height: 24px;
      height: 24px;
    }

    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
      margin-right: 4px;
    }

    :deep(.el-input__suffix) {
      margin-left: 4px;
      display: flex;
      align-items: center;

      .el-tag {
        border: none;
        background-color: var(--el-fill-color);
        color: var(--el-text-color-secondary);
        font-size: 11px;
        padding: 0 5px;
        height: 18px;
        line-height: 18px;
      }
    }

    &:hover {
      :deep(.el-input__wrapper) {
        background-color: var(--el-fill-color);
        border-color: var(--el-color-primary); // 悬浮时主题色边框
      }
    }
  }
}

/* 全屏搜索弹窗 */
.global-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-modal {
  &__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  &__container {
    position: relative;
    width: 640px;
    max-width: 90vw;
    max-height: 70vh;
    background-color: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__form {
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--el-color-primary);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    color: var(--el-text-color-primary);
    font-family: inherit;
    padding: 16px 0;
    min-width: 0;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    // 移除 search input 的默认样式
    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__clear {
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--el-color-primary);
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__divider {
    width: 1px;
    height: 20px;
    background-color: var(--el-border-color);
  }

  &__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: var(--el-fill-color);
      color: var(--el-text-color-primary);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;

    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--el-fill-color-darker);
      border-radius: 3px;
    }
  }

  &__footer {
    flex-shrink: 0;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
}

/* 搜索结果 */
.search-results {
  padding: 8px 12px;
}

.result-section {
  & + & {
    margin-top: 16px;
  }

  &__source {
    padding: 8px 8px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    letter-spacing: 0.3px;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.result-hit {
  & + & {
    margin-top: 4px;
  }

  a {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  &:hover:not(.is-active) {
    .result-hit__container {
      background-color: var(--el-fill-color);
    }
  }

  &.is-active {
    .result-hit__container {
      background-color: var(--el-color-primary-light-9);
      box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
    }

    .result-hit__icon {
      color: var(--el-color-primary);
    }

    .result-hit__action {
      color: var(--el-color-primary);
    }
  }

  &__container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 4px;
    background-color: var(--el-fill-color-light);
    transition: all 0.15s ease;
    cursor: pointer;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--el-text-color-secondary);
    transition: color 0.15s ease;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-primary);
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    :deep(mark) {
      background-color: transparent;
      color: var(--el-color-primary);
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
    }
  }

  &__path {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__action {
    flex-shrink: 0;
    color: var(--el-text-color-placeholder);
    transition: all 0.15s ease;

    svg {
      width: 20px;
      height: 20px;
    }
  }

}

/* 空状态 */
.search-empty {
  padding: 48px 20px;
  text-align: center;

  &__icon {
    color: var(--el-text-color-placeholder);
    margin-bottom: 16px;
  }

  &__message {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 24px;
    font-weight: 500;
  }

  &__suggestions {
    &-title {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
    }

    &-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
  }

  &__suggestion-item {
    padding: 8px 16px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background-color: var(--el-fill-color);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}

/* 提示区域 */
.search-hints {
  padding: 8px 12px;
}

.hint-group {
  & + & {
    margin-top: 16px;
  }

  &__title {
    padding: 8px 8px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    letter-spacing: 0.3px;
  }
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-top: 4px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--el-text-color-regular);

  &:hover {
    background-color: var(--el-fill-color);
  }

  &:active {
    background-color: var(--el-color-primary-light-9);
    box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);

    .el-icon {
      color: var(--el-color-primary);
    }
  }

  .el-icon {
    color: var(--el-text-color-secondary);
    transition: color 0.15s ease;
  }
}

.search-commands {
  display: flex;
  align-items: center;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 28px;
    padding: 0 6px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-color-primary-light-5);
    border-bottom-width: 2px;
    border-bottom-color: var(--el-color-primary-light-3);
    border-radius: 4px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: var(--el-color-primary);
    box-shadow: inset 0 -1px 0 0 var(--el-color-primary-light-7);
    transition: all 0.15s ease;
    cursor: pointer;

    svg {
      width: 15px;
      height: 15px;
      stroke-width: 1.4;
      color: var(--el-color-primary);
    }

    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-3);
      border-bottom-color: var(--el-color-primary);
      box-shadow: inset 0 -1px 0 0 var(--el-color-primary-light-5);
      transform: translateY(-1px);
    }
  }

  &__escape {
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    color: inherit;
  }

  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* 弹窗动画 */
.search-modal-enter-active {
  transition: all 0.25s ease;

  .search-modal__backdrop {
    transition: opacity 0.25s ease;
  }

  .search-modal__container {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.search-modal-leave-active {
  transition: all 0.2s ease;

  .search-modal__backdrop {
    transition: opacity 0.2s ease;
  }

  .search-modal__container {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  .search-modal__backdrop {
    opacity: 0;
  }

  .search-modal__container {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
}
</style>


