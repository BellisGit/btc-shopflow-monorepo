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
    const response = await axios.get(url, {
      timeout: 5000
    });

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
        return entities;
      }
    } else {
      error(`${message || 'Failed to fetch data'}`);
    }
  } catch (err) {
    // 简化错误日志，只显示关键信息
    error(`API service is not running → ${url}`);
  }

  return [];
}

/**
 * 获取 EPS 数据（从缓存或本地文件）
 */
async function getData(epsUrl: string, _reqUrl: string, outputDir: string, cachedData?: any) {
  if (cachedData && cachedData.list) {
    epsList = cachedData.list;
  } else {
    // 读取本地 eps.json（扁平化的实体数组格式）
    const localData = await readFile(getEpsPath(outputDir, 'eps.json'), true);

    if (localData) {
      // 检查是否是新的扁平化格式（数组）
      if (Array.isArray(localData)) {
        epsList = localData;
      } 
      // 兼容旧的 API 响应格式
      else if (localData.data) {
        const entities: any[] = [];
        Object.entries(localData.data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey
              });
            });
          }
        });
        epsList = entities;
      } else {
        epsList = [];
      }
    } else {
      epsList = [];
    }

    if (!epsUrl) {
      return;
    }
  }

  // 初始化处理，补全缺省字段
  epsList.forEach((e) => {
    // 如果没有namespace，使用prefix作为namespace
    if (!e.namespace) e.namespace = e.prefix || '';
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
  // 直接存储扁平化的实体数组，供 createService 函数使用
  const content = JSON.stringify(epsList, null, '\t');
  const localContent = await readFile(getEpsPath(outputDir, 'eps.json'));

  const isUpdate = content !== localContent;

  if (isUpdate) {
    writeFile(getEpsPath(outputDir, 'eps.json'), content);
  }

  return isUpdate;
}

/**
 * 构建 service 对象树
 */
function createService(_epsUrl: string) {

  // 如果没有数据，直接返回错误
  if (epsList.length === 0) {
    console.error('[eps] 未找到实体! eps 数据获取失败');
    throw new Error('EPS data fetch failed - no entities available');
  }

  epsList.forEach((e) => {
    // 使用实体名作为服务键（小写，去除 Entity 后缀）
    const serviceKey = e.name ? e.name.toLowerCase().replace(/entity$/, '') : 'unknown';

    // 根据 prefix 构建完整的服务路径
    // 例如: "admin/system/log/sys/operation" -> ["system", "log", "sys", "operation"]
    const prefix = e.prefix || '';
    const pathParts = prefix.split('/').filter((part: string) => part && part !== 'admin');
    
    // 构建嵌套的服务对象
    let currentLevel = service;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    }

    // 在最后一层创建服务对象
    const finalKey = pathParts[pathParts.length - 1] || serviceKey;
    if (!currentLevel[finalKey]) {
      currentLevel[finalKey] = {
        namespace: prefix,
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

    // 创建权限
    if (currentLevel[finalKey].namespace) {
      Object.keys(currentLevel[finalKey]).forEach((key) => {
        if (!['namespace', 'permission', '_permission', 'search'].includes(key)) {
          currentLevel[finalKey].permission[key] = `${currentLevel[finalKey].namespace}/${key}`.replace(/\//g, ':');
        }
      });
    }

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
  function deep(d: any, k?: string, visited: WeakSet<object> = new WeakSet()) {
    // 基本检查：如果不是对象或已访问过，直接返回
    if (!d || typeof d !== 'object' || d === null) {
      return;
    }
    
    // 循环检测：如果已经访问过此对象，跳过（防止循环引用）
    if (visited.has(d)) {
      return;
    }
    
    // 标记当前对象为已访问
    visited.add(d);

    if (!k) k = '';

    for (const i in d) {
      if (['swagger'].includes(i)) {
        continue;
      }

      // 检查属性值是否存在且为对象
      const value = d[i];
      if (!value || typeof value !== 'object' || value === null) {
        continue;
      }

      // 检查是否已访问过此属性值（防止循环引用）
      if (visited.has(value)) {
        continue;
      }

      const name = k + toCamel(firstUpperCase(formatName(i)));

      // 检查方法名
      if (!checkName(name)) continue;

      if (value.namespace) {
        // 查找配置
        const item = epsList.find((e) => (e.prefix || '') === `/${value.namespace}`);

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
                // 处理删除方法的特殊逻辑
                let urlPath = `"/${value.namespace}${a.path}"`;
                let requestData = 'data';

                // 如果是删除方法，需要特殊处理
                if (n.toLowerCase().includes('delete')) {
                  if (a.path.includes('{id}')) {
                    // 单个删除：替换 {id} 为实际 ID
                    urlPath = `\`/${value.namespace}\${a.path.replace(/{id}/g, "\${Array.isArray(data) ? data[0] : data}")}\``;
                    requestData = 'undefined'; // 删除方法不需要请求体
                  } else if (n.toLowerCase().includes('batch')) {
                    // 批量删除：直接使用路径，数据作为请求体
                    urlPath = `"/${value.namespace}${a.path}"`;
                    requestData = 'data'; // 批量删除需要请求体
                  }
                }

                // 方法描述
                t += `
                  /**
                   * ${a.summary || n}
                   */
                  ${n}(data?: any): Promise<any> {
                    return request({
                      url: ${urlPath},
                      method: "${(a.method || 'get').toUpperCase()}",
                      data: ${requestData},
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
        // 递归处理嵌套对象，传递 visited Set
        chain += `${formatName(i)}: {`;
        deep(value, name, visited);
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
    // Entity interface definitions
    ${epsList.map((item) => {
      if (!checkName(item.name)) return '';

      let t = `interface ${formatName(item.name)} {`;

      // Add fields
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
         * Any key-value pairs
         */
        [key: string]: any;
      }
      `;

      return t;
    }).join('\n\n')}

    // Service interface definitions
    interface Service {
      request: (options: any) => Promise<any>;
      [key: string]: any;
    }
  `;

  const content = text.trim();
  const localContent = await readFile(getEpsPath(outputDir, 'eps.d.ts'));

  // 是否需要更新
  if (content !== localContent && epsList.length > 0) {
    writeFile(getEpsPath(outputDir, 'eps.d.ts'), content);
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
  writeFile(getEpsPath(outputDir, 'eps.json'), JSON.stringify(epsData, null, 2));

  return {
    success: true,
    message: 'EPS 服务代码生成成功',
    data: epsData,
  };
}
