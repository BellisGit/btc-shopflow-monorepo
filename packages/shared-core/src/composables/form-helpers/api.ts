/**
 * Form API 封装
 * 提供对 el-form 原生方法的访问
 */

export function useElApi(keys: string[], el: any) {
  const apis: Record<string, any> = {};

  keys.forEach((e) => {
    apis[e] = (...args: any[]) => {
      return el.value?.[e](...args);
    };
  });

  return apis;
}

