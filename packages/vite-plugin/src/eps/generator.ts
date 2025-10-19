import axios from 'axios';
import _ from 'lodash';
import { createDir, error, readFile, writeFile } from '../utils';

// 全局变量
const service: any = {};
let epsList: any[] = [];

// EPS 数据缓存（移除，使用 index.ts 中的统一缓存）

/**
 * 获取 EPS 请求地址
 */
function getEpsUrl(epsUrl: string): string {
  return epsUrl || '/api/v1/eps';
}

/**
 * 获取 EPS 文件路径
 */
function getEpsPath(outputDir: string, filename?: string): string {
  return `${outputDir}/${filename || ''}`;
}

/**
 * 检查方法名是否合法
 */
function checkName(name: string): boolean {
  return Boolean(name && !['{', '}', ':'].some((e) => name.includes(e)));
}

/**
 * 格式化方法名，去除特殊字符
 */
function formatName(name: string): string {
  return (name || '').replace(/[:,\s,/,-]/g, '');
}

/**
 * 转换为驼峰命名
 */
function toCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 首字母大写
 */
function firstUpperCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 从远程获取 EPS 数据
 */
export async function fetchEpsData(epsUrl: string, reqUrl: string) {
  // 如果 reqUrl 是完整的 URL（包含协议），说明是直接请求后端，不需要重写
  // 如果 reqUrl 是空字符串或相对路径，说明是通过 Vite 代理，需要重写
  let processedEpsUrl = epsUrl;
  if (!reqUrl || reqUrl.startsWith('/')) {
    // 通过 Vite 代理时，去掉 /admin 前缀
    processedEpsUrl = epsUrl.startsWith('/admin') ? epsUrl.replace(/^\/admin/, '') : epsUrl;
  }
  const url = reqUrl + getEpsUrl(processedEpsUrl);

  try {
    console.log(`[EPS] Requesting: ${url}`);
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`[EPS] Response status: ${response.status}`);
    const { code, data, message } = response.data;

    if (code === 1000) {
      if (!_.isEmpty(data)) {
        // 处理嵌套的对象结构，如 { "system.iam": [...] }
        const entities: any[] = [];
        Object.entries(data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey // 保存模块键
              });
            });
          }
        });
        console.log(`[EPS] Loaded ${entities.length} entities`);
        return entities;
      }
    } else {
      error(`${message || 'Failed to fetch data'}`);
    }
  } catch (err) {
    // 简化错误日志，只显示关键信息
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log(`[EPS] API request failed: ${errorMessage}`);
    error(`API service is not running → ${url}`);
  }

  return [];
}

/**
 * 获取 EPS 数据（从缓存或本地文件）
 */
async function getData(epsUrl: string, _reqUrl: string, outputDir: string, cachedData?: any) {
  // 如果有缓存数据，直接使用
  if (cachedData && cachedData.list) {
    epsList = cachedData.list;
    console.log(`[EPS] 使用缓存数据，加载 ${epsList.length} 个实体`);
  } else {
    // 读取本地 eps.json
    epsList = (await readFile(getEpsPath(outputDir, 'eps.json'), true)) || [];

    // 如果没有 epsUrl，使用本地数据
    if (!epsUrl) {
      console.log('[EPS] 使用本地 Mock 数据模式');
      return;
    }

    // 静默使用本地数据，不打印日志
  }

  // 初始化处理，补全缺省字段
  epsList.forEach((e) => {
    if (!e.namespace) e.namespace = '';
    if (!e.api) e.api = [];
    if (!e.columns) e.columns = [];
    if (!e.pageColumns) e.pageColumns = [];
    if (!e.search) {
      e.search = {
        fieldEq: [],
        fieldLike: [],
        keyWordLikeFields: [],
      };
    }
  });
}

/**
 * 创建 eps.json 文件
 */
async function createJson(outputDir: string): Promise<boolean> {
  const data = epsList.map((e) => {
    return {
      prefix: e.prefix,
      name: e.name || '',
      api: e.api.map((apiItem: any) => ({
        name: apiItem.name,
        method: apiItem.method,
        path: apiItem.path,
      })),
      search: e.search,
    };
  });

  const content = JSON.stringify(data, null, 2);
  const localContent = await readFile(getEpsPath(outputDir, 'eps.json'));

  // 判断是否需要更新
  const isUpdate = content !== localContent;

  if (isUpdate) {
    await writeFile(getEpsPath(outputDir, 'eps.json'), content);
  }

  return isUpdate;
}

/**
 * 构建 service 对象树
 */
