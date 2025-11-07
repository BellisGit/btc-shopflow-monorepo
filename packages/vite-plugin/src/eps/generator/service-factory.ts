import { epsState, type EpsState } from './state';
import { checkName, firstUpperCase, formatName, toCamel } from './utils';

export function createService(_epsUrl: string, state: EpsState = epsState) {
  if (state.epsList.length === 0) {
    console.error('[eps] 未找到实体! eps 数据获取失败');
    throw new Error('EPS data fetch failed - no entities available');
  }

  state.epsList.forEach((e) => {
    const serviceKey = e.name ? e.name.toLowerCase().replace(/entity$/, '') : 'unknown';

    const prefix = e.prefix || '';
    const pathParts = prefix.split('/').filter((part: string) => part && part !== 'admin' && part !== 'api');

    let currentLevel = state.service;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    }

    const finalKey = pathParts[pathParts.length - 1] || serviceKey;
    if (!currentLevel[finalKey]) {
      currentLevel[finalKey] = {
        namespace: prefix,
        permission: {},
        _permission: {},
        search: e.search || {},
      };
    }

    if (e.api && Array.isArray(e.api)) {
      e.api.forEach((a: any) => {
        let methodName = a.name;
        if (!methodName && a.path) {
          methodName = a.path.replace(/^\//, '').replace(/\/.*$/, '');
        }

        if (methodName && !/[-:]/g.test(methodName)) {
          currentLevel[finalKey][methodName] = {
            path: a.path,
            method: a.method,
            name: a.name,
            module: a.module,
            ignoreToken: a.ignoreToken,
            action: a.action,
            auth: a.auth,
            permission: a.permission,
            summary: a.summary,
            tag: a.tag,
            dts: a.dts
          };
        }
      });
    }

    if (currentLevel[finalKey].namespace) {
      Object.keys(currentLevel[finalKey]).forEach((key) => {
        if (!['namespace', 'permission', '_permission', 'search'].includes(key)) {
          currentLevel[finalKey].permission[key] = `${currentLevel[finalKey].namespace}/${key}`.replace(/\//g, ':');
        }
      });
    }
  });
}

export function createServiceCode(state: EpsState = epsState): { content: string; types: string[] } {
  const types: string[] = [];
  let chain = '';

  function deep(d: any, k?: string, visited: WeakSet<object> = new WeakSet()) {
    if (!d || typeof d !== 'object' || d === null) {
      return;
    }

    if (visited.has(d)) {
      return;
    }

    visited.add(d);

    if (!k) k = '';

    for (const i in d) {
      if (['swagger'].includes(i)) {
        continue;
      }

      const value = d[i];
      if (!value || typeof value !== 'object' || value === null) {
        continue;
      }

      if (visited.has(value)) {
        continue;
      }

      const name = k + toCamel(firstUpperCase(formatName(i)));

      if (!checkName(name)) continue;

      if (value.namespace) {
        const normalizedNs = value.namespace.startsWith('/') ? value.namespace : `/${value.namespace}`;
        const item = state.epsList.find((e) => {
          const normalizedPrefix = (e.prefix || '').startsWith('/') ? (e.prefix || '') : `/${e.prefix || ''}`;
          return normalizedPrefix === normalizedNs;
        });

        if (item) {
          let t = `{`;

          if (item.api) {
            item.api.forEach((a: any) => {
              const n = toCamel(formatName(a.name || a.path.split('/').pop()!));

              if (!checkName(n)) return;

              if (n) {
                const normalizedNamespace = value.namespace.replace(/\/$/, '');
                const normalizedPath = a.path.startsWith('/') ? a.path : `/${a.path}`;
                const fullPath = `${normalizedNamespace}${normalizedPath}`;

                let urlPath = `"${fullPath}"`;
                let requestData = 'data';
                const methodLower = (a.method || 'get').toLowerCase();
                const payloadKey = ['post', 'put', 'patch'].includes(methodLower) ? 'data' : 'params';

                if (n.toLowerCase().includes('delete')) {
                  if (a.path.includes('{id}')) {
                    urlPath = `"${fullPath}".replace(/{id}/g, Array.isArray(data) ? data[0] : data)`;
                    requestData = 'undefined';
                  } else if (n.toLowerCase().includes('batch')) {
                    urlPath = `"${fullPath}"`;
                    requestData = 'data';
                  }
                }

                t += `
                  /**
                   * ${a.summary || n}
                   */
                  ${n}(data) {
                    return request({
                      url: ${urlPath},
                      method: "${(a.method || 'get').toUpperCase()}",
                      ${requestData === 'undefined' ? '' : `${payloadKey}: ${requestData},`}
                    });
                  },
                `;
              }
            });
          }

          t += `}\n`;

          types.push(name);

          chain += `${formatName(i)}: ${t},\n`;
        }
      } else {
        chain += `${formatName(i)}: {`;
        deep(value, name, visited);
        chain += `},`;

        types.push(`${firstUpperCase(i)}Interface`);
      }
    }
  }

  deep(state.service);

  return {
    content: `{ ${chain} }`,
    types,
  };
}
