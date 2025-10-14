/**
 * 文档搜索服务
 * 用于在全局搜索中搜索 VitePress 文档内容
 *
 * 自动从 VitePress 的搜索索引接口加载数据
 */

export interface DocSearchResult {
  id: string;
  type: 'doc';
  title: string;
  path: string; // VitePress 内部路径，例如 '/timeline/'
  breadcrumb: string;
  excerpt?: string; // 摘要
}

/**
 * VitePress 搜索索引接口返回的数据格式
 */
interface VitePressSearchIndexItem {
  id: string;
  title: string;
  url: string;
  breadcrumb?: string;
  excerpt?: string;
  content?: string;
}

/**
 * 文档数据缓存
 */
let docsDataCache: DocSearchResult[] | null = null;

/**
 * 获取 VitePress 搜索索引 URL
 */
function getSearchIndexUrl(): string {
  if (import.meta.env.DEV) {
    // 开发环境：从 VitePress 开发服务器获取（支持环境变量配置）
    const baseUrl = import.meta.env.VITE_DOCS_URL || 'http://localhost:8085';
    return `${baseUrl}/api/search-index.json`;
  } else {
    // 生产环境：从构建产物获取
    return '/internal/archive/search-index.json';
  }
}

/**
 * 加载文档搜索索引
 */
async function loadSearchIndex(): Promise<DocSearchResult[]> {
  // 如果已有缓存，直接返回
  if (docsDataCache) {
    return docsDataCache;
  }

  try {
    const url = getSearchIndexUrl();
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch search index: ${response.status}`);
    }

    const indexData: VitePressSearchIndexItem[] = await response.json();

    // 转换为 DocSearchResult 格式
    docsDataCache = indexData.map(item => ({
      id: item.id,
      type: 'doc' as const,
      title: item.title,
      path: item.url,
      breadcrumb: item.breadcrumb || '文档中心',
      excerpt: item.excerpt
    }));

    return docsDataCache;

  } catch (error) {
    console.error('[docsSearch] Failed to load search index:', error);
    // 加载失败时返回空数组
    return [];
  }
}

/**
 * 后备的文档数据（加载失败时使用）
 */
const fallbackDocsData: DocSearchResult[] = [
  // 时间线
  {
    id: 'd1',
    type: 'doc',
    title: '项目时间线',
    path: '/timeline/',
    breadcrumb: '文档中心',
    excerpt: '按时间顺序查看项目的主要里程碑和变更历史'
  },

  // 项目
  {
    id: 'd2',
    type: 'doc',
    title: '项目索引',
    path: '/projects/',
    breadcrumb: '文档中心',
    excerpt: '按项目分类浏览技术文档'
  },

  // 文档类型
  {
    id: 'd3',
    type: 'doc',
    title: '文档类型分类',
    path: '/types/',
    breadcrumb: '文档中心',
    excerpt: '按文档类型（ADR, RFC, SOP 等）浏览'
  },

  // 标签
  {
    id: 'd4',
    type: 'doc',
    title: '标签索引',
    path: '/tags/',
    breadcrumb: '文档中心',
    excerpt: '按标签浏览相关文档'
  },

  // 组件总览
  {
    id: 'd5',
    type: 'doc',
    title: '组件文档',
    path: '/components/',
    breadcrumb: '文档中心',
    excerpt: 'BTC 业务组件使用文档和最佳实践'
  },

  // CRUD 组件
  {
    id: 'd6',
    type: 'doc',
    title: 'BtcCrud 组件',
    path: '/components/crud',
    breadcrumb: '文档中心 > 组件',
    excerpt: 'CRUD 操作的核心组件，提供增删改查、分页、搜索等功能'
  },

  // Form 组件
  {
    id: 'd7',
    type: 'doc',
    title: 'BtcForm 组件',
    path: '/components/form',
    breadcrumb: '文档中心 > 组件',
    excerpt: '表单组件，支持动态表单、验证、tabs、插件等功能'
  },

  // Upsert 组件
  {
    id: 'd8',
    type: 'doc',
    title: 'BtcUpsert 组件',
    path: '/components/upsert',
    breadcrumb: '文档中心 > 组件',
    excerpt: '新增和编辑的弹窗组件，基于 BtcDialog 和 BtcForm'
  },

  // Table 组件
  {
    id: 'd9',
    type: 'doc',
    title: 'BtcTable 组件',
    path: '/components/table',
    breadcrumb: '文档中心 > 组件',
    excerpt: '表格组件，支持排序、固定列、自定义列、操作列等'
  },

  // Dialog 组件
  {
    id: 'd10',
    type: 'doc',
    title: 'BtcDialog 组件',
    path: '/components/dialog',
    breadcrumb: '文档中心 > 组件',
    excerpt: '弹窗组件，支持全屏、拖拽、自定义尺寸等功能'
  },

  // ViewGroup 组件
  {
    id: 'd11',
    type: 'doc',
    title: 'BtcViewGroup 组件',
    path: '/components/view-group',
    breadcrumb: '文档中心 > 组件',
    excerpt: '左树右表布局组件，支持树形菜单、列表切换、拖拽排序等'
  },

  // API
  {
    id: 'd12',
    type: 'doc',
    title: 'API 文档',
    path: '/api/',
    breadcrumb: '文档中心',
    excerpt: '系统 API 接口文档'
  },
];

/**
 * 搜索文档（异步）
 * @param keyword 搜索关键词
 * @returns 匹配的文档列表
 */
export async function searchDocs(keyword: string): Promise<DocSearchResult[]> {
  if (!keyword.trim()) return [];

  const lowerKeyword = keyword.toLowerCase().trim();

  // 加载搜索索引
  const docsData = await loadSearchIndex();

  // 如果加载失败，使用后备数据
  const searchData = docsData.length > 0 ? docsData : fallbackDocsData;

  return searchData.filter(doc =>
    doc.title.toLowerCase().includes(lowerKeyword) ||
    (doc.breadcrumb && doc.breadcrumb.toLowerCase().includes(lowerKeyword)) ||
    (doc.excerpt && doc.excerpt.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * 获取所有文档（用于快速访问）
 * @returns 所有文档列表
 */
export async function getAllDocs(): Promise<DocSearchResult[]> {
  const docsData = await loadSearchIndex();
  return docsData.length > 0 ? docsData : fallbackDocsData;
}

/**
 * 根据路径获取文档完整 URL
 * @param path VitePress 内部路径
 * @returns 完整的文档 URL
 */
export function getDocUrl(path: string): string {
  // 开发环境（支持环境变量配置）
  if (import.meta.env.DEV) {
    const baseUrl = import.meta.env.VITE_DOCS_URL || 'http://10.80.8.199:8085';
    return `${baseUrl}${path}`;
  }

  // 生产环境
  return `/internal/archive${path}`;
}

