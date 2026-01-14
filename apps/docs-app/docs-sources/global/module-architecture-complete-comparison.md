# 模块架构完整对比分析：cool-admin-vue-7.x vs btc-shopflow-monorepo

## 一、核心差异概览

### 1. config.ts 格式差异

#### cool-admin-vue-7.x
```typescript
// modules/{module-name}/config.ts
import type { ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
  return {
    order: 99,
    components: [...],
    views: [...],
    pages: [...],
    install(app) { ... },
    onLoad(events) { ... }
  };
};
```

**特点**：
- ✅ **函数形式**：`export default (): ModuleConfig => { return { ... } }`
- ✅ **不包含业务配置**：没有 locale、columns、forms、service
- ✅ **只包含模块元数据**：name、label、order、components、views、pages
- ✅ **支持钩子函数**：install() 和 onLoad()

#### btc-shopflow-monorepo（当前）
```typescript
// modules/{module-name}/config.ts
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'warehouse',
  label: 'common.module.warehouse.label',
  order: 10,
  
  // PageConfig 字段（保留）
  locale: { ... },
  columns: { ... },
  forms: { ... },
  service: { ... }
} satisfies ModuleConfig;
```

**特点**：
- ⚠️ **对象形式**：`export default { ... } satisfies ModuleConfig`
- ✅ **包含业务配置**：locale、columns、forms、service（扩展 PageConfig）
- ✅ **包含模块元数据**：name、label、order
- ⚠️ **钩子函数未使用**：install() 和 onLoad() 已定义但未实际使用

### 2. ModuleConfig 类型定义差异

#### cool-admin-vue-7.x
```typescript
export interface ModuleConfig {
  name?: string;
  label?: string;
  description?: string;
  order?: number;
  version?: string;
  logo?: string;
  author?: string;
  updateTime?: string;
  demo?: { name: string; component: Component }[] | string;
  doc?: string;
  options?: { [key: string]: any };
  toolbar?: { order?: number; pc?: boolean; h5?: boolean; component: Promise<any> };
  components?: Component[];
  views?: RouteRecordRaw[];
  pages?: (RouteRecordRaw & { isPage?: boolean })[];
  install?(app: App, options?: any): any;
  onLoad?(events: { hasToken: (cb: () => Promise<any> | void) => Promise<any> | void; [key: string]: any }): Promise<{ [key: string]: any }> | Promise<void> | void;
}
```

**不包含**：
- ❌ locale（国际化在独立的 JSON 文件中）
- ❌ columns（表格列配置）
- ❌ forms（表单配置）
- ❌ service（服务配置）

#### btc-shopflow-monorepo
```typescript
export interface ModuleConfig extends PageConfig {
  name?: string;
  label?: string;
  description?: string;
  order?: number;
  version?: string;
  components?: Component[];
  views?: RouteRecordRaw[];
  pages?: (RouteRecordRaw & { isPage?: boolean })[];
  install?(app: App, options?: any): any;
  onLoad?(events: { [key: string]: any }): Promise<any> | void;
}
```

**包含 PageConfig**：
- ✅ locale（国际化配置）
- ✅ columns（表格列配置）
- ✅ forms（表单配置）
- ✅ service（服务配置）

### 3. index.ts 导出模式差异

#### cool-admin-vue-7.x
```typescript
// modules/{module-name}/index.ts
import { useStore } from './store';

export function useModule() {
  return {
    ...useStore()
  };
}

export * from './hooks';
export * from './types';
export * from './utils';
```

**特点**：
- ✅ **导出 useModule() 函数**：统一入口函数
- ✅ **导出 hooks**：`export * from './hooks'`
- ✅ **导出 types**：`export * from './types'`
- ✅ **导出 utils**：`export * from './utils'`
- ✅ **导出 store**：通过 useModule() 函数

#### btc-shopflow-monorepo（当前）
```typescript
// modules/{module-name}/index.ts
// 导出 composables
export * from './composables/useMenuAggregation';

// 导出 utils
export * from './utils/appData';

// 导出配置
export { default as config } from './config';
```

