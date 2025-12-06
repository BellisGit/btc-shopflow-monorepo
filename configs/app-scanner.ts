/**
 * 应用动态扫描器
 * 参考 cool-admin 的实现，自动扫描 apps 目录下的所有应用
 */

import type { AppIdentity } from './app-identity.types';

// 手动导入所有应用的 app.ts 文件
// 由于 import.meta.glob 在跨应用目录时可能无法正常工作，改为手动导入
import adminAppIdentity from '../apps/admin-app/src/app.ts';
import logisticsAppIdentity from '../apps/logistics-app/src/app.ts';
import qualityAppIdentity from '../apps/quality-app/src/app.ts';
import productionAppIdentity from '../apps/production-app/src/app.ts';
import engineeringAppIdentity from '../apps/engineering-app/src/app.ts';
import financeAppIdentity from '../apps/finance-app/src/app.ts';
import monitorAppIdentity from '../apps/monitor-app/src/app.ts';
import systemAppIdentity from '../apps/system-app/src/app.ts';
import layoutAppIdentity from '../apps/layout-app/src/app.ts';
import docsSiteAppIdentity from '../apps/docs-site-app/src/app.ts';
import mobileAppIdentity from '../apps/mobile-app/src/app.ts';

// 将所有应用配置组织成对象，模拟 glob 的结果
// 注意：直接导入的默认导出就是配置对象本身，需要包装成 { default: ... } 格式
const appFiles: Record<string, { default: AppIdentity }> = {
  '../apps/admin-app/src/app.ts': { default: adminAppIdentity },
  '../apps/logistics-app/src/app.ts': { default: logisticsAppIdentity },
  '../apps/quality-app/src/app.ts': { default: qualityAppIdentity },
  '../apps/production-app/src/app.ts': { default: productionAppIdentity },
  '../apps/engineering-app/src/app.ts': { default: engineeringAppIdentity },
  '../apps/finance-app/src/app.ts': { default: financeAppIdentity },
  '../apps/monitor-app/src/app.ts': { default: monitorAppIdentity },
  '../apps/system-app/src/app.ts': { default: systemAppIdentity },
  '../apps/layout-app/src/app.ts': { default: layoutAppIdentity },
  '../apps/docs-site-app/src/app.ts': { default: docsSiteAppIdentity },
  '../apps/mobile-app/src/app.ts': { default: mobileAppIdentity },
};

/**
 * 应用注册表
 */
const appRegistry = new Map<string, AppIdentity>();

/**
 * 从文件路径提取应用名称
 */
function extractAppName(filePath: string): string {
  // 从路径 apps/admin-app/src/app.ts 提取 admin
  // 从路径 apps/docs-site-app/src/app.ts 提取 docs-site
  // 匹配 apps/ 和 -app/ 之间的所有内容（包括连字符）
  const match = filePath.match(/apps\/(.+?)-app\//);
  return match ? match[1] : '';
}

/**
 * 验证应用身份配置
 */
function validateAppIdentity(identity: any, appName: string): identity is AppIdentity {
  if (!identity || typeof identity !== 'object') {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：不是对象`);
    return false;
  }
  
  if (!identity.id || typeof identity.id !== 'string') {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 id`);
    return false;
  }
  
  if (!identity.name || typeof identity.name !== 'string') {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 name`);
    return false;
  }
  
  if (!identity.pathPrefix || typeof identity.pathPrefix !== 'string') {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：缺少 pathPrefix`);
    return false;
  }
  
  if (!identity.type || !['main', 'sub', 'layout', 'docs'].includes(identity.type)) {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：type 必须是 main、sub、layout 或 docs`);
    return false;
  }
  
  if (typeof identity.enabled !== 'boolean') {
    console.warn(`[app-scanner] 应用 ${appName} 的配置无效：enabled 必须是布尔值`);
    return false;
  }
  
  return true;
}

/**
 * 扫描并注册所有应用
 */
export function scanAndRegisterApps(): Map<string, AppIdentity> {
  appRegistry.clear();
  
  for (const [filePath, appConfigWrapper] of Object.entries(appFiles)) {
    try {
      // 从包装对象中提取实际的配置对象
      const appConfig = appConfigWrapper.default;
      const appName = extractAppName(filePath);
      
      if (!appName) {
        continue;
      }
      
      if (!validateAppIdentity(appConfig, appName)) {
        continue;
      }
      
      // 确保 id 与 appName 一致（如果配置中的 id 不同，使用 appName）
      const identity: AppIdentity = {
        ...appConfig,
        id: appConfig.id || appName,
      };
      
      appRegistry.set(identity.id, identity);
    } catch (error) {
      console.error(`[app-scanner] ❌ 扫描应用配置失败: ${filePath}`, error);
    }
  }
  
  return appRegistry;
}

/**
 * 获取所有已注册的应用
 */
export function getAllApps(): AppIdentity[] {
  if (appRegistry.size === 0) {
    scanAndRegisterApps();
  }
  return Array.from(appRegistry.values());
}

/**
 * 根据 ID 获取应用
 */
export function getAppById(id: string): AppIdentity | undefined {
  if (appRegistry.size === 0) {
    scanAndRegisterApps();
  }
  return appRegistry.get(id);
}

/**
 * 获取所有子应用（排除主应用和布局应用）
 */
export function getSubApps(): AppIdentity[] {
  return getAllApps().filter(app => app.type === 'sub' && app.enabled);
}

/**
 * 获取主应用
 */
export function getMainApp(): AppIdentity | undefined {
  return getAllApps().find(app => app.type === 'main');
}

/**
 * 根据路径前缀查找应用
 */
export function getAppByPathPrefix(pathPrefix: string): AppIdentity | undefined {
  return getAllApps().find(app => app.pathPrefix === pathPrefix);
}

/**
 * 根据子域名查找应用
 */
export function getAppBySubdomain(subdomain: string): AppIdentity | undefined {
  return getAllApps().find(app => app.subdomain === subdomain);
}

