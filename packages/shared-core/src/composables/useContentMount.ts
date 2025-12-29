import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { isMainApp as getIsMainApp } from '@configs/unified-env-config';

/**
 * 内容挂载类型
 */
export type ContentMountType = 'main-app' | 'sub-app';

/**
 * 内容挂载状态
 */
export interface ContentMountState {
  /** 当前挂载类型（一次判断确定） */
  type: ComputedRef<ContentMountType>;
  /** 是否显示主应用路由视图 */
  showMainApp: ComputedRef<boolean>;
  /** 是否显示子应用挂载点 */
  showSubApp: ComputedRef<boolean>;
  /** 子应用挂载点引用（用于设置 ref） */
  subappViewportRef: Ref<HTMLElement | null>;
}

/**
 * 统一的内容挂载状态管理
 *
 * 一次判断确定状态，避免多次判断
 * 统一处理开发环境、生产环境、qiankun 模式、layout-app 模式、独立运行模式
 */
export function useContentMount(): ContentMountState {
  const route = useRoute();

  // 子应用挂载点引用（用于检查是否有子应用实际挂载）
  const subappViewportRef = ref<HTMLElement | null>(null);

  // 判断是否正在使用 layout-app
  const isUsingLayoutApp = computed(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!(window as any).__USE_LAYOUT_APP__;
  });

  // 判断是否是 layout-app 自己运行
  const isLayoutAppSelf = computed(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!(window as any).__IS_LAYOUT_APP__;
  });

  // 判断是否为主应用（一次判断确定）
  // 使用统一配置中的 isMainApp 函数，避免重复判断
  const isMainAppRoute = computed(() => {
    // 如果路由 meta 中明确标记为 isSubApp，直接返回 false（子应用）
    if (route.meta?.isSubApp === true) {
      return false;
    }

    // 优先使用 window.location.pathname，因为它包含完整的路径
    // route.path 在 qiankun 模式下可能只匹配到 /logistics，而不是完整的 /logistics/warehouse/inventory/info
    const locationPath = typeof window !== 'undefined' ? window.location.pathname : route.path;
    const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

    const result = getIsMainApp(route.path, locationPath, isStandalone);
    return result;
  });

  // 判断当前挂载类型（一次判断确定）
  const type = computed<ContentMountType>(() => {
    // layout-app 模式下，始终显示子应用挂载点
    if (isUsingLayoutApp.value || isLayoutAppSelf.value) {
      return 'sub-app';
    }

    // 核心原则：基于路由判断，不检查 DOM 内容（避免延迟判断导致的问题）
    // 如果是主应用路由，直接返回 'main-app'
    if (isMainAppRoute.value) {
      return 'main-app';
    }

    // 不是主应用路由，返回 'sub-app'
    return 'sub-app';
  });

  // 是否显示主应用路由视图
  const showMainApp = computed(() => {
    return type.value === 'main-app';
  });

  // 是否显示子应用挂载点
  // 核心原则：主应用和子应用互斥，基于 type 判断
  const showSubApp = computed(() => {
    // layout-app 模式下，始终显示子应用挂载点（layout-app 只负责子应用）
    if (isUsingLayoutApp.value || isLayoutAppSelf.value) {
      return true;
    }

    // 其他模式：基于 type 判断，确保互斥
    // type === 'main-app' → 只显示主应用，隐藏子应用挂载点
    // type === 'sub-app' → 只显示子应用挂载点，隐藏主应用
    return type.value === 'sub-app';
  });


  return {
    type,
    showMainApp,
    showSubApp,
    subappViewportRef,
  };
}

