import type { App } from 'vue';
import type {
  Plugin,
  PluginOptions,
  PluginManagerOptions,
  PluginRecord,
  PluginLifecycleEvents,
  ToolbarConfig,
  LayoutConfig,
} from './types';
import { PluginStatus } from './types';

/**
 * 插件管理器（增强版）
 * 支持组件、指令、路由的自动注册
 * 支持 toolbar、layout 的管理
 * 支持生命周期钩子
 */
export class PluginManager {
  private plugins: Map<string, PluginRecord> = new Map();
  private app: App | null = null;
  private router: any = null;
  private options: PluginManagerOptions;

  // 生命周期事件存储
  private lifecycleEvents: PluginLifecycleEvents = {};

  // 工具栏组件存储
  private toolbarComponents: ToolbarConfig[] = [];

  // 布局组件存储
  private layoutComponents: LayoutConfig[] = [];

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      checkDependencies: true,
      allowOverride: false,
      debug: false,
      ...options,
    };
  }

  /**
   * 设置 Vue 应用实例
   */
  setApp(app: App): void {
    this.app = app;
  }

  /**
   * 设置 Vue Router 实例
   */
  setRouter(router: any): void {
    this.router = router;
  }

  /**
   * 注册插件
   * @param plugin 插件对象
   * @returns 插件管理器实例（支持链式调用）
   */
  register<T = any>(plugin: Plugin<T>): this {
    const { name, enable = true } = plugin;

    if (!name) {
      throw new Error('[PluginManager] Plugin must have a name');
    }

    // 检查是否禁用
    if (!enable) {
      if (this.options.debug) {
        console.log(`[PluginManager] Plugin "${name}" is disabled`);
      }
      return this;
    }

    // 检查是否已存在
    if (this.has(name) && !this.options.allowOverride) {
      throw new Error(`[PluginManager] Plugin "${name}" is already registered`);
    }

    // 检查依赖（延迟检查，在安装时再验证）
    // 这样可以支持任意顺序注册插件

    // 注册插件
    this.plugins.set(name, {
      plugin,
      status: PluginStatus.Registered,
    });

    if (this.options.debug) {
      console.log(`[PluginManager] Plugin "${name}" registered`);
    }

    return this;
  }

  /**
   * 安装插件（增强版）
   * @param name 插件名称
   * @param options 插件配置选项
   */
  async install(name: string, options?: PluginOptions): Promise<void> {
    const record = this.plugins.get(name);

    if (!record) {
      throw new Error(`[PluginManager] Plugin "${name}" not found`);
    }

    if (record.status === PluginStatus.Installed) {
      if (this.options.debug) {
        console.warn(`[PluginManager] Plugin "${name}" is already installed`);
      }
      return;
    }

    const { plugin } = record;

    // 检查依赖
    if (this.options.checkDependencies && plugin.dependencies) {
      const missingDeps = plugin.dependencies.filter((dep) => !this.isInstalled(dep));
      if (missingDeps.length > 0) {
        throw new Error(
          `[PluginManager] Plugin "${name}" depends on: ${missingDeps.join(', ')}. Please install them first.`
        );
      }
    }

    try {
      if (!this.app) {
        throw new Error('[PluginManager] Vue app instance not set');
      }

      // 1. 自动注册全局组件
      if (plugin.components && plugin.components.length > 0) {
        await this.registerComponents(name, plugin.components);
      }

      // 2. 自动注册指令
      if (plugin.directives) {
        this.registerDirectives(name, plugin.directives);
      }

      // 3. 注册路由
      if (plugin.views || plugin.pages) {
        this.registerRoutes(name, plugin);
      }

      // 4. 注册工具栏组件
      if (plugin.toolbar) {
        this.toolbarComponents.push(plugin.toolbar);
      }

      // 5. 注册布局组件
      if (plugin.layout) {
        this.layoutComponents.push(plugin.layout);
      }

      // 6. 执行自定义安装钩子
      if (plugin.install) {
        await plugin.install(this.app, options || plugin.options);
      }

      // 7. 执行 onLoad 生命周期
      if (plugin.onLoad) {
        const result = await plugin.onLoad(this.lifecycleEvents);
        if (result) {
          // 将插件导出的方法合并到生命周期事件中
          this.lifecycleEvents = { ...this.lifecycleEvents, ...result };
        }
      }

      // 更新状态
      record.status = PluginStatus.Installed;
      record.installedAt = new Date();

      if (this.options.debug) {
        console.log(`[PluginManager] Plugin "${name}" installed successfully`);
      }
    } catch (error) {
      record.status = PluginStatus.Failed;
      record.error = error as Error;
      throw new Error(`[PluginManager] Failed to install plugin "${name}": ${error}`);
    }
  }

  /**
   * 注册组件
   */
  private async registerComponents(pluginName: string, components: (() => Promise<any>)[]): Promise<void> {
    if (!this.app) return;

    for (const componentLoader of components) {
      try {
        const module = await componentLoader();
        const component = module.default || module;

        // 组件名称优先使用组件自身的 name，否则使用文件名
        const componentName = component.name || this.extractComponentName(componentLoader.toString());

        if (componentName) {
          this.app.component(componentName, component);

          if (this.options.debug) {
            console.log(`[PluginManager] Registered component: ${componentName} from plugin "${pluginName}"`);
          }
        }
      } catch (error) {
        console.error(`[PluginManager] Failed to register component from plugin "${pluginName}":`, error);
      }
    }
  }

  /**
   * 注册指令
   */
  private registerDirectives(pluginName: string, directives: Record<string, any>): void {
    if (!this.app) return;

    for (const [directiveName, directiveDefinition] of Object.entries(directives)) {
      try {
        this.app.directive(directiveName, directiveDefinition);

        if (this.options.debug) {
          console.log(`[PluginManager] Registered directive: v-${directiveName} from plugin "${pluginName}"`);
        }
      } catch (error) {
        console.error(`[PluginManager] Failed to register directive "${directiveName}" from plugin "${pluginName}":`, error);
      }
    }
  }

  /**
   * 注册路由
   */
  private registerRoutes(pluginName: string, plugin: Plugin): void {
    if (!this.router) {
      console.warn(`[PluginManager] Router not set, skipping route registration for plugin "${pluginName}"`);
      return;
    }

    // 注册视图路由（作为子路由）
    if (plugin.views && plugin.views.length > 0) {
      for (const route of plugin.views) {
        try {
          this.router.addRoute(route);
          if (this.options.debug) {
            console.log(`[PluginManager] Registered view route: ${route.path} from plugin "${pluginName}"`);
          }
        } catch (error) {
          console.error(`[PluginManager] Failed to register view route from plugin "${pluginName}":`, error);
        }
      }
    }

    // 注册页面路由（独立路由）
    if (plugin.pages && plugin.pages.length > 0) {
      for (const route of plugin.pages) {
        try {
          this.router.addRoute(route);
          if (this.options.debug) {
            console.log(`[PluginManager] Registered page route: ${route.path} from plugin "${pluginName}"`);
          }
        } catch (error) {
          console.error(`[PluginManager] Failed to register page route from plugin "${pluginName}":`, error);
        }
      }
    }
  }

  /**
   * 从组件加载器中提取组件名称
   */
  private extractComponentName(loaderString: string): string | null {
    // 尝试从 import() 路径中提取文件名
    const match = loaderString.match(/["'](.+\/)?([^/"']+)\.vue["']/);
    if (match && match[2]) {
      // 将 kebab-case 转换为 PascalCase
      return match[2]
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    }
    return null;
  }

  /**
   * 卸载插件
   * @param name 插件名称
   */
  async uninstall(name: string): Promise<void> {
    const record = this.plugins.get(name);

    if (!record) {
      throw new Error(`[PluginManager] Plugin "${name}" not found`);
    }

    try {
      // 执行卸载钩子
      if (record.plugin.uninstall) {
        await record.plugin.uninstall();
      }

      // 更新状态
      record.status = PluginStatus.Uninstalled;

      if (this.options.debug) {
        console.log(`[PluginManager] Plugin "${name}" uninstalled`);
      }
    } catch (error) {
      throw new Error(`[PluginManager] Failed to uninstall plugin "${name}": ${error}`);
    }
  }

  /**
   * 获取插件
   * @param name 插件名称
   * @returns 插件对象
   */
  get<T = any>(name: string): Plugin<T> | undefined {
    const record = this.plugins.get(name);
    return record?.plugin as Plugin<T> | undefined;
  }

  /**
   * 获取插件 API
   * @param name 插件名称
   * @returns 插件 API 对象
   */
  getApi<T = any>(name: string): T | undefined {
    const plugin = this.get<T>(name);
    return plugin?.api;
  }

  /**
   * 检查插件是否存在
   * @param name 插件名称
   * @returns 是否存在
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * 检查插件是否已安装
   * @param name 插件名称
   * @returns 是否已安装
   */
  isInstalled(name: string): boolean {
    const record = this.plugins.get(name);
    return record?.status === PluginStatus.Installed;
  }

  /**
   * 获取所有插件名称
   * @returns 插件名称数组
   */
  list(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 获取所有已安装的插件
   * @returns 已安装插件名称数组
   */
  listInstalled(): string[] {
    return this.list().filter((name) => this.isInstalled(name));
  }

  /**
   * 获取插件状态
   * @param name 插件名称
   * @returns 插件状态
   */
  getStatus(name: string): PluginStatus | undefined {
    return this.plugins.get(name)?.status;
  }

  /**
   * 获取插件记录（包含状态和元数据）
   * @param name 插件名称
   * @returns 插件记录
   */
  getRecord<T = any>(name: string): PluginRecord<T> | undefined {
    return this.plugins.get(name) as PluginRecord<T> | undefined;
  }

  /**
   * 批量安装插件（支持按 order 排序）
   * @param names 插件名称数组
   * @param options 通用配置选项
   */
  async installAll(names: string[], options?: PluginOptions): Promise<void> {
    // 按 order 排序（order 越大越先安装）
    const sortedNames = names.sort((a, b) => {
      const pluginA = this.get(a);
      const pluginB = this.get(b);
      const orderA = pluginA?.order ?? 0;
      const orderB = pluginB?.order ?? 0;
      return orderB - orderA; // 降序
    });

    for (const name of sortedNames) {
      await this.install(name, options);
    }
  }

  /**
   * 获取所有工具栏组件（按 order 排序）
   */
  getToolbarComponents(): ToolbarConfig[] {
    return this.toolbarComponents.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB; // 升序
    });
  }

  /**
   * 获取指定位置的布局组件（按 order 排序）
   */
  getLayoutComponents(position?: 'header' | 'sidebar' | 'footer' | 'global'): LayoutConfig[] {
    let components = this.layoutComponents;

    if (position) {
      components = components.filter(c => c.position === position);
    }

    return components.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB; // 升序
    });
  }

  /**
   * 获取插件的 qiankun 配置
   */
  getQiankunConfig(name: string) {
    const plugin = this.get(name);
    return plugin?.qiankun;
  }

  /**
   * 获取所有共享给子应用的插件
   */
  getSharedPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(record => record.plugin.qiankun?.shared === true)
      .map(record => record.plugin);
  }

  /**
   * 获取生命周期事件（供其他插件使用）
   */
  getLifecycleEvents(): PluginLifecycleEvents {
    return { ...this.lifecycleEvents };
  }

  /**
   * 获取插件配置参数
   */
  getPluginOptions(name: string): PluginOptions | undefined {
    const plugin = this.get(name);
    return plugin?.options;
  }

  /**
   * 移除插件（从管理器中删除）
   * @param name 插件名称
   */
  async remove(name: string): Promise<void> {
    const record = this.plugins.get(name);

    if (!record) {
      throw new Error(`[PluginManager] Plugin "${name}" not found`);
    }

    // 如果已安装，先卸载
    if (record.status === PluginStatus.Installed) {
      await this.uninstall(name);
    }

    // 从管理器中删除
    this.plugins.delete(name);

    if (this.options.debug) {
      console.log(`[PluginManager] Plugin "${name}" removed`);
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear();
    if (this.options.debug) {
      console.log('[PluginManager] All plugins cleared');
    }
  }
}

// 导出类型
export * from './types';
export * from './resource-loader';

// 创建单例
let pluginManagerInstance: PluginManager | null = null;

/**
 * 获取插件管理器实例（单例模式）
 */
export function usePluginManager(options?: PluginManagerOptions): PluginManager {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new PluginManager(options);
  }
  return pluginManagerInstance;
}

/**
 * 重置插件管理器（主要用于测试）
 */
export function resetPluginManager(): void {
  pluginManagerInstance = null;
}