function createService(_epsUrl: string) {

  // 如果没有数据，直接返回错误
  if (epsList.length === 0) {
    console.error('[EPS] No entities found! EPS data fetch failed.');
    throw new Error('EPS data fetch failed - no entities available');
  }

  epsList.forEach((e) => {
    // 使用实体名作为服务键（小写，去除 Entity 后缀）
    const serviceKey = e.name ? e.name.toLowerCase().replace(/entity$/, '') : 'unknown';


    // 创建服务对象
    if (!service[serviceKey]) {
      // 直接使用prefix，不需要移除admin前缀
      const namespace = e.prefix || '';
      console.log(`[EPS Debug] Service: ${serviceKey}, Original prefix: ${e.prefix}, Final namespace: ${namespace}`);
      service[serviceKey] = {
        namespace: namespace,
        permission: {},
        _permission: {},
        search: e.search || {},
      };
    }

    // 创建方法
    if (e.api && Array.isArray(e.api)) {
      e.api.forEach((a: any) => {
        // 方法名：使用 api.name 或从 path 提取
        let methodName = a.name;
        if (!methodName && a.path) {
          methodName = a.path.replace(/^\//, '').replace(/\/.*$/, '');
        }


        if (methodName && !/[-:]/g.test(methodName)) {

          // 创建包含 API 信息的对象，而不是直接创建函数
          service[serviceKey][methodName] = {
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

    // 创建权限
    if (service[serviceKey].namespace) {
      Object.keys(service[serviceKey]).forEach((key) => {
        if (!['namespace', 'permission', '_permission', 'search'].includes(key)) {
          service[serviceKey].permission[key] = `${service[serviceKey].namespace}/${key}`.replace(/\//g, ':');
        }
      });
    }

    // console.log(`[EPS Service] Created service ${serviceKey}:`, Object.keys(service[serviceKey]));
  });
}

/**
 * 创建 service 代码
 */
function createServiceCode(): { content: string; types: string[] } {
  const types: string[] = [];
  let chain = '';

  /**
   * 递归处理 service 树，生成接口代码
   */
  function deep(d: any, k?: string) {
    if (!k) k = '';

    for (const i in d) {
      if (['swagger'].includes(i)) {
        continue;
      }

      const name = k + toCamel(firstUpperCase(formatName(i)));

      // 检查方法名
      if (!checkName(name)) continue;

      if (d[i].namespace) {
        // 查找配置
        const item = epsList.find((e) => (e.prefix || '') === `/${d[i].namespace}`);

        if (item) {
          let t = `{`;

          // 插入方法
          if (item.api) {
            item.api.forEach((a: any) => {
              // 方法名
              const n = toCamel(formatName(a.name || a.path.split('/').pop()!));

              // 检查方法名
              if (!checkName(n)) return;

              if (n) {
                // 方法描述
                t += `
                  /**
                   * ${a.summary || n}
                   */
                  ${n}(data?: any): Promise<any> {
                    return request({
                      url: "/${d[i].namespace}${a.path}",
                      method: "${(a.method || 'get').toUpperCase()}",
                      data,
                    });
                  },
                `;
              }
            });
          }

          t += `} as ${name}\n`;

          types.push(name);

          chain += `${formatName(i)}: ${t},\n`;
        }
      } else {
        chain += `${formatName(i)}: {`;
        deep(d[i], name);
        chain += `} as ${firstUpperCase(i)}Interface,`;

        types.push(`${firstUpperCase(i)}Interface`);
      }
    }
  }

  // 遍历 service 树
  deep(service);

  return {
    content: `{ ${chain} }`,
    types,
  };
}

/**
 * 创建类型描述文件
 */
async function createDescribe(outputDir: string) {
  // 简化的类型描述生成
  const text = `
    // Entity 接口定义
    ${epsList.map((item) => {
      if (!checkName(item.name)) return '';

      let t = `interface ${formatName(item.name)} {`;

      // 添加字段
      const columns = [...(item.columns || []), ...(item.pageColumns || [])];
      columns.forEach((col) => {
        t += `
          /**
           * ${col.comment || col.propertyName}
           */
          ${col.propertyName}?: any;
        `;
      });

      t += `
        /**
         * 任意键值
         */
        [key: string]: any;
      }
      `;

      return t;
    }).join('\n\n')}

    // Service 接口定义
    interface Service {
      request: (options: any) => Promise<any>;
      [key: string]: any;
    }
  `;

  const content = text.trim();
  const localContent = await readFile(getEpsPath(outputDir, 'eps.d.ts'));

  // 是否需要更新
  if (content !== localContent && epsList.length > 0) {
    await writeFile(getEpsPath(outputDir, 'eps.d.ts'), content);
  }
}

/**
 * 主入口：创建 eps 相关文件和 service
 */
export async function createEps(
  epsUrl: string,
  reqUrl: string,
  outputDir: string,
  cachedData?: any
) {
  // 创建 eps 目录
  createDir(getEpsPath(outputDir), true);

  // 获取 eps 数据
  await getData(epsUrl, reqUrl, outputDir, cachedData);

  // 构建 service 对象
  createService(epsUrl);

  const serviceCode = createServiceCode();

  // 创建 eps.json 文件
  const isUpdate = await createJson(outputDir);

  // 创建类型描述文件
  await createDescribe(outputDir);

  return {
    service,
    serviceCode,
    list: epsList,
    isUpdate,
  };
}

/**
 * 生成 EPS 服务代码（兼容旧接口）
 */
export async function generateEps(apiMeta: any, outputDir: string) {
  // 确保目录存在
  createDir(outputDir, true);

  // 转换为 EPS 数据格式
  const epsData: any = {};

  if (apiMeta.modules) {
    apiMeta.modules.forEach((module: any) => {
      if (module.entities) {
        module.entities.forEach((entity: any) => {
          const entityKey = entity.name.toLowerCase().replace(/entity$/, '');
          epsData[entityKey] = entity;
        });
      }
    });
  }

  // 创建 eps.json
  await writeFile(getEpsPath(outputDir, 'eps.json'), JSON.stringify(epsData, null, 2));

  return {
    success: true,
    message: 'EPS 服务代码生成成功',
    data: epsData,
  };
}
