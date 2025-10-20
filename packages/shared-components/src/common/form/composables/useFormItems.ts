/**
 * 表单项管理工具
 */

// Helpers
export function cloneDeep(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(cloneDeep);
  const cloned = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = cloneDeep(obj[key]);
    }
  }
  return cloned;
}

export function isBoolean(val: any): val is boolean {
  return typeof val === 'boolean';
}

export function isFunction(val: any): val is (...args: any[]) => any {
  return typeof val === 'function';
}

/**
 * 判断是否隐藏
 */
export function parseHidden(value: any, scope: any) {
  if (isBoolean(value)) {
    return value;
  } else if (isFunction(value)) {
    return value({ scope });
  }
  return false;
}

/**
 * 折叠表单项
 */
export function collapseItem(item: any) {
  item.collapse = !item.collapse;
}

/**
 * 转换表单值
 */
export function invokeData(d: any) {
  for (const i in d) {
    if (i.includes('-')) {
      const [a, ...arr] = i.split('-');
      const k: string = arr.pop() || '';

      if (!d[a]) {
        d[a] = {};
      }

      let f: any = d[a];

      arr.forEach((e) => {
        if (!f[e]) {
          f[e] = {};
        }
        f = f[e];
      });

      f[k] = d[i];
      delete d[i];
    }
  }
}
