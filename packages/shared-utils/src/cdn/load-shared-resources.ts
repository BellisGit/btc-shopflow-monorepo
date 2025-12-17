/**
 * 从 layout-app 加载共享资源
 *
 * 共享资源包括：
 * - vendor: Vue 生态库 + 共享组件库
 * - echarts-vendor: ECharts 相关库
 * - menu-registry: 菜单注册表
 *
 * 使用说明：
 * 1. 在生产环境，非 layout-app 应用需要先加载共享资源
 * 2. 开发环境仍然使用本地打包的资源，不加载共享资源
 * 3. 通过 manifest.json 获取实际文件名（包含 hash）
 */

/**
 * 获取 layout-app 的基础 URL
 */
function getLayoutAppBase(): string {
  if (typeof window === 'undefined') {
    return 'https://layout.bellis.com.cn';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // #region agent log H-SSL-CDN
  fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-SSL-CDN',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getLayoutAppBase',message:'compute layoutAppBase',data:{hostname,protocol},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log H-SSL-CDN

  // 生产环境：使用子域名
  if (hostname.includes('bellis.com.cn')) {
    return `${protocol}//layout.bellis.com.cn`;
  }

  // 开发/预览环境：根据当前端口判断环境类型
  const port = window.location.port || '';
  const isPreview = port.startsWith('41');
  const isDev = port.startsWith('80');

  if (isPreview) {
    // 预览环境：使用 layout-app 的预览端口 4192
    return 'http://localhost:4192';
  } else if (isDev) {
    // 开发环境：使用 layout-app 的开发端口 4188
    return 'http://localhost:4188';
  } else {
    // 默认使用预览端口
    return 'http://localhost:4192';
  }
}

/**
 * 从 manifest.json 获取资源文件名
 */
async function getResourceFromManifest(
  layoutAppBase: string,
  resourceName: string
): Promise<string | null> {
  try {
    const manifestUrl = `${layoutAppBase}/manifest.json`;

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'fetch manifest.json',data:{manifestUrl,resourceName},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    const response = await fetch(manifestUrl, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest response',data:{manifestUrl,ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    if (!response.ok) {
      console.warn(`[load-shared-resources] 无法获取 manifest.json: ${response.status}`);
      return null;
    }

    const manifest = await response.json();

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest parsed',data:{manifestKeysCount:Object.keys(manifest||{}).length,resourceName},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    // 查找匹配的资源文件
    // manifest 格式：{ "vendor-xxx.js": { file: "assets/layout/vendor-xxx.js", ... }, ... }
    for (const [key, value] of Object.entries(manifest)) {
      const entry = value as { file?: string; src?: string };
      const fileName = entry.file || entry.src || key;

      // 匹配资源名称（vendor、echarts-vendor、menu-registry）
      if (fileName.includes(resourceName) && fileName.endsWith('.js')) {
        // 返回完整的 URL
        // 注意：layout-app 的资源路径是 assets/layout/xxx.js，需要确保路径正确
        const basePath = fileName.startsWith('/') ? '' : '/';
        // 如果路径已经是 assets/layout/，直接使用；否则需要确保路径正确
        let finalPath = fileName;
        if (!fileName.includes('assets/layout/') && fileName.startsWith('assets/')) {
          // 如果路径是 assets/xxx.js，转换为 assets/layout/xxx.js
          finalPath = fileName.replace(/^assets\//, 'assets/layout/');
        }
        const finalUrl = `${layoutAppBase}${basePath}${finalPath}`;

        // #region agent log H-PATH
        fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-PATH',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'matched resource in manifest',data:{resourceName,key,fileName,finalPath,finalUrl},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log H-PATH
        return finalUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn(`[load-shared-resources] 获取 manifest.json 失败:`, error);

    // #region agent log H-MANIFEST
    fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-MANIFEST',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:getResourceFromManifest',message:'manifest fetch threw',data:{resourceName,errorName:(error as any)?.name,errorMessage:(error as any)?.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log H-MANIFEST

    return null;
  }
}

/**
 * 动态加载 JavaScript 模块
 */
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载过
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      // 如果已经加载，直接 resolve
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      // #region agent log H-LOAD
      fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-LOAD',location:'packages/shared-utils/src/cdn/load-shared-resources.ts:loadScript',message:'script onerror',data:{url},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log H-LOAD
      reject(new Error(`Failed to load shared resource: ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * 从 layout-app 加载共享资源
 *
 * @param options 加载选项
 * @param options.resources 要加载的资源列表，默认为 ['vendor', 'echarts-vendor', 'menu-registry']
 * @param options.onProgress 进度回调，参数为 (loaded, total)
 * @returns Promise，在所有资源加载完成后 resolve
 */
export async function loadSharedResourcesFromLayoutApp(options?: {
  resources?: string[];
  onProgress?: (loaded: number, total: number) => void;
}): Promise<void> {
  // layout-app 本身不需要加载共享资源
  // 如果使用了 layout-app（__USE_LAYOUT_APP__ 为 true），也不需要加载，因为 layout-app 已经提供了这些资源
  if (typeof window !== 'undefined') {
    if ((window as any).__IS_LAYOUT_APP__ || (window as any).__USE_LAYOUT_APP__) {
      return;
    }
  }

  const layoutAppBase = getLayoutAppBase();

  // 开发环境：不加载共享资源，使用本地打包的资源
  // 通过 hostname 判断：localhost 或非生产域名都是开发环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  !hostname.includes('bellis.com.cn');
    if (isDev) {
      return;
    }
  } else {
    // 服务端环境：尝试使用 import.meta.env（如果可用）
    try {
      const isDev = typeof import.meta !== 'undefined' &&
                    import.meta.env &&
                    (import.meta.env as any).DEV === true;
      if (isDev) {
        return;
      }
    } catch {
      // 如果 import.meta 不可用，继续执行（假设是生产环境）
    }
  }
  const resources = options?.resources || ['vendor', 'echarts-vendor', 'menu-registry'];

  let loaded = 0;
  const total = resources.length;

  // 并行获取所有资源的 URL
  const resourceUrls = await Promise.all(
    resources.map(async (resourceName) => {
      const url = await getResourceFromManifest(layoutAppBase, resourceName);
      if (!url) {
        console.warn(`[load-shared-resources] 无法找到资源: ${resourceName}`);
      }
      return { name: resourceName, url };
    })
  );

  // 按顺序加载资源（确保依赖顺序：vendor → echarts-vendor → menu-registry）
  for (const { name, url } of resourceUrls) {
    if (!url) {
      // 如果找不到资源，跳过（可能是该资源不存在，如某些应用不使用 echarts）
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
      continue;
    }

    try {
      await loadScript(url);
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
    } catch (error) {
      console.error(`[load-shared-resources] 加载资源失败: ${name}`, error);
      // 继续加载其他资源，不中断
      loaded++;
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
    }
  }
}

/**
 * 检查共享资源是否已加载
 */
export function areSharedResourcesLoaded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查是否已经加载了 vendor（Vue 应该已经可用）
  return typeof (window as any).Vue !== 'undefined' ||
         document.querySelector('script[src*="vendor"]') !== null;
}

