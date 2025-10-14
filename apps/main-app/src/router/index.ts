import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized } from 'vue-router';
import Layout from '../layout/index.vue';
import { config } from '../config';
import { storage } from '@btc/shared-utils';
import { zhCN, enUS } from '@btc/shared-core';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../pages/home/index.vue'),
        meta: { isHome: true, titleKey: 'menu.home' },
      },
      // 测试功能
      {
        path: 'test/crud',
        name: 'TestCrud',
        component: () => import('../pages/test/crud/index.vue'),
        meta: { titleKey: 'menu.test_features.crud' },
      },
      {
        path: 'test/svg-plugin',
        name: 'TestSvgPlugin',
        component: () => import('../pages/test/svg-plugin/index.vue'),
        meta: { titleKey: 'menu.test_features.svg' },
      },
      {
        path: 'test/i18n',
        name: 'TestI18n',
        component: () => import('../pages/test/i18n/index.vue'),
        meta: { titleKey: 'menu.test_features.i18n' },
      },
      {
        path: 'test/select-button',
        name: 'TestSelectButton',
        component: () => import('../pages/test/select-button/index.vue'),
        meta: { titleKey: 'menu.test_features.select_button' },
      },
      // 文档中心（iframe 在全局 Layout 中，不需要独立组件）
      {
        path: 'docs',
        name: 'Docs',
        component: { template: '<div class="docs-placeholder"></div>' }, // 空组件，实际渲染由 Layout 的 DocsIframe 处理
        meta: { titleKey: 'menu.docs_center' },
      },
      // 文档中心子路由 - 实现类似 VitePress 的路由映射
      {
        path: 'docs/:pathMatch(.*)*',
        name: 'DocsPage',
        component: { template: '<div class="docs-placeholder"></div>' }, // 空组件，实际渲染由 Layout 的 DocsIframe 处理
        meta: { titleKey: 'menu.docs_center', isDocsPage: true },
      },
      // 注意：移除了原生 VitePress 路由支持，只允许通过 /docs 前缀访问
      // 平台治理
      {
        path: 'platform/domains',
        name: 'Domains',
        component: () => import('../pages/platform/domains/index.vue'),
        meta: { titleKey: 'menu.platform.domains' },
      },
      {
        path: 'platform/modules',
        name: 'Modules',
        component: () => import('../pages/platform/modules/index.vue'),
        meta: { titleKey: 'menu.platform.modules' },
      },
      {
        path: 'platform/plugins',
        name: 'Plugins',
        component: () => import('../pages/platform/plugins/index.vue'),
        meta: { titleKey: 'menu.platform.plugins' },
      },
      // 组织与账号
      {
        path: 'org/tenants',
        name: 'Tenants',
        component: () => import('../pages/org/tenants/index.vue'),
        meta: { titleKey: 'menu.org.tenants' },
      },
      {
        path: 'org/departments',
        name: 'Departments',
        component: () => import('../pages/org/departments/index.vue'),
        meta: { titleKey: 'menu.org.departments' },
      },
      {
        path: 'org/departments/:id/roles',
        name: 'DeptRoleBind',
        component: () => import('../pages/org/dept-role-bind/index.vue'),
        meta: { titleKey: 'menu.org.dept_role_bind' },
      },
      {
        path: 'org/users',
        name: 'Users',
        component: () => import('../pages/org/users/index.vue'),
        meta: { titleKey: 'menu.org.users' },
      },
      {
        path: 'org/users/:id/roles',
        name: 'UserRoleAssign',
        component: () => import('../pages/org/user-role-assign/index.vue'),
        meta: { titleKey: 'menu.org.user_role_assign' },
      },
      // 访问控制
      {
        path: 'access/resources',
        name: 'Resources',
        component: () => import('../pages/access/resources/index.vue'),
        meta: { titleKey: 'menu.access.resources' },
      },
      {
        path: 'access/actions',
        name: 'Actions',
        component: () => import('../pages/access/actions/index.vue'),
        meta: { titleKey: 'menu.access.actions' },
      },
      {
        path: 'access/permissions',
        name: 'Permissions',
        component: () => import('../pages/access/permissions/index.vue'),
        meta: { titleKey: 'menu.access.permissions' },
      },
      {
        path: 'access/roles',
        name: 'Roles',
        component: () => import('../pages/access/roles/index.vue'),
        meta: { titleKey: 'menu.access.roles' },
      },
      {
        path: 'access/roles/:id/permissions',
        name: 'RolePermBind',
        component: () => import('../pages/access/role-perm-bind/index.vue'),
        meta: { titleKey: 'menu.access.role_perm_bind' },
      },
      {
        path: 'access/policies',
        name: 'Policies',
        component: () => import('../pages/access/policies/index.vue'),
        meta: { titleKey: 'menu.access.policies' },
      },
      {
        path: 'access/perm-compose',
        name: 'PermCompose',
        component: () => import('../pages/access/perm-compose/index.vue'),
        meta: { titleKey: 'menu.access.perm_compose' },
      },
      // 导航与可见性
      {
        path: 'navigation/menus',
        name: 'Menus',
        component: () => import('../pages/navigation/menus/index.vue'),
        meta: { titleKey: 'menu.navigation.menus' },
      },
      {
        path: 'navigation/menus/:id/permissions',
        name: 'MenuPermBind',
        component: () => import('../pages/navigation/menu-perm-bind/index.vue'),
        meta: { titleKey: 'menu.navigation.menu_perm_bind' },
      },
      {
        path: 'navigation/menus/preview',
        name: 'MenuPreview',
        component: () => import('../pages/navigation/menu-preview/index.vue'),
        meta: { titleKey: 'menu.navigation.menu_preview' },
      },
      // 运维与审计
      {
        path: 'ops/audit',
        name: 'Audit',
        component: () => import('../pages/ops/audit/index.vue'),
        meta: { titleKey: 'menu.ops.audit' },
      },
      {
        path: 'ops/baseline',
        name: 'Baseline',
        component: () => import('../pages/ops/baseline/index.vue'),
        meta: { titleKey: 'menu.ops.baseline' },
      },
      {
        path: 'ops/simulator',
        name: 'Simulator',
        component: () => import('../pages/ops/simulator/index.vue'),
        meta: { titleKey: 'menu.ops.simulator' },
      },
    ],
  },
  // 子应用路由占位（qiankun会接管，这里只需要Layout）
  {
    path: '/logistics',
    component: Layout,
    meta: { title: 'Logistics App', isHome: true, isSubApp: true },
  },
  {
    path: '/logistics/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Logistics App', isSubApp: true },  // 标记为子应用路由
  },
  {
    path: '/engineering',
    component: Layout,
    meta: { title: 'Engineering App', isHome: true, isSubApp: true },
  },
  {
    path: '/engineering/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Engineering App', isSubApp: true },  // 标记为子应用路由
  },
  {
    path: '/quality',
    component: Layout,
    meta: { title: 'Quality App', isHome: true, isSubApp: true },
  },
  {
    path: '/quality/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Quality App', isSubApp: true },  // 标记为子应用路由
  },
  {
    path: '/production',
    component: Layout,
    meta: { title: 'Production App', isHome: true, isSubApp: true },
  },
  {
    path: '/production/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Production App', isSubApp: true },  // 标记为子应用路由
  },
];