**特点**：
- ⚠️ **没有统一的 useModule() 函数**：直接导出各个功能
- ✅ **导出 composables**：`export * from './composables'`（不是 hooks）
- ❌ **不导出 types**：大部分模块没有 types 目录
- ⚠️ **部分导出 utils**：只有部分模块有 utils
- ✅ **导出 config**：`export { default as config } from './config'`

### 4. 目录结构差异

#### cool-admin-vue-7.x 标准结构
```
modules/
  {module-name}/
    config.ts          # ✅ 必需（函数形式）
    index.ts           # ✅ 推荐（导出 useModule、hooks、types、utils）
    components/        # ✅ 标准（模块组件）
    views/             # ✅ 标准（视图页面）
    pages/             # ✅ 标准（页面，如 error/404.vue）
    hooks/             # ✅ 标准（组合式函数，命名 hooks）
    store/             # ✅ 标准（状态管理，Pinia）
    types/             # ✅ 标准（类型定义）
    utils/             # ✅ 标准（工具函数）
    service/           # ✅ 标准（服务层，API 调用）
    static/            # ✅ 标准（静态资源，svg、css）
    directives/        # ✅ 标准（自定义指令）
```

#### btc-shopflow-monorepo 当前结构
```
modules/
  {module-name}/
    config.ts          # ✅ 大部分有（对象形式，包含 PageConfig）
    index.ts           # ✅ 已创建（导出 composables、utils、config）
    views/             # ✅ 统一存在
    composables/       # ⚠️ 部分有（命名 composables，不是 hooks）
    utils/             # ⚠️ 部分有
    locales/           # ⚠️ 部分有（国际化 JSON 文件）
    types/             # ❌ 大部分缺失
    store/             # ❌ 缺失（状态管理在全局）
    service/           # ❌ 缺失（API 调用在独立的 api-services 模块）
    components/        # ⚠️ 部分有
    pages/             # ⚠️ 仅在 base 模块
    static/            # ❌ 缺失
    directives/        # ❌ 缺失（在全局）
```

## 二、详细对比表

| 项目 | cool-admin-vue-7.x | btc-shopflow-monorepo | 差异说明 |
|------|-------------------|----------------------|---------|
| **config.ts 格式** | 函数：`export default (): ModuleConfig => { return { ... } }` | 对象：`export default { ... } satisfies ModuleConfig` | 格式不同，但功能等价 |
| **config.ts 内容** | 只包含模块元数据（name、order、views、pages） | 包含模块元数据 + PageConfig（locale、columns、forms、service） | 当前项目扩展了功能 |
| **ModuleConfig 类型** | 不扩展其他类型 | 扩展 PageConfig | 当前项目保留了业务配置 |
| **index.ts 导出** | `useModule()` 函数 + `export * from './hooks'` | 直接导出 composables/utils/config | 导出模式不同 |
| **hooks vs composables** | 使用 `hooks/` 目录 | 使用 `composables/` 目录 | 命名不同，功能相同 |
| **store** | 每个模块有 `store/` | 状态管理在全局 | 架构差异 |
| **types** | 每个模块有 `types/` | 大部分模块缺失 | 需要补充 |
| **service** | 每个模块有 `service/` | API 调用在独立的 api-services 模块 | 架构差异 |
| **components** | 标准目录 | 部分模块有 | 不统一 |
| **pages** | 标准目录（error 页面） | 仅在 base 模块 | 不统一 |
| **static** | 标准目录（svg、css） | 缺失 | 需要补充 |
| **directives** | 标准目录 | 在全局 | 架构差异 |
| **国际化** | 独立的 JSON 文件 | 在 config.ts 中（locale 字段） | 策略不同 |

## 三、关键差异分析

### 差异 1：config.ts 是函数还是对象？

