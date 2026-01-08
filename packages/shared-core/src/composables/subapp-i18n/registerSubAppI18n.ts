/**
 * 子应用国际化注册工具
 * 用于从 config.ts 提取国际化配置并注册到主应用
 * 让主应用能够访问子应用的国际化配置（特别是 app 和 menu 部分）
 */

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 判断对象是否是扁平化对象（包含点号分隔的键）
 */
function isFlatObject(obj: any): boolean {
  if (!isObject(obj)) {
    return false;
  }
  // 检查是否有键包含点号
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key.includes('.')) {
      return true;
    }
  }
  return false;
}

/**
 * 将嵌套对象转换为扁平化对象
 * 支持多层嵌套，如 { app: { loading: { title: "..." } } } -> { "app.loading.title": "..." }
 */
function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  // 如果 obj 本身是字符串，直接设置
  if (typeof obj === 'string' && prefix) {
    result[prefix] = obj;
    return result;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 优先检查 'source' 键（Vue I18n 编译后的函数消息）
        // 如果对象包含 'source' 键，直接提取字符串，不生成 .source 后缀的 key
        // 注意：必须使用 hasOwnProperty 检查，因为 'source' 可能不在对象自身属性中
        if (Object.prototype.hasOwnProperty.call(value, 'source') && typeof value.source === 'string') {
          // 调试日志：检查是否生成了 .source 后缀的 key
          if (newKey.includes('menu.') && import.meta.env.DEV) {
            console.log(`[flattenObject] ✅ 提取 source: ${newKey} = ${value.source}`);
          }
          result[newKey] = value.source;
          continue; // 跳过递归处理，避免生成 menu.procurement_module.source 这样的 key
        }
        // 使用 'in' 操作符检查（包括继承属性）
        if ('source' in value && typeof value.source === 'string') {
          // 调试日志：检查是否生成了 .source 后缀的 key
          if (newKey.includes('menu.') && import.meta.env.DEV) {
            console.log(`[flattenObject] ✅ 提取 source (in): ${newKey} = ${value.source}`);
          }
          result[newKey] = value.source;
          continue; // 跳过递归处理，避免生成 menu.procurement_module.source 这样的 key
        }
        // 如果对象包含 '_' 键，将其值设置为父键的值（用于一级菜单显示）
        // 注意：设置后需要继续处理其他子键，不能直接 continue
        if ('_' in value && typeof value._ === 'string') {
          result[newKey] = value._;
          // 不 continue，继续处理其他子键（如 domains、modules 等）
        }
        // 递归处理嵌套对象（跳过 '_' 和 'source' 键以及元数据键）
        for (const subKey in value) {
          if (subKey !== '_' && subKey !== 'source' && Object.prototype.hasOwnProperty.call(value, subKey)) {
            // 跳过元数据键
            if (!['loc', 'key', 'type'].includes(subKey)) {
              // 调试日志：检查递归处理
              if (newKey.includes('menu.') && subKey === 'source' && import.meta.env.DEV) {
                console.warn(`[flattenObject] ⚠️ 递归处理 source 键: ${newKey}.${subKey}`, value);
              }
              flattenObject(value[subKey], `${newKey}.${subKey}`, result);
            }
          }
        }
      } else if (value !== null && value !== undefined) {
        // 处理各种类型的值
        if (typeof value === 'string') {
          result[newKey] = value;
        } else if (typeof value === 'function') {
          // Vue I18n 编译时优化，某些消息会被编译为函数
          // 优先从 loc.source 获取原始消息模板（最可靠的方法，避免复杂的函数调用）
          const locSource = (value as any).loc?.source;
          if (typeof locSource === 'string') {
            result[newKey] = locSource;
          } else {
            // 如果没有 loc.source，尝试从其他可能的属性获取
            const possibleSources = [
              (value as any).source,
              (value as any).message,
              (value as any).template,
            ];

            const source = possibleSources.find(s => typeof s === 'string');
            if (source) {
              result[newKey] = source;
            } else {
              // 尝试调用函数获取字符串（Vue I18n 的 AST 格式函数）
              try {
                const functionResult = value({ normalize: (arr: any[]) => arr[0] });
                if (typeof functionResult === 'string' && functionResult.trim() !== '') {
                  result[newKey] = functionResult;
                }
                // 如果调用失败或返回非字符串，静默跳过（这些消息在运行时会被 Vue I18n 正确处理）
              } catch {
                // 如果函数调用失败，静默跳过（这些消息在运行时会被 Vue I18n 正确处理）
              }
            }
          }
        } else {
          // 其他类型转换为字符串（但应该避免这种情况）
          result[newKey] = String(value);
        }
      }
    }
  }
  return result;
}

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 * 特殊处理：如果 key 以 .source 结尾，将其值直接设置为父键的值
 * 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
 * 这样可以避免在字符串上创建属性的错误
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  // 按键的深度排序：先处理深度更深的键（子键），再处理深度较浅的键（父键）
  // 这样可以确保在处理子键时，父键还没有被设置为字符串
  const sortedKeys = Object.keys(flat).sort((a, b) => {
    const depthA = a.split('.').length;
    const depthB = b.split('.').length;
    // 深度更深的键排在前面
    if (depthA !== depthB) {
      return depthB - depthA;
    }
    // 如果深度相同，按字母顺序排序
    return a.localeCompare(b);
  });

  for (const key of sortedKeys) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      // 处理 .source 后缀的 key（如 menu.procurement_module.source -> menu.procurement_module）
      if (key.endsWith('.source')) {
        const parentKey = key.slice(0, -7); // 移除 '.source'
        const keys = parentKey.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串，需要转换为对象
            const stringValue = current[k];
            current[k] = { _: stringValue };
          }
          current = current[k];
        }

        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          current = {};
        }
        const lastKey = keys[keys.length - 1];
        // 如果目标键已经存在且是对象，将值设置到 _ 键中（但 source 键应该直接覆盖）
        // 如果目标键不存在或是字符串，直接设置字符串值
        if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
          // 如果已经是对象，直接覆盖（source 键的优先级更高）
          current[lastKey] = flat[key];
        } else {
          current[lastKey] = flat[key];
        }
      } else if (key.endsWith('._')) {
        // 处理 ._ 后缀的 key（如 menu.procurement_module._ -> menu.procurement_module）
        const parentKey = key.slice(0, -2); // 移除 '._'
        const keys = parentKey.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串，需要转换为对象
            const stringValue = current[k];
            current[k] = { _: stringValue };
          }
          current = current[k];
        }

        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          current = {};
        }
        const lastKey = keys[keys.length - 1];
        // 如果目标键已经存在且是对象，将值设置到 _ 键中
        // 如果目标键不存在或是字符串，直接设置字符串值
        if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
          current[lastKey]._ = flat[key];
        } else {
          current[lastKey] = flat[key];
        }
      } else {
        const keys = key.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            // 如果 current 不是对象，这不应该发生，但为了安全起见，创建一个新对象
            current = {};
          }
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串（可能是从 _ 键设置的），需要转换为对象
            // 将字符串值保存到 _ 键中，然后创建新对象
            const stringValue = current[k];
            current[k] = { _: stringValue };
          }
          current = current[k];
        }

        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          // 如果 current 不是对象，这不应该发生，但为了安全起见，创建一个新对象
          current = {};
        }
        const lastKey = keys[keys.length - 1];
        
        // 如果目标键已经存在且是对象，说明已经有子键被处理了
        // 在这种情况下，当前值（从 _ 键来的）应该设置到 _ 键中
        if (lastKey in current && typeof current[lastKey] === 'object' && current[lastKey] !== null) {
          // 如果目标键已经是对象（因为有子键），将值设置到 _ 键中
          current[lastKey]._ = flat[key];
        } else if (lastKey in current && typeof current[lastKey] === 'string') {
          // 如果目标键已经是字符串，但存在子键，需要转换为对象
          // 检查是否存在以当前键为前缀的其他键（子键）
          const hasChildKeys = sortedKeys.some(otherKey => {
            if (otherKey === key) return false;
            // 检查 otherKey 是否以 key + '.' 开头
            return otherKey.startsWith(key + '.');
          });
          
          if (hasChildKeys) {
            // 如果存在子键，将字符串值保存到 _ 键中，然后创建新对象
            const stringValue = current[lastKey];
            current[lastKey] = { _: stringValue };
            // 注意：子键应该已经被处理了（因为按深度排序），所以这里不需要再设置
          } else {
            // 如果不存在子键，直接覆盖
            current[lastKey] = flat[key];
          }
        } else {
          // 目标键不存在，直接设置
          current[lastKey] = flat[key];
        }
      }
    }
  }

  return result;
}

