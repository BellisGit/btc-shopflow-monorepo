/**
 * 设备检测工具
 * 支持识别iOS、Android（小米、华为、vivo等）和平板设备
 */

export interface DeviceInfo {
  /** 操作系统类型 */
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  /** 操作系统版本 */
  osVersion: string;
  /** 设备品牌（如：Xiaomi, Huawei, Vivo, Apple等） */
  brand: string;
  /** 设备型号 */
  model: string;
  /** 是否为移动设备 */
  isMobile: boolean;
  /** 是否为平板设备 */
  isTablet: boolean;
  /** 是否为iOS设备 */
  isIOS: boolean;
  /** 是否为Android设备 */
  isAndroid: boolean;
  /** 浏览器类型 */
  browser: 'safari' | 'chrome' | 'firefox' | 'samsung' | 'miui' | 'huawei' | 'vivo' | 'oppo' | 'unknown';
  /** 浏览器版本 */
  browserVersion: string;
  /** 是否支持Service Worker */
  supportsServiceWorker: boolean;
  /** 是否支持Background Sync */
  supportsBackgroundSync: boolean;
  /** 是否支持Push Notifications */
  supportsPushNotifications: boolean;
  /** 是否支持IndexedDB */
  supportsIndexedDB: boolean;
  /** 是否在WebView中运行 */
  isWebView: boolean;
  /** User Agent字符串 */
  userAgent: string;
}

/**
 * 检测设备信息
 */
