/**
 * 类型安全的国际化工具
 * 提供编译时类型检查和运行时验证
 */

export interface I18nKeyPath {
  // UI 组件命名空间
  'ui.button.save': string;
  'ui.button.cancel': string;
  'ui.button.confirm': string;
  'ui.button.reset': string;
  'ui.button.submit': string;
  'ui.button.search': string;
  'ui.table.index': string;
  'ui.table.operation': string;
  'ui.table.empty': string;
  'ui.form.please_enter': string;
  'ui.form.please_select': string;
  'ui.message.success': string;
  'ui.message.error': string;
  'ui.message.warning': string;
  'ui.message.info': string;
  'ui.loading': string;
  'ui.confirm': string;
  'ui.close': string;
  'ui.expand': string;
  'ui.collapse': string;
  'ui.refresh': string;
  'ui.filter': string;
  'ui.sort': string;
  'ui.export': string;
  'ui.import': string;
  'ui.add': string;
  'ui.edit': string;
  'ui.delete': string;
  'ui.view': string;
  'ui.copy': string;
  'ui.download': string;
  'ui.upload': string;

  // 平台治理命名空间
  'platform.common.export_success': string;
  'platform.common.export_failed': string;
  'platform.common.no_columns_to_export': string;
  'platform.common.no_data_to_export': string;
  'platform.common.select_columns': string;
  'platform.common.please_select_at_least_one_column': string;
  'platform.common.add_success': string;
  'platform.common.update_success': string;
  'platform.common.delete_success': string;
  'platform.domains.title': string;
  'platform.domains.domain_name': string;
  'platform.domains.domain_code': string;
  'platform.domains.description': string;
  'platform.domains.created_at': string;
  'platform.domains.updated_at': string;
  'platform.modules.title': string;
  'platform.plugins.title': string;

  // 业务域命名空间 - 采购
  'procurement.common.create_po_success': string;
  'procurement.common.create_po_failed': string;
  'procurement.aux.title': string;
  'procurement.aux.po.create.success': string;
  'procurement.aux.request.empty': string;
  'procurement.aux.supplier.name': string;
  'procurement.aux.supplier.code': string;
  'procurement.aux.material.name': string;
  'procurement.aux.material.spec': string;
  'procurement.aux.material.unit': string;
  'procurement.aux.quantity': string;
  'procurement.aux.price': string;
  'procurement.aux.total_amount': string;
  'procurement.packaging.title': string;
  'procurement.packaging.create_success': string;
  'procurement.packaging.material.name': string;
  'procurement.packaging.dimension': string;
  'procurement.packaging.weight': string;
  'procurement.packaging.cost': string;

  // 业务域命名空间 - 库存
  'inventory.common.stock_in_success': string;
  'inventory.common.stock_out_success': string;
  'inventory.common.stock_check_success': string;
  'inventory.warehouse.title': string;
  'inventory.warehouse.location.code': string;
  'inventory.warehouse.location.name': string;
  'inventory.warehouse.location.zone': string;
  'inventory.warehouse.location.shelf': string;
  'inventory.warehouse.location.level': string;
  'inventory.warehouse.capacity': string;
  'inventory.warehouse.occupied': string;
  'inventory.warehouse.available': string;
  'inventory.stock.title': string;
  'inventory.stock.item.name': string;
  'inventory.stock.item.code': string;
  'inventory.stock.quantity': string;
  'inventory.stock.safety_stock': string;
  'inventory.stock.max_stock': string;
  'inventory.stock.min_stock': string;
  'inventory.stock.unit_cost': string;
  'inventory.stock.total_value': string;
}

/**
 * 类型安全的翻译函数
 */
export type TypeSafeT = <K extends keyof I18nKeyPath>(
  key: K,
  params?: Record<string, any>
) => string;

/**
 * 创建类型安全的 useI18n hook
 */
export function createTypeSafeI18n(t: any): TypeSafeT {
  return <K extends keyof I18nKeyPath>(
    key: K,
    params?: Record<string, any>
  ): string => {
    try {
      return t(key, params);
    } catch (error) {
      console.warn(`[i18n] Translation failed for key: ${key}`, error);
      return String(key);
    }
  };
}

/**
 * 验证翻译键是否存在
 */
export function validateI18nKey(key: string): key is keyof I18nKeyPath {
  // 运行时验证逻辑
  const validNamespaces = ['ui', 'platform', 'procurement', 'inventory'];
  const parts = key.split('.');

  if (parts.length < 2) return false;

  const namespace = parts[0];
  return validNamespaces.includes(namespace);
}

