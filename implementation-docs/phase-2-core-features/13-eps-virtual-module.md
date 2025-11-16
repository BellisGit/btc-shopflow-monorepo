# 文档 13：EPS 虚拟模块增强

## 📋 目标

增强 EPS 插件，添加虚拟模块支持、热更新机制和完整的类型声明。

## 🎯 实施内容

### 1. 增强 EPS 插件 - 添加热更新机制

更新 `packages/vite-plugin/src/eps/index.ts`：

```typescript
// 添加数据缓存和热更新机制
let epsDataCache: any = null;
let updateTimer: NodeJS.Timeout | null = null;

// configureServer 钩子
configureServer(server: ViteDevServer) {
  if (!epsUrl || !watch) {
    return;
  }
  
  console.log('[EPS] Auto-update enabled (every 10s)');
  
  // 每 10 秒检查一次更新
  updateTimer = setInterval(async () => {
    // 检查 API 变化
    // 触发热更新
    server.moduleGraph.invalidateModule(module);
    server.ws.send({ type: 'full-reload', path: '*' });
  }, 10000);
}
```

**关键点**：
- 缓存 EPS 数据，避免重复请求
- 检测数据变化，只在真正改变时更新
- 使用 `moduleGraph.invalidateModule` 精确控制更新
- 通过 WebSocket 通知客户端刷新

### 2. 支持本地 Mock 模式

```typescript
async buildStart() {
  // 如果没有 epsUrl，跳过生成（使用本地文件）
  if (!epsUrl) {
    console.log('[EPS] Using local mock data mode');
    return;
  }
  
  console.log('[EPS] Generating service layer...');
  // ...
}
```

**用途**：
- 开发时无需后端服务
- 使用本地 `build/eps/eps.json` 文件
- 方便快速测试和演示

### 3. 创建虚拟模块类型声明

创建 `packages/vite-plugin/src/eps/virtual-eps.d.ts`：

```typescript
declare module 'virtual:eps' {
  interface ApiMethod {
    path: string;
    method: string;
    name: string;
    summary?: string;
  }

  interface ServiceModule {
    [key: string]: ApiMethod[];
  }

  const epsData: ServiceModule;
  export default epsData;
}
```

### 4. 创建 Mock 数据

创建 `packages/vite-plugin/test/virtual-eps.mock.ts`：

```typescript
export const mockEpsData = {
  user: [
    { path: '/admin/user/list', method: 'POST', name: 'list' },
    { path: '/admin/user/add', method: 'POST', name: 'add' },
    // ...
  ],
  order: [...],
  product: [...],
};
```

### 5. 测试应用增强

更新 `apps/test-app/src/App.vue`，添加 EPS 虚拟模块测试：

```vue
<script setup lang="ts">
const epsInfo = ref<any>(null);

onMounted(async () => {
  try {
    const eps = await import('virtual:eps');
    epsInfo.value = eps.default;
    console.log('[EPS Test] Virtual module data:', eps.default);
  } catch (err) {
    console.error('[EPS Test] Load failed:', err);
  }
});
</script>
```

### 6. 创建 Mock 服务器（可选）

创建 `apps/test-app/mock-server.js`：

```javascript
// HTTP 服务器，模拟后端 EPS API
const server = http.createServer((req, res) => {
  if (req.url === '/admin/base/open/eps') {
    res.end(JSON.stringify(mockEpsData));
  }
});

server.listen(8001);
```

### 7. 修复参数传递问题

更新 `packages/vite-plugin/src/index.ts`：

```typescript
// 正确处理空字符串的情况
epsUrl: config.eps?.api !== undefined ? config.eps.api : '/admin/base/open/eps'
```

**问题**：`config.eps?.api || '/admin/base/open/eps'` 会把空字符串当作 falsy 值  
**解决**：使用 `!== undefined` 判断

## ✅ 验收标准

### 1. 虚拟模块可导入
- [x] `import epsData from 'virtual:eps'` 不报错
- [x] epsData 包含正确的 API 数据
- [x] 控制台输出 Mock 数据（3个模块：user, order, product）

### 2. 类型提示正常
- [x] 虚拟模块类型声明文件存在
- [x] TypeScript 不报错
- [x] 编辑器有类型提示

### 3. 本地 Mock 模式
- [x] `epsUrl` 为空时使用本地文件
- [x] 日志显示 "Using local mock data mode"
- [x] 页面正常加载 EPS 数据

### 4. 热更新机制
- [x] `configureServer` 钩子实现
- [x] 定时检测 API 变化（10秒）
- [x] 模块失效和 WebSocket 通知逻辑正确
- [x] 服务器关闭时清理定时器

### 5. 构建测试
- [x] `pnpm build:all` 全量构建通过
- [x] 测试应用构建成功
- [x] 虚拟模块被正确编译

### 6. 日志输出
- [x] 所有日志改为英文，避免乱码
- [x] 日志清晰易读

## 📝 技术要点

### 虚拟模块机制

**resolveId** → **load** → **transform**

1. `resolveId`: 识别虚拟模块 ID，返回 `\0` 前缀标识
2. `load`: 返回模块代码（字符串）
3. Vite 自动处理编译和缓存

### 热更新流程

1. 定时检测后端 API 变化
2. 对比缓存数据判断是否更新
3. 重新生成 EPS 文件
4. 使 `virtual:eps` 模块失效
5. 通过 WebSocket 通知客户端刷新

### 类型安全

通过 `declare module 'virtual:*'` 为虚拟模块提供类型支持，确保编辑器智能提示和 TypeScript 检查。

## 🔗 相关文件

- `packages/vite-plugin/src/eps/index.ts` - EPS 插件主文件
- `packages/vite-plugin/src/eps/virtual-eps.d.ts` - 虚拟模块类型声明
- `packages/vite-plugin/test/virtual-eps.mock.ts` - Mock 数据
- `apps/test-app/build/eps/eps.json` - 本地 Mock EPS 数据
- `apps/test-app/mock-server.js` - Mock 服务器（可选）

## 📊 完成情况

- [x] 数据缓存机制
- [x] 热更新检测逻辑
- [x] 本地 Mock 模式支持
- [x] 虚拟模块类型声明
- [x] Mock 数据文件
- [x] Mock 服务器脚本
- [x] 测试应用验证
- [x] 日志英文化（避免乱码）
- [x] 全量构建通过

**实施时间**：约 1.5 小时  
**代码行数**：约 150 行