**cool-admin-vue-7.x**：
- ✅ **函数形式**：`export default (): ModuleConfig => { return { ... } }`
- ✅ **支持依赖注入**：可以在函数内部调用 `useStore()` 等
- ✅ **动态配置**：可以在运行时决定配置内容
- ✅ **钩子函数实际使用**：`install()` 和 `onLoad()` 在模块加载时被调用
- ✅ **自动模块注册**：通过 `import.meta.glob` 扫描所有 `modules/*/config.ts`，自动注册组件、指令、路由

**btc-shopflow-monorepo**：
- ✅ **对象形式**：`export default { ... } satisfies ModuleConfig`
- ✅ **类型安全**：使用 `satisfies ModuleConfig` 进行编译时类型检查
- ✅ **静态配置**：配置在编译时确定，更易优化
- ⚠️ **钩子函数未使用**：`install()` 和 `onLoad()` 已定义但未实际调用（模块扫描器未实现）
- ⚠️ **手动路由注册**：路由在 `router/routes/*.ts` 中手动配置，未使用 `views` 和 `pages` 字段

**建议**：
- ✅ **保持对象形式**：当前项目已经统一，且更符合 TypeScript 类型检查
- ⚠️ **可选实现模块注册机制**：如果需要自动路由发现，可以实现类似 cool-admin 的模块扫描器
- ⚠️ **钩子函数**：如果不需要动态初始化，可以保持当前方案

### 差异 2：是否包含业务配置（locale、columns、forms、service）？

**cool-admin-vue-7.x**：
- config.ts 只包含模块元数据
- 业务配置（国际化、表格列、表单）在独立文件中

**btc-shopflow-monorepo**：
- config.ts 包含模块元数据 + 业务配置
- 所有配置集中在一个文件中

**建议**：
- ✅ **保持当前方案**：已经为 config.ts 模式投入大量逻辑（600+ 行的 config-loader.ts）
- ✅ **保留 locale 在 config.ts**：与 columns/forms 关联性强，维护方便

### 差异 3：index.ts 导出模式

**cool-admin-vue-7.x**：
```typescript
// modules/{module-name}/index.ts
import { useStore } from './store';

export function useModule() {
  return {
    ...useStore()
  };
}

export * from './hooks';
export * from './types';
export * from './utils';
```

**特点**：
- ✅ **统一入口函数**：`useModule()` 提供模块的统一访问入口
- ✅ **导出 store**：通过 `useModule()` 函数导出模块状态
- ✅ **批量导出**：`export * from './hooks'` 等批量导出

**btc-shopflow-monorepo**：
```typescript
// modules/{module-name}/index.ts
// 导出 composables
export * from './composables/useMenuAggregation';

// 导出 utils
export * from './utils/appData';

// 导出配置
export { default as config } from './config';
```

**特点**：
- ⚠️ **没有统一入口函数**：直接导出各个功能，没有 `useModule()` 函数
- ⚠️ **没有 store**：状态管理在全局，模块内没有 store
- ✅ **直接导出**：更直接，无需额外封装

**建议**：
- ⚠️ **可选添加 useModule() 函数**：如果模块有 store 或需要统一入口，可以添加
- ✅ **保持直接导出**：当前方案更直接，适合没有 store 的模块

### 差异 4：hooks vs composables

**cool-admin-vue-7.x**：
- 使用 `hooks/` 目录
- 导出：`export * from './hooks'`

**btc-shopflow-monorepo**：
- 使用 `composables/` 目录
- 导出：`export * from './composables'`

**建议**：
- ✅ **保持 composables 命名**：Vue 3 官方推荐使用 composables，更符合 Vue 生态

### 差异 5：types 目录

**cool-admin-vue-7.x**：
- 每个模块都有 `types/index.d.ts`
- 导出：`export * from './types'`

**btc-shopflow-monorepo**：
- 大部分模块缺失 `types/` 目录
- 类型定义分散在全局或共享包中

**建议**：
- ⚠️ **可选补充 types 目录**：如果模块有特定类型定义，可以创建
- ✅ **当前方案可接受**：类型定义在共享包中也是合理的

## 四、当前项目状态统计

### 模块统计（基于扫描结果）