export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  
  // 基础信息
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua);
  const isMacOS = /Mac OS X/.test(ua) && !isIOS;
  const isLinux = /Linux/.test(ua);
  
  // 操作系统版本
  let os: DeviceInfo['os'] = 'unknown';
  let osVersion = '';
  
  if (isIOS) {
    os = 'ios';
    const match = ua.match(/OS (\d+)[._](\d+)/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}`;
    }
  } else if (isAndroid) {
    os = 'android';
    const match = ua.match(/Android (\d+)[._](\d+)/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}`;
    }
  } else if (isWindows) {
    os = 'windows';
  } else if (isMacOS) {
    os = 'macos';
  } else if (isLinux) {
    os = 'linux';
  }
  
  // 设备品牌和型号
  let brand = 'Unknown';
  let model = '';
  
  if (isIOS) {
    brand = 'Apple';
    // 检测iPhone型号
    if (/iPhone/.test(ua)) {
      if (/iPhone OS 17_0/.test(ua) || /iPhone OS 16_0/.test(ua)) {
        model = 'iPhone 14/15系列';
      } else if (/iPhone OS 15_/.test(ua)) {
        model = 'iPhone 12/13系列';
      } else {
        model = 'iPhone';
      }
    } else if (/iPad/.test(ua)) {
      model = 'iPad';
    } else if (/iPod/.test(ua)) {
      model = 'iPod';
    }
  } else if (isAndroid) {
    // 检测Android设备品牌
    if (/Xiaomi|Redmi|POCO|Mi\s/.test(ua)) {
      brand = 'Xiaomi';
      const match = ua.match(/(?:Xiaomi|Redmi|POCO|Mi\s)([^;)]+)/);
      if (match) model = match[1].trim();
    } else if (/Huawei|Honor/.test(ua)) {
      brand = 'Huawei';
      const match = ua.match(/(?:Huawei|Honor)([^;)]+)/);
      if (match) model = match[1].trim();
    } else if (/vivo/.test(ua)) {
      brand = 'Vivo';
      const match = ua.match(/vivo\s+([^;)]+)/i);
      if (match) model = match[1].trim();
    } else if (/OPPO|OnePlus/.test(ua)) {
      brand = 'Oppo';
      const match = ua.match(/(?:OPPO|OnePlus)([^;)]+)/);
      if (match) model = match[1].trim();
    } else if (/Samsung/.test(ua)) {
      brand = 'Samsung';
      const match = ua.match(/Samsung[^;)]+/);
      if (match) model = match[0].replace('Samsung', '').trim();
    } else if (/HTC/.test(ua)) {
      brand = 'HTC';
    } else if (/Sony/.test(ua)) {
      brand = 'Sony';
    } else if (/LG/.test(ua)) {
      brand = 'LG';
    } else {
      brand = 'Android';
    }
    
    // 如果没有提取到型号，尝试从Build中提取
    if (!model) {
      const buildMatch = ua.match(/Build\/([^;)]+)/);
      if (buildMatch) {
        model = buildMatch[1].trim();
      }
    }
  }
  
  // 检测是否为平板
  const isTablet = isIOS && /iPad/.test(ua) || 
                   (isAndroid && !/Mobile/.test(ua)) ||
                   (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // 检测是否为移动设备
  const isMobile = isIOS || (isAndroid && /Mobile/.test(ua)) || isTablet;
  
  // 浏览器检测
  let browser: DeviceInfo['browser'] = 'unknown';
  let browserVersion = '';
  
  if (/Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)) {
    browser = 'safari';
    const match = ua.match(/Version\/(\d+)[._](\d+)/);
    if (match) {
      browserVersion = `${match[1]}.${match[2]}`;
    }
  } else if (/Chrome/.test(ua) && !/Edg|OPR/.test(ua)) {
    browser = 'chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) {
      browserVersion = match[1];
    }
    // 检测MIUI浏览器
    if (/MiuiBrowser/.test(ua)) {
      browser = 'miui';
    }
    // 检测华为浏览器
    if (/HuaweiBrowser|HwBrowser/.test(ua)) {
      browser = 'huawei';
    }
    // 检测vivo浏览器
    if (/vivo/.test(ua) && /Browser/.test(ua)) {
      browser = 'vivo';
    }
    // 检测OPPO浏览器
    if (/OPPO/.test(ua) && /Browser/.test(ua)) {
      browser = 'oppo';
    }
  } else if (/SamsungBrowser/.test(ua)) {
    browser = 'samsung';
    const match = ua.match(/SamsungBrowser\/(\d+)/);
    if (match) {
      browserVersion = match[1];
    }
  } else if (/Firefox/.test(ua)) {
    browser = 'firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) {
      browserVersion = match[1];
    }
  }
  
  // 检测是否在WebView中
  const isWebView = (isIOS && !/Safari/.test(ua)) || 
                    (isAndroid && /wv|WebView/.test(ua));
  
  // 功能支持检测
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsIndexedDB = 'indexedDB' in window;
  
  // Background Sync支持（需要Service Worker支持）
  let supportsBackgroundSync = false;
  if (supportsServiceWorker && 'serviceWorker' in navigator) {
    // iOS 16.4+ 支持Background Sync，但需要检查
    if (isIOS) {
      const iosVersion = parseFloat(osVersion);
      supportsBackgroundSync = iosVersion >= 16.4;
    } else if (isAndroid) {
      // Android Chrome 49+ 支持
      supportsBackgroundSync = true;
    }
  }
  
  // Push Notifications支持
  const supportsPushNotifications = 'Notification' in window && 
                                    'PushManager' in window &&
                                    'serviceWorker' in navigator;
  
  return {
    os,
    osVersion,
    brand,
    model,
    isMobile,
    isTablet,
    isIOS,
    isAndroid,
    browser,
    browserVersion,
    supportsServiceWorker,
    supportsBackgroundSync,
    supportsPushNotifications,
    supportsIndexedDB,
    isWebView,
    userAgent: ua,
  };
}

/**
 * 获取设备信息（单例）
 */
let deviceInfoCache: DeviceInfo | null = null;

export function getDeviceInfo(): DeviceInfo {
  if (!deviceInfoCache) {
    deviceInfoCache = detectDevice();
  }
  return deviceInfoCache;
}

/**
 * 检查是否为特定品牌
 */
export function isBrand(brand: string): boolean {
  return getDeviceInfo().brand.toLowerCase() === brand.toLowerCase();
}

/**
 * 检查是否为特定浏览器
 */
export function isBrowser(browser: DeviceInfo['browser']): boolean {
  return getDeviceInfo().browser === browser;
}

/**
 * 获取设备标识（用于日志和调试）
 */
export function getDeviceIdentifier(): string {
  const info = getDeviceInfo();
  return `${info.brand} ${info.model} (${info.os} ${info.osVersion}, ${info.browser} ${info.browserVersion})`;
}