/**
 * 从 config.ts 文件中提取并合并国际化配置
 * @param configFiles 通过 import.meta.glob 加载的 config.ts 文件
 * @returns 扁平化的国际化消息对象 { 'zh-CN': {...}, 'en-US': {...} }
 */
function extractI18nFromConfigFiles(
  configFiles: Record<string, { default: any }>
): { 'zh-CN': Record<string, string>; 'en-US': Record<string, string> } {
  let mergedZhCN: any = {
    app: {},
    menu: {},
    page: {},
    common: {},
  };
  let mergedEnUS: any = {
    app: {},
    menu: {},
    page: {},
    common: {},
  };

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...} }, 'en-US': {...} }
    if (path.includes('/locales/config.ts')) {
      if (config['zh-CN']) {
        mergedZhCN = deepMerge(mergedZhCN, config['zh-CN']);
      }
      if (config['en-US']) {
        mergedEnUS = deepMerge(mergedEnUS, config['en-US']);
      }
    } else {
      // 处理模块级配置（src/modules/**/config.ts）
      const localeConfig = config.locale;

      if (localeConfig) {
        // 检查是否是扁平结构（包含 'zh-CN' 和 'en-US' 键）
        if (localeConfig['zh-CN'] || localeConfig['en-US']) {
          // 扁平结构：localeConfig['zh-CN'] 已经是扁平化的键值对
          // 需要将其转换为嵌套结构，然后扁平化合并
          if (localeConfig['zh-CN']) {
            // 将扁平化的键值对转换为嵌套结构
            const nested = unflattenObject(localeConfig['zh-CN']);
            mergedZhCN = deepMerge(mergedZhCN, nested);
          }
          if (localeConfig['en-US']) {
            // 将扁平化的键值对转换为嵌套结构
            const nested = unflattenObject(localeConfig['en-US']);
            mergedEnUS = deepMerge(mergedEnUS, nested);
          }
        } else {
          // 旧格式：嵌套结构（兼容处理）
          // 页面级配置通常只包含 page 配置，但可能也包含 app、menu 和 common（用于覆盖）
          if (localeConfig.app) {
            mergedZhCN.app = deepMerge(mergedZhCN.app, localeConfig.app);
            mergedEnUS.app = deepMerge(mergedEnUS.app, localeConfig.app || {});
          }
          if (localeConfig.menu) {
            mergedZhCN.menu = deepMerge(mergedZhCN.menu, localeConfig.menu);
            mergedEnUS.menu = deepMerge(mergedEnUS.menu, localeConfig.menu || {});
          }
          if (localeConfig.page) {
            mergedZhCN.page = deepMerge(mergedZhCN.page, localeConfig.page);
            // 页面级配置通常只有中文，如果需要英文可以扩展
            // 暂时使用中文配置作为英文的占位符
            mergedEnUS.page = deepMerge(mergedEnUS.page, localeConfig.page || {});
          }
          if (localeConfig.common) {
            mergedZhCN.common = deepMerge(mergedZhCN.common, localeConfig.common);
            mergedEnUS.common = deepMerge(mergedEnUS.common, localeConfig.common || {});
          }
        }
      }
    }
  }

  // 转换为扁平化结构
  return {
    'zh-CN': flattenObject(mergedZhCN),
    'en-US': flattenObject(mergedEnUS),
  };
}