| 项目 | 数量 |
|------|------|
| 总模块数 | 约 50+ 个 |
| 已有 config.ts | 25 个（已统一为 ModuleConfig，对象形式） |
| 已有 index.ts | 58 个（已全部创建） |
| 已有 composables/ | 18 个模块 |
| 已有 utils/ | 8 个模块 |
| 已有 types/ | 5 个模块 |
| 已有 store/ | 0 个模块 |
| 已有 service/ | 0 个模块 |

### config.ts 格式统一情况

- ✅ **所有 24 个 config.ts 已统一为 ModuleConfig 格式（对象形式）**
- ✅ **所有 config.ts 都包含模块元数据字段（name、label、order）**
- ✅ **所有 config.ts 都保留了 PageConfig 字段（locale、columns、forms、service）**
- ✅ **所有 config.ts 都使用 `satisfies ModuleConfig` 进行类型检查**
- ⚠️ **与 cool-admin-vue-7.x 不同**：cool-admin 使用函数形式 `export default (): ModuleConfig => { return { ... } }`，当前项目使用对象形式 `export default { ... } satisfies ModuleConfig`

### index.ts 创建情况

- ✅ **所有 58 个模块都已创建 index.ts**
- ✅ **有 composables 的模块已正确导出（18 个模块）**
- ✅ **有 utils 的模块已正确导出（8 个模块）**
- ✅ **所有模块都导出了 config**
- ⚠️ **与 cool-admin-vue-7.x 不同**：cool-admin 导出 `useModule()` 函数和 `export * from './hooks'`，当前项目直接导出 composables/utils/config

## 五、改进建议

### 高优先级（必须修复）

1. ✅ **统一 config.ts 格式**（已完成）
   - 所有 config.ts 已统一为 ModuleConfig 格式
   - 保留了 locale、columns、forms、service 字段

2. ✅ **创建 index.ts 入口文件**（已完成）
   - 所有模块都已创建 index.ts
   - 正确导出了 composables、utils、config

### 中优先级（推荐改进）

3. ⚠️ **考虑将 config.ts 改为函数形式**（可选）
   - 如果需要动态配置或依赖注入，可以考虑改为函数形式
   - 当前对象形式已经足够，无需强制修改

4. ⚠️ **补充 types 目录**（可选）
   - 如果模块有特定类型定义，可以创建 `types/index.d.ts`
   - 当前类型定义在共享包中也是合理的

5. ⚠️ **统一 composables 导出**（可选）
   - 如果模块有多个 composables 文件，可以创建 `composables/index.ts`
   - 当前直接导出也是可以的

### 低优先级（架构差异，无需修改）

6. ✅ **保持 composables 命名**（无需修改）
   - Vue 3 官方推荐使用 composables，比 hooks 更符合 Vue 生态

7. ✅ **保持 store 在全局**（架构差异）
   - 当前项目使用全局状态管理，无需每个模块都有 store

8. ✅ **保持 service 在 api-services 模块**（架构差异）
   - 当前项目使用独立的 api-services 模块，无需每个模块都有 service

## 六、关键发现

### 1. config.ts 格式差异

| 项目 | 格式 | 数量 | 说明 |
|------|------|------|------|
| cool-admin-vue-7.x | 函数形式 | 7 个 | `export default (): ModuleConfig => { return { ... } }` |
| btc-shopflow-monorepo | 对象形式 | 24 个 | `export default { ... } satisfies ModuleConfig` |

**关键点**：
- cool-admin 的 config.ts 是**函数**，支持动态配置和依赖注入
- 当前项目的 config.ts 是**对象**，静态配置，类型安全

### 2. 模块注册机制差异

**cool-admin-vue-7.x**：
- ✅ **自动模块扫描**：通过 `import.meta.glob` 自动扫描 `modules/*/config.ts`
- ✅ **自动注册组件**：从 `components` 字段自动注册组件
- ✅ **自动注册指令**：从 `directives` 字段自动注册指令
- ✅ **自动注册路由**：从 `views` 和 `pages` 字段自动注册路由
- ✅ **钩子函数调用**：自动调用 `install()` 和 `onLoad()` 钩子