// 语言包映射（必须在最前面定义，供立即执行的初始化使用）
const localeMessages: Record<string, any> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 已删除：路径到i18n键的映射表（改用 meta.titleKey，单一事实来源）

/**
 * 同步获取翻译（避免异步导致的标题闪烁）
 */
function getTranslation(key: string): string {
  const currentLocale = storage.get<string>('locale') || 'zh-CN';
  const messages = localeMessages[currentLocale] || zhCN;

  // 直接通过键获取翻译（语言包的键是完整字符串，不是嵌套对象）
  const translation = messages[key];

  return translation || key; // 找不到翻译时返回键本身
}

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true, // 严格模式：/logistics 和 /logistics/ 视为不同路由
});

// 保存当前路由，用于语言切换时更新标题
let currentRoute: RouteLocationNormalized | null = null;

/**
 * 更新浏览器标题（同步，无闪烁）
 * 使用 meta.titleKey 作为单一事实来源
 */
function updateDocumentTitle(to: RouteLocationNormalized) {
  currentRoute = to;

  const titleKey = to.meta?.titleKey as string | undefined;

  if (titleKey) {
    // 同步获取国际化标题
    document.title = getTranslation(titleKey);
  } else {
    // 回退到系统名称
    document.title = config.app.name;
  }
}

