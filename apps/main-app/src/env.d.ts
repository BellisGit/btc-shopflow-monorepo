/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DOCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module 'virtual:svg-icons' {
  const content: string;
  export default content;
}

declare module 'virtual:ctx' {
  interface CtxData {
    modules?: string[];
    serviceLang?: string;
  }
  const ctx: CtxData;
  export default ctx;
}

declare module 'virtual:eps' {
  const service: any; // EPS 自动生成的服务树
  export default service;
}

declare module 'virtual:eps-json' {
  const data: any[]; // EPS 原始数据列表
  export default data;
}