**btc-shopflow-monorepo（微前端架构）**：
- ✅ **自动路由发现（已实际使用）**：通过 `scanRoutesFromConfigFiles` 自动扫描 `modules/*/config.ts` 中的 `views` 字段，所有业务模块都已使用
- ✅ **pages 字段（已优化）**：错误页面已移至 `@btc/shared-components` 包，供所有应用共享使用（404、401、403、500、502）
- ✅ **components 字段（插件使用）**：功能已实现，插件中有使用（如 echarts 注册 v-chart 组件），业务模块无需使用（全局组件在 @btc/shared-components）
- ✅ **directives 字段（按需使用）**：功能已实现，可在插件或共享包中使用，业务模块无需使用（当前无全局指令需求）
- ✅ **install 钩子（插件使用）**：功能已实现，插件中有使用（如 echarts、test-plugin），业务模块无初始化需求
- ✅ **onLoad 钩子（插件使用）**：功能已实现，插件中有使用（如 test-plugin），业务模块无加载回调需求
- ✅ **架构优化完成**：所有机制都已实现，职责划分清晰（插件系统 + 业务模块 + 共享包），符合微前端最佳实践

### 3. store 架构差异

**cool-admin-vue-7.x**：
- ✅ **每个模块有 store**：`modules/{module-name}/store/`
- ✅ **通过 useModule() 导出**：`export function useModule() { return { ...useStore() } }`
- ✅ **模块级状态管理**：每个模块管理自己的状态

**btc-shopflow-monorepo**：
- ⚠️ **状态管理在全局**：没有模块级 store
- ⚠️ **没有 useModule() 函数**：直接导出 composables/utils
- ✅ **全局状态管理**：使用全局 Pinia store

### 4. hooks vs composables

**cool-admin-vue-7.x**：
- 使用 `hooks/` 目录
- 导出：`export * from './hooks'`
- 示例：`useDept()`, `useChat()`, `useSpace()`

**btc-shopflow-monorepo**：
- 使用 `composables/` 目录（Vue 3 官方推荐）
- 导出：`export * from './composables'`
- 示例：`useMenuAggregation()`, `useLogin()`, `useHomeCharts()`

## 七、总结

### 已完成的工作

1. ✅ **创建了 ModuleConfig 类型定义**（扩展 PageConfig）
2. ✅ **统一了所有 config.ts 格式**（24 个文件，对象形式）
3. ✅ **为所有模块创建了 index.ts**（58 个文件）
4. ✅ **保留了 locale 在 config.ts 中**（不迁移到 JSON 文件）

### 与 cool-admin-vue-7.x 的主要差异

| 差异项 | cool-admin-vue-7.x | btc-shopflow-monorepo | 影响 |
|--------|-------------------|----------------------|------|
| **config.ts 格式** | 函数形式 | 对象形式 | 功能等价，对象形式更简洁 |
| **业务配置位置** | 独立文件 | 在 config.ts 中 | 当前方案更适合，关联性强 |
| **导出模式** | useModule() 函数 | 直接导出 | 两种方案都可行 |
| **目录命名** | hooks | composables | Vue 3 推荐 composables |
| **store** | 模块级 | 全局 | 架构选择不同 |
| **service** | 模块级 | 独立 api-services 模块 | 架构选择不同 |
| **模块注册** | 自动扫描和注册 | 手动配置 | 当前方案更灵活，但需要手动维护 |
| **钩子函数** | 实际使用 | 已定义但未使用 | 可选功能，当前不需要 |

### 结论

当前项目的模块架构已经**基本统一**，与 cool-admin-vue-7.x 的主要差异是**架构选择不同**，而非**问题**。

**当前方案的优势**：
- ✅ **功能完整**：所有必需的功能都已实现
- ✅ **类型安全**：使用 TypeScript 类型检查
- ✅ **统一规范**：所有模块都遵循相同的结构
- ✅ **适合项目**：保留了业务配置在 config.ts 中，更适合当前项目
- ✅ **更灵活**：手动路由配置更灵活，不受自动扫描限制