/**
 * 监听语言切换，更新浏览器标题（同步方式）
 */
export function setupI18nTitleWatcher() {
  // 监听 localStorage 中的语言变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'locale' && currentRoute) {
      // 语言切换时，同步更新当前页面的标题
      updateDocumentTitle(currentRoute);
    }
  });

  // 也可以通过自定义事件监听（用于同一标签页的语言切换）
  window.addEventListener('locale-change', () => {
    if (currentRoute) {
      updateDocumentTitle(currentRoute);
    }
  });
}

// 路由前置守卫：处理 Loading 显示和侧边栏
router.beforeEach((to, from) => {
  // 检查是否为文档相关路由（只支持 /docs 前缀）
  const isDocsRoute = to.path === '/docs' ||
                     to.path.startsWith('/docs/');

  if (isDocsRoute) {
    // 检查 iframe 是否已经加载完成（通过全局状态）
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // iframe 已加载，瞬间切换（禁用过渡动画）
      document.body.classList.add('docs-mode-instant'); // 禁用动画的类
      document.body.classList.add('docs-mode');

      // 下一帧移除 instant 类，恢复正常动画（为下次切换准备）
      requestAnimationFrame(() => {
        document.body.classList.remove('docs-mode-instant');
      });
    } else {
      // iframe 未加载，显示 Loading（带动画）
      const el = document.getElementById('Loading');
      if (el) {
        // 更新文字
        const titleEl = el.querySelector('.preload__title');
        if (titleEl) {
          titleEl.textContent = '正在加载资源';
        }

        const subtitleEl = el.querySelector('.preload__sub-title');
        if (subtitleEl) {
          subtitleEl.textContent = '部分资源可能加载时间较长，请耐心等待';
        }

        // 显示 Loading
        el.classList.remove('is-hide');
      }
    }
  }

  // 如果从文档中心离开，移除 docs-mode 类
  const wasDocsRoute = from.path === '/docs' ||
                      from.path.startsWith('/docs/');

  if (wasDocsRoute && !isDocsRoute) {
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // iframe 已加载，瞬间切换（禁用过渡动画）
      document.body.classList.add('docs-mode-instant'); // 禁用动画的类
      document.body.classList.remove('docs-mode');

      // 下一帧移除 instant 类，恢复正常动画
      requestAnimationFrame(() => {
        document.body.classList.remove('docs-mode-instant');
      });
    }
  }
});

// 路由守卫：自动添加标签到 Tabbar（仅主应用路由）
router.afterEach((to) => {
  // 动态更新浏览器标题
  updateDocumentTitle(to);

  // 如果是首页（isHome=true），将所有标签设为未激活
  if (to.meta?.isHome === true || to.path === '/') {
    import('../store/process').then(({ useProcessStore }) => {
      const process = useProcessStore();
      process.list.forEach(tab => {
        tab.active = false;
      });
    });
    return;
  }

  // 直接跳过标记为子应用的路由
  if (to.meta?.isSubApp === true) {
    return;
  }

  // 规范化路径（移除末尾斜杠）
  const normalizedPath = to.path.replace(/\/$/, '');

  // 跳过子应用的根路径
  const appRoots = ['/logistics', '/engineering', '/quality', '/production'];
  if (appRoots.includes(normalizedPath)) {
    return;
  }

  // 只处理主应用的路由，忽略子应用路由
  const fullPath = to.matched[0]?.path || to.path;
  const isSubAppRoute = ['/logistics', '/engineering', '/quality', '/production'].some(prefix =>
    fullPath.startsWith(prefix)
  );

  if (isSubAppRoute) {
    return;
  }

  // 只添加有效的主应用路由（必须有 name）
  if (!to.name) {
    return;
  }

  // 动态导入 store 以避免循环依赖
  import('../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
    const process = useProcessStore();
    const currentApp = getCurrentAppFromPath(to.path);

    // 再次确认：只添加主应用的路由
    if (currentApp !== 'main') {
      return;
    }

    process.add({
      path: to.path,
      fullPath: to.fullPath,
      name: to.name as string,
      meta: to.meta as any,
    });
  });
});

export default router;
