/**
 * 虚拟模块 virtual:eps 的类型声明
 *
 * 使用方式：
 * import epsData from 'virtual:eps';
 */

declare module 'virtual:eps' {
  interface ApiMethod {
    path: string;
    method: string;
    name: string;
    summary?: string;
  }

  interface ServiceModule {
    [key: string]: ApiMethod[];
  }

  const epsData: ServiceModule;
  export default epsData;
}