**cool-admin-vue-7.x 的优势**：
- ✅ **自动化程度高**：自动扫描和注册，减少手动配置
- ✅ **模块化更强**：每个模块有独立的 store 和 service
- ✅ **钩子机制**：install() 和 onLoad() 提供模块生命周期管理

**建议**：
- ✅ **保持当前架构**：当前方案已经足够好，无需强制对齐 cool-admin-vue-7.x
- ✅ **自动路由发现已完全实现**：已实现模块路由扫描器，所有应用都已集成，完全按照 cool-admin 的方案
- ✅ **架构差异可接受**：store/service 在全局 vs 在模块内，是架构选择问题，不是对错问题

### 模块注册机制（功能已实现，实际使用情况说明）

**已实现的功能**：

#### 1. 自动路由发现（已实际使用）
- ✅ **路由扫描器**：`packages/shared-core/src/utils/route-scanner.ts`
- ✅ **自动提取路由**：从模块 config.ts 中提取 `views` 字段（`pages` 字段功能支持但未使用）
- ✅ **已集成到所有应用**：
  - admin-app ✅
  - system-app ✅
  - logistics-app ✅
  - finance-app ✅
  - quality-app ✅
  - engineering-app ✅
  - production-app ✅
  - operations-app ✅
  - dashboard-app ✅
  - personnel-app ✅
- ✅ **完全按照 cool-admin 方案**：所有路由都从模块配置中自动发现，已删除所有手动路由配置

#### 2. 自动组件和指令注册（功能已实现，但模块中未使用）
- ✅ **模块扫描器**：`apps/*/src/bootstrap/integrations/module-scanner.ts`
- ✅ **插件管理器**：`packages/shared-core/src/btc/plugins/manager/index.ts`
- ✅ **自动注册组件**：从 `config.ts` 的 `components` 字段自动注册全局组件（功能已实现）
- ✅ **自动注册指令**：从 `config.ts` 的 `directives` 字段自动注册全局指令（功能已实现）
- ⚠️ **实际使用情况**：模块的 `config.ts` 中未使用 `components` 和 `directives` 字段，但插件中有使用（如 echarts 插件使用 `install` 钩子）
- ✅ **已集成到主应用**：main-app, admin-app, system-app 都已调用 `autoDiscoverPlugins()`

#### 3. 钩子函数调用（功能已实现，但模块中未使用）
- ✅ **install 钩子**：在 `PluginManager.install()` 中自动调用（功能已实现）
- ✅ **onLoad 钩子**：在 `PluginManager.install()` 中自动调用，支持事件传递（功能已实现）
- ⚠️ **实际使用情况**：模块的 `config.ts` 中未使用 `install()` 和 `onLoad()` 钩子，但插件中有使用（如 echarts、test-plugin）
- ✅ **与 cool-admin 对齐**：功能实现与 cool-admin 的 `createModule()` 和 `eventLoop()` 一致，但实际使用场景不同（主要用于插件而非模块）

**使用方法**：
在模块的 `config.ts` 中添加 `views` 和 `pages` 字段：

```typescript
export default {
  name: 'navigation',
  order: 40,
  
  // 添加路由配置
  views: [
    {
      path: '/navigation/menus',
      name: 'NavigationMenus',
      component: () => import('./views/menus/index.vue'),
      meta: { isPage: true, titleKey: 'menu.navigation.menus' },
    },
  ],
  
  pages: [
    {
      path: '/404',
      name: 'NotFound404',
      component: () => import('./pages/error/404.vue'),
      meta: { isPage: true, pageType: 'error', process: false },
    },
  ],
  
  // ... 其他配置
} satisfies ModuleConfig;
```

**详细文档**：参考 `docs/auto-route-discovery-usage.md`

### 错误页面处理（已优化）