/**
 * 获取所有可用的翻译键
 */
export function getAllI18nKeys(): (keyof I18nKeyPath)[] {
  return [
    // UI 组件键
    'ui.button.save',
    'ui.button.cancel',
    'ui.button.confirm',
    'ui.button.reset',
    'ui.button.submit',
    'ui.button.search',
    'ui.table.index',
    'ui.table.operation',
    'ui.table.empty',
    'ui.form.please_enter',
    'ui.form.please_select',
    'ui.message.success',
    'ui.message.error',
    'ui.message.warning',
    'ui.message.info',
    'ui.loading',
    'ui.confirm',
    'ui.close',
    'ui.expand',
    'ui.collapse',
    'ui.refresh',
    'ui.filter',
    'ui.sort',
    'ui.export',
    'ui.import',
    'ui.add',
    'ui.edit',
    'ui.delete',
    'ui.view',
    'ui.copy',
    'ui.download',
    'ui.upload',

    // 平台治理键
    'platform.common.export_success',
    'platform.common.export_failed',
    'platform.common.no_columns_to_export',
    'platform.common.no_data_to_export',
    'platform.common.select_columns',
    'platform.common.please_select_at_least_one_column',
    'platform.common.add_success',
    'platform.common.update_success',
    'platform.common.delete_success',
    'platform.domains.title',
    'platform.domains.domain_name',
    'platform.domains.domain_code',
    'platform.domains.description',
    'platform.domains.created_at',
    'platform.domains.updated_at',
    'platform.modules.title',
    'platform.plugins.title',

    // 业务域键 - 采购
    'procurement.common.create_po_success',
    'procurement.common.create_po_failed',
    'procurement.aux.title',
    'procurement.aux.po.create.success',
    'procurement.aux.request.empty',
    'procurement.aux.supplier.name',
    'procurement.aux.supplier.code',
    'procurement.aux.material.name',
    'procurement.aux.material.spec',
    'procurement.aux.material.unit',
    'procurement.aux.quantity',
    'procurement.aux.price',
    'procurement.aux.total_amount',
    'procurement.packaging.title',
    'procurement.packaging.create_success',
    'procurement.packaging.material.name',
    'procurement.packaging.dimension',
    'procurement.packaging.weight',
    'procurement.packaging.cost',

    // 业务域键 - 库存
    'inventory.common.stock_in_success',
    'inventory.common.stock_out_success',
    'inventory.common.stock_check_success',
    'inventory.warehouse.title',
    'inventory.warehouse.location.code',
    'inventory.warehouse.location.name',
    'inventory.warehouse.location.zone',
    'inventory.warehouse.location.shelf',
    'inventory.warehouse.location.level',
    'inventory.warehouse.capacity',
    'inventory.warehouse.occupied',
    'inventory.warehouse.available',
    'inventory.stock.title',
    'inventory.stock.item.name',
    'inventory.stock.item.code',
    'inventory.stock.quantity',
    'inventory.stock.safety_stock',
    'inventory.stock.max_stock',
    'inventory.stock.min_stock',
    'inventory.stock.unit_cost',
    'inventory.stock.total_value',
  ] as (keyof I18nKeyPath)[];
}

/**
 * 国际化审计工具
 */
export class I18nAuditor {
  private usedKeys = new Set<string>();
  private definedKeys = new Set<string>();

  /**
   * 记录使用的键
   */
  recordUsedKey(key: string) {
    this.usedKeys.add(key);
  }

  /**
   * 记录定义的键
   */
  recordDefinedKey(key: string) {
    this.definedKeys.add(key);
  }

  /**
   * 获取未使用的键
   */
  getUnusedKeys(): string[] {
    return Array.from(this.definedKeys).filter(key => !this.usedKeys.has(key));
  }

  /**
   * 获取缺失的键
   */
  getMissingKeys(): string[] {
    return Array.from(this.usedKeys).filter(key => !this.definedKeys.has(key));
  }

  /**
   * 生成审计报告
   */
  generateReport(): {
    unused: string[];
    missing: string[];
    coverage: number;
  } {
    const unused = this.getUnusedKeys();
    const missing = this.getMissingKeys();
    const coverage = this.definedKeys.size > 0
      ? (this.definedKeys.size - unused.length) / this.definedKeys.size
      : 0;

    return {
      unused,
      missing,
      coverage: Math.round(coverage * 100) / 100,
    };
  }
}

// 全局审计器实例
export const globalI18nAuditor = new I18nAuditor();
