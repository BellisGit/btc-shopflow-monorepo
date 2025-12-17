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

// 类型声明：vue-router
declare module 'vue-router' {
  export type Router = any;
  export type RouteRecordRaw = any;
  export function createRouter(...args: any[]): Router;
  export function createWebHistory(...args: any[]): any;
  export function createMemoryHistory(...args: any[]): any;
  export function createWebHashHistory(...args: any[]): any;
  export function useRoute(): any;
  export function useRouter(): Router;
  export interface RouteLocationNormalizedLoaded { [key: string]: any }
}

// 类型声明：@btc/shared-components
declare module '@btc/shared-components' {
  export * from '../../../packages/shared-components/src';
}