**已实现的功能**：
- ✅ **错误页面组件**：已移至 `@btc/shared-components` 包
  - `BtcError404` - 404 页面未找到
  - `BtcError401` - 401 未授权
  - `BtcError403` - 403 禁止访问
  - `BtcError500` - 500 服务器错误
  - `BtcError502` - 502 网关错误

**使用方式**：
```typescript
// 在应用的路由配置中引用（可选）
import { BtcError404 } from '@btc/shared-components';

export const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: BtcError404,
  }
];
```

**优势**：
- ✅ 统一的错误页面样式
- ✅ 多应用共享，无需重复开发
- ✅ 支持国际化
- ✅ 自动适配主题

### 详细对比数据

| 项目 | cool-admin-vue-7.x | btc-shopflow-monorepo | 说明 |
|------|-------------------|----------------------|------|
| **config.ts 总数** | 7 个 | 24 个 | 当前项目模块更多 |
| **config.ts 格式** | 函数形式 100% | 对象形式 100% | 格式统一，但形式不同 |
| **index.ts 总数** | 2 个（base, dict） | 58 个 | 当前项目已全部创建 |
| **composables/hooks** | hooks（2个模块） | composables（18个模块） | 命名不同，功能相同 |
| **store** | 2 个模块有 | 0 个模块有 | 架构差异 |
| **types** | 2 个模块有 | 5 个模块有 | 当前项目部分有 |
| **utils** | 2 个模块有 | 8 个模块有 | 当前项目部分有 |
| **views** | 所有模块有 | 所有模块有 | ✅ 一致 |
| **pages** | base 模块有 | 在 @btc/shared-components 包 | ✅ 错误页面已移至共享组件包 |
| **components** | base 模块有 | 未使用（功能支持但未实际使用，插件中有使用） | ⚠️ 功能已实现但模块中未使用 |
| **service** | chat 模块有 | 0 个模块有（在 api-services） | 架构差异 |
| **directives** | base 模块有 | 支持在 config.ts 中配置 | ✅ 已支持，通过 PluginManager 自动注册 |
| **static** | base 模块有 | 0 个模块有 | 架构差异 |

### 关键结论

1. **config.ts 格式**：函数 vs 对象
   - ✅ **两种形式都有效**：功能等价，只是写法不同
   - ✅ **当前对象形式更简洁**：适合静态配置
   - ⚠️ **cool-admin 函数形式更灵活**：支持动态配置和依赖注入

2. **业务配置位置**：独立文件 vs config.ts
   - ✅ **当前方案更适合**：locale 与 columns/forms 关联性强，放在一起维护方便
   - ✅ **已投入大量逻辑**：600+ 行的 config-loader.ts 专门处理 config.ts 模式

3. **模块注册机制**：架构优化完成
   - ✅ **功能已完全实现**：通过 `PluginManager` 和 `module-scanner` 自动扫描并注册
   - ✅ **实际使用情况（符合微前端最佳实践）**：
     - ✅ **views 字段**：业务模块使用，定义路由
     - ✅ **pages 字段**：错误页面移至 @btc/shared-components 共享包
     - ✅ **components 字段**：插件系统使用（echarts 等）
     - ✅ **directives 字段**：共享包或插件使用（按需）
     - ✅ **install/onLoad 钩子**：插件系统使用（echarts、test-plugin）
   - ✅ **架构设计**：
     - **插件系统**：可插拔功能（echarts、编辑器等）使用全部字段
     - **业务模块**：一级菜单路由，只需 views 字段
     - **共享组件包**：公共资源（组件、错误页面等）
     - **主应用协调**：全局错误处理、用户管理等

4. **store/service 架构**：模块级 vs 全局
   - ✅ **两种方案都可行**：是架构选择问题，不是对错问题
   - ✅ **当前全局方案**：适合 monorepo 多应用场景，避免重复

5. **目录命名**：hooks vs composables
   - ✅ **composables 更符合 Vue 3 规范**：Vue 3 官方推荐使用 composables
   - ✅ **保持当前命名**：无需修改为 hooks
