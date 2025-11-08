import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
} from 'vue-router';
import Layout from '../modules/base/components/layout/index.vue';
import { config } from '../config';
import { tSync } from '../i18n/getters';
import { useProcessStore, getCurrentAppFromPath } from '../store/process';

const routes: RouteRecordRaw[] = [
  // 登录页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/login',
    name: 'Login',
    component: () => import('@auth/login/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login'
    }
  },
  // 忘记密码页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('@auth/forget-password/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login.password.forgot'
    }
  },
  // 注册页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/register',
    name: 'Register',
    component: () => import('@auth/register/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.register'
    }
  },
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
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../pages/profile/index.vue'),
        meta: { titleKey: 'common.profile' },
      },
      // 测试功能
      {
        path: 'test/components',
        name: 'TestComponents',
        component: () => import('../pages/test/components/index.vue'),
        meta: { titleKey: 'menu.test_features.components' },
      },
      // EPS 测试页面已删除
      // {
      //   path: 'test/eps',
      //   name: 'TestEps',
      //   component: () => import('../test-eps.vue'),
      //   meta: { titleKey: 'menu.test_features.eps' },
      // },
      {
        path: 'test/api-test-center',
        name: 'ApiTestCenter',
        component: () => import('../pages/test/api-test-center/index.vue'),
        meta: { titleKey: 'menu.test_features.api_test_center' },
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
        component: () => import('../modules/platform/views/domains/index.vue'),
        meta: { titleKey: 'menu.platform.domains' },
      },
      {
        path: 'platform/modules',
        name: 'Modules',
        component: () => import('../modules/platform/views/modules/index.vue'),
        meta: { titleKey: 'menu.platform.modules' },
      },
      {
        path: 'platform/plugins',
        name: 'Plugins',
        component: () => import('../modules/platform/views/plugins/index.vue'),
        meta: { titleKey: 'menu.platform.plugins' },
      },
      // 组织与账号
      {
        path: 'org/tenants',
        name: 'Tenants',
        component: () => import('../modules/org/views/tenants/index.vue'),
        meta: { titleKey: 'menu.org.tenants' },
      },
      {
        path: 'org/departments',
        name: 'Departments',
        component: () => import('../modules/org/views/departments/index.vue'),
        meta: { titleKey: 'menu.org.departments' },
      },
      {
        path: 'org/departments/:id/roles',
        name: 'DeptRoleBind',
        component: () => import('../modules/org/views/dept-role-bind/index.vue'),
        meta: { titleKey: 'menu.org.dept_role_bind' },
      },
      {
        path: 'org/users',
        name: 'Users',
        component: () => import('../modules/org/views/users/index.vue'),
        meta: { titleKey: 'menu.org.users' },
      },
      {
        path: 'org/users/:id/roles',
        name: 'UserRoleAssign',
        component: () => import('../modules/org/views/user-role-assign/index.vue'),
        meta: { titleKey: 'menu.org.user_role_assign' },
      },
      // 访问控制
      {
        path: 'access/resources',
        name: 'Resources',
        component: () => import('../modules/access/views/resources/index.vue'),
        meta: { titleKey: 'menu.access.resources' },
      },
      {
        path: 'access/actions',
        name: 'Actions',
        component: () => import('../modules/access/views/actions/index.vue'),
        meta: { titleKey: 'menu.access.actions' },
      },
      {
        path: 'access/permissions',
        name: 'Permissions',
        component: () => import('../modules/access/views/permissions/index.vue'),
        meta: { titleKey: 'menu.access.permissions' },
      },
      {
        path: 'access/roles',
        name: 'Roles',
        component: () => import('../modules/access/views/roles/index.vue'),
        meta: { titleKey: 'menu.access.roles' },
      },
      {
        path: 'access/roles/:id/permissions',
        name: 'RolePermBind',
        component: () => import('../modules/access/views/role-perm-bind/index.vue'),
        meta: { titleKey: 'menu.access.role_perm_bind' },
      },
      {
        path: 'strategy/management',
        name: 'StrategyManagement',
        component: () => import('../modules/strategy/views/management/index.vue'),
        meta: { titleKey: 'menu.strategy.management' },
      },
      {
        path: 'strategy/designer',
        name: 'StrategyDesigner',
        component: () => import('../modules/strategy/views/designer/index.vue'),
        meta: { titleKey: 'menu.strategy.designer' },
      },
      {
        path: 'strategy/monitor',
        name: 'StrategyMonitor',
        component: () => import('../modules/strategy/views/monitor/index.vue'),
        meta: { titleKey: 'menu.strategy.monitor' },
      },
      {
        path: 'access/perm-compose',
        name: 'PermCompose',
        component: () => import('../modules/access/views/perm-compose/index.vue'),
        meta: { titleKey: 'menu.access.perm_compose' },
      },
      // 导航与可见性
      {
        path: 'navigation/menus',
        name: 'Menus',
        component: () => import('../modules/navigation/views/menus/index.vue'),
        meta: { titleKey: 'menu.navigation.menus' },
      },
      {
        path: 'navigation/menus/:id/permissions',
        name: 'MenuPermBind',
        component: () => import('../modules/navigation/views/menu-perm-bind/index.vue'),
        meta: { titleKey: 'menu.navigation.menu_perm_bind' },
      },
      {
        path: 'navigation/menus/preview',
        name: 'MenuPreview',
        component: () => import('../modules/navigation/views/menu-preview/index.vue'),
        meta: { titleKey: 'menu.navigation.menu_preview' },
      },
      // 运维与审计
      {
        path: 'ops/logs/operation',
        name: 'OperationLog',
        component: () => import('../modules/ops/views/logs/operation/index.vue'),
        meta: { titleKey: 'menu.ops.operation_log' },
      },
      {
        path: 'ops/logs/request',
        name: 'RequestLog',
        component: () => import('../modules/ops/views/logs/request/index.vue'),
        meta: { titleKey: 'menu.ops.request_log' },
      },
      {
        path: 'data/files/list',
        name: 'DataFilesList',
        component: () => import('../modules/data/views/files/list/index.vue'),
        meta: { titleKey: 'menu.data.files.list' },
      },
      {
        path: 'data/files/templates',
        name: 'DataFilesTemplates',
        component: () => import('../modules/data/views/files/templates/index.vue'),
        meta: { titleKey: 'menu.data.files.templates' },
      },
      {
        path: 'data/files/preview',
        name: 'DataFilesPreview',
        component: () => import('../modules/data/views/files/preview/index.vue'),
        meta: { titleKey: 'menu.data.files.preview' },
      },
      {
        path: 'data/recycle',
        name: 'DataRecycle',
        component: () => import('../modules/data/views/recycle/index.vue'),
        meta: { titleKey: 'menu.data.recycle' },
      },
      {
        path: 'ops/baseline',
        name: 'Baseline',
        component: () => import('../modules/ops/views/baseline/index.vue'),
        meta: { titleKey: 'menu.ops.baseline' },
      },
      {
        path: 'ops/api-list',
        name: 'OpsApiList',
        component: () => import('../modules/ops/views/api-list/index.vue'),
        meta: { titleKey: 'menu.ops.api_list' },
      },
      {
        path: 'ops/simulator',
        name: 'Simulator',
        component: () => import('../modules/ops/views/simulator/index.vue'),
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
    meta: { title: 'Logistics App', isSubApp: true }, // 标记为子应用路由
  },
  {
    path: '/engineering',
    component: Layout,
    meta: { title: 'Engineering App', isHome: true, isSubApp: true },
  },
  {
    path: '/engineering/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Engineering App', isSubApp: true }, // 标记为子应用路由
  },
  {
    path: '/quality',
    component: Layout,
    meta: { title: 'Quality App', isHome: true, isSubApp: true },
  },
  {
    path: '/quality/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Quality App', isSubApp: true }, // 标记为子应用路由
  },
  {
    path: '/production',
    component: Layout,
    meta: { title: 'Production App', isHome: true, isSubApp: true },
  },
  {
    path: '/production/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Production App', isSubApp: true }, // 标记为子应用路由
  },
];

