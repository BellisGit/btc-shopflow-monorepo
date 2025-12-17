/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module 'virtual:eps' {
  export const service: Record<string, any>;
  export const list: any[];
  interface EpsModule {
    service: typeof service;
    list: typeof list;
    isUpdate?: boolean;
  }
  const eps: EpsModule;
  export default eps;
}

// 类型声明：支持子路径导入
declare module '@btc/shared-core/composables/subapp-lifecycle' {
  export * from '@btc/shared-core';
}

declare module '@btc/shared-utils/cdn/load-shared-resources' {
  export * from '@btc/shared-utils';
}

// 类型声明：@btc/shared-components（参考 layout-app 的方式）
declare module '@btc/shared-components' {
  // 重新导出所有命名导出
  export { getMenuRegistry, registerMenus, clearMenus, clearMenusExcept, getMenusForApp } from '../../../packages/shared-components/src/store/menuRegistry';
  export { useCurrentApp } from '../../../packages/shared-components/src/composables/useCurrentApp';
  export { useProcessStore, getCurrentAppFromPath } from '../../../packages/shared-components/src/store/process';
  export { useBrowser } from '../../../packages/shared-components/src/composables/useBrowser';
  export { useUser } from '../../../packages/shared-components/src/composables/useUser';
  export { provideContentHeight, useContentHeight } from '../../../packages/shared-components/src/composables/content-height';
  export { mountDevTools, unmountDevTools } from '../../../packages/shared-components/src/utils/mount-dev-tools';
  export { autoMountDevTools } from '../../../packages/shared-components/src/utils/auto-mount-dev-tools';
  export { default as mitt, globalMitt, Mitt } from '../../../packages/shared-components/src/utils/mitt';

  // 导出类型
  export type { MenuItem } from '../../../packages/shared-components/src/store/menuRegistry';
  export type { ProcessItem } from '../../../packages/shared-components/src/store/process';
  export type { UserInfo } from '../../../packages/shared-components/src/composables/useUser';

  // 导出组件（如果需要）
  export { default as AppLayout } from '../../../packages/shared-components/src/components/layout/app-layout/index.vue';
  export { default as AppSkeleton } from '../../../packages/shared-components/src/components/basic/app-skeleton/index.vue';

  // 导出其他可能需要的导出
  export * from '../../../packages/shared-components/src/index';
}