/**
 * 注册子应用的国际化消息获取器
 * 从 config.ts 文件中提取国际化配置并注册到全局，供主应用使用
 *
 * @param appId 子应用 ID（如 'system', 'logistics' 等）
 * @param configFiles 通过 import.meta.glob 加载的 config.ts 文件
 * @param additionalMessages 额外的国际化消息（可选，用于合并 JSON 文件等）
 *
 * @example
 * 在子应用的 i18n/getters.ts 中使用：
 * import { registerSubAppI18n } from '@btc/shared-core/composables/subapp-i18n';
 * const configFiles = import.meta.glob('../locales/config.ts', { eager: true });
 * registerSubAppI18n('system', configFiles);
 */
export function registerSubAppI18n(
  appId: string,
  configFiles: Record<string, { default: any }>,
  additionalMessages?: {
    'zh-CN'?: Record<string, any>;
    'en-US'?: Record<string, any>;
  }
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 从 config.ts 提取国际化配置（返回扁平化对象）
    const configMessages = extractI18nFromConfigFiles(configFiles);

    // 将扁平化的 configMessages 转换为嵌套对象
    const configMessagesZhCN = unflattenObject(configMessages['zh-CN']);
    const configMessagesEnUS = unflattenObject(configMessages['en-US']);

    // 合并额外的消息（如果有）
    // 注意：additionalMessages 可能是扁平化对象（如 JSON 文件），需要先转换为嵌套对象
    const additionalZhCN = additionalMessages?.['zh-CN']
      ? (isFlatObject(additionalMessages['zh-CN'])
          ? unflattenObject(additionalMessages['zh-CN'] as Record<string, any>)
          : additionalMessages['zh-CN'])
      : undefined;
    const additionalEnUS = additionalMessages?.['en-US']
      ? (isFlatObject(additionalMessages['en-US'])
          ? unflattenObject(additionalMessages['en-US'] as Record<string, any>)
          : additionalMessages['en-US'])
      : undefined;

    const mergedMessages = {
      'zh-CN': additionalZhCN
        ? deepMerge(configMessagesZhCN, additionalZhCN)
        : configMessagesZhCN,
      'en-US': additionalEnUS
        ? deepMerge(configMessagesEnUS, additionalEnUS)
        : configMessagesEnUS,
    };

    // 创建获取器函数
    const getLocaleMessages = () => mergedMessages;

    // 注册到全局
    if (!(window as any).__SUBAPP_I18N_GETTERS__) {
      (window as any).__SUBAPP_I18N_GETTERS__ = new Map();
    }

    (window as any).__SUBAPP_I18N_GETTERS__.set(appId, getLocaleMessages);

    // 调试日志：打印物流应用和管理应用的国际化消息对象
    if ((appId === 'logistics' || appId === 'admin') && import.meta.env.DEV) {
      console.group(`[registerSubAppI18n] 📦 ${appId === 'logistics' ? '物流' : '管理'}应用国际化消息扫描结果`);

      // 打印从 config.ts 提取的扁平化消息
      console.log('1️⃣ 从 config.ts 提取的扁平化消息:', {
        'zh-CN': {
          keys: Object.keys(configMessages['zh-CN']).length,
          sample: Object.keys(configMessages['zh-CN']).slice(0, 20),
          menuKeys: Object.keys(configMessages['zh-CN']).filter(k => k.startsWith('menu.')),
        },
        'en-US': {
          keys: Object.keys(configMessages['en-US']).length,
          sample: Object.keys(configMessages['en-US']).slice(0, 20),
          menuKeys: Object.keys(configMessages['en-US']).filter(k => k.startsWith('menu.')),
        },
      });

      // 打印转换后的嵌套对象（菜单部分）
      console.log('2️⃣ 转换后的嵌套对象（菜单部分）:', {
        'zh-CN': {
          menu: configMessagesZhCN.menu,
        },
        'en-US': {
          menu: configMessagesEnUS.menu,
        },
      });

      // 打印合并后的最终消息对象（菜单部分）
      console.log('3️⃣ 合并后的最终消息对象（菜单部分）:', {
        'zh-CN': {
          menu: mergedMessages['zh-CN'].menu,
        },
        'en-US': {
          menu: mergedMessages['en-US'].menu,
        },
      });

      // 打印所有菜单相关的 key（从扁平化的 configMessages 中获取）
      const menuKeysZhCN = Object.keys(configMessages['zh-CN']).filter(k => k.startsWith('menu.'));
      const menuKeysEnUS = Object.keys(configMessages['en-US']).filter(k => k.startsWith('menu.'));
      console.log('4️⃣ 所有菜单相关的 key（扁平化）:', {
        'zh-CN': menuKeysZhCN,
        'en-US': menuKeysEnUS,
      });

      // 打印菜单对象的实际值（检查是否有函数对象）
      const checkMenuValues = (menuObj: any, prefix = 'menu'): string[] => {
        const keys: string[] = [];
        for (const key in menuObj) {
          if (Object.prototype.hasOwnProperty.call(menuObj, key)) {
            const fullKey = `${prefix}.${key}`;
            const value = menuObj[key];
            if (typeof value === 'string') {
              keys.push(fullKey);
            } else if (value && typeof value === 'object' && 'source' in value) {
              keys.push(`${fullKey} (has source: ${value.source})`);
            } else if (value && typeof value === 'object') {
              keys.push(...checkMenuValues(value, fullKey));
            }
          }
        }
        return keys;
      };
      console.log('4️⃣.1 菜单对象的实际值（检查函数对象）:', {
        'zh-CN': checkMenuValues(mergedMessages['zh-CN'].menu || {}),
        'en-US': checkMenuValues(mergedMessages['en-US'].menu || {}),
      });

      // 打印完整的合并后消息对象（限制深度，避免输出过多）
      console.log('5️⃣ 完整的合并后消息对象（限制深度）:', {
        'zh-CN': JSON.parse(JSON.stringify(mergedMessages['zh-CN'], (key, value) => {
          if (typeof value === 'object' && value !== null && Object.keys(value).length > 10) {
            return `[Object with ${Object.keys(value).length} keys]`;
          }
          return value;
        }, 2)),
        'en-US': JSON.parse(JSON.stringify(mergedMessages['en-US'], (key, value) => {
          if (typeof value === 'object' && value !== null && Object.keys(value).length > 10) {
            return `[Object with ${Object.keys(value).length} keys]`;
          }
          return value;
        }, 2)),
      });

      console.groupEnd();
    }
  } catch (error) {
    console.error(`[registerSubAppI18n] 注册 ${appId} 的国际化消息获取器失败:`, error);
  }
}