// 不再需要 localeMessages，直接使用 tSync

// 已删除：路径到i18n键的映射表（改用 meta.titleKey，单一事实来源）

// 使用 tSync 函数替代 getTranslation

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
    const translatedTitle = tSync(titleKey);

    // 如果返回的是键值本身，说明国际化还没加载完成，延迟重试
    if (translatedTitle === titleKey) {
      // 先设置默认标题，避免显示 key
      document.title = config.app.name;

      // 多次重试翻译，确保国际化加载完成
      const retryTranslation = (attempt: number = 1) => {
        if (attempt > 5) return; // 最多重试5次

        setTimeout(() => {
          const retryTitle = tSync(titleKey);
          if (retryTitle !== titleKey) {
            document.title = retryTitle;
          } else {
            // 继续重试
            retryTranslation(attempt + 1);
          }
        }, attempt * 100); // 递增延迟：100ms, 200ms, 300ms, 400ms, 500ms
      };

      retryTranslation();
    } else {
      // 翻译成功，直接设置标题
      document.title = translatedTitle;
    }
  } else {
    // 回退到系统名称
    document.title = config.app.name;
  }
}

/**
 * 监听语言切换，更新浏览器标题（同步方式）
 */
export function setupI18nTitleWatcher() {
  // 监听 localStorage 中的语言变化（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === 'locale' && currentRoute) {
      // 语言切换时，同步更新当前页面的标题
      updateDocumentTitle(currentRoute);
    }
  });

  // 监听自定义事件（同一标签页的语言切换）
  window.addEventListener('language-change', () => {
    if (currentRoute) {
      // 延迟一点时间，确保 i18n 已经更新
      setTimeout(() => {
        updateDocumentTitle(currentRoute!);
      }, 50);
    }
  });
}

// 路由前置守卫：处理 Loading 显示和侧边栏
router.beforeEach((to, from) => {
  // 检查是否为文档相关路由（只支持 /docs 前缀）
  const isDocsRoute = to.path === '/docs' || to.path.startsWith('/docs/');

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
  const wasDocsRoute = from.path === '/docs' || from.path.startsWith('/docs/');

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
    const process = useProcessStore();
    process.list.forEach((tab) => {
      tab.active = false;
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
  const isSubAppRoute = ['/logistics', '/engineering', '/quality', '/production'].some((prefix) =>
    fullPath.startsWith(prefix)
  );

  if (isSubAppRoute) {
    return;
  }

  // 只添加有效的主应用路由（必须有 name）
  if (!to.name) {
    return;
  }

  // 使用 store 添加路由到标签页
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

export default router;
