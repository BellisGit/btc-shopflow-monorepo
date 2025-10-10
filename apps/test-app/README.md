# BTC Vite Plugin 测试应用

用于测试和验证 `@btc/vite-plugin` 插件功能。

## 🚀 启动方式

### 方式 1：使用 pnpm（推荐）

```bash
# 从根目录
cd btc-shopflow-monorepo
pnpm --filter test-app dev

# 或直接在 test-app 目录
cd apps/test-app
pnpm dev
```

### 方式 2：使用 pnpm exec

```bash
cd apps/test-app
pnpm exec vite
```

⚠️ **不要使用 `npx vite`**，会触发 npm 警告（项目强制使用 pnpm）

## 🧪 测试内容

访问 http://localhost:3100/ 查看：

### 1. SVG 插件测试

- 显示 3 个 SVG 图标
- 验证图标命名规则（icon-{模块}-{文件名}）

### 2. Ctx 插件测试

- 显示扫描到的模块列表（order, user）
- 显示服务语言类型（Node）

### 3. Tag 插件测试

- TestComponent 组件
- 在 Vue DevTools 中查看组件名称

### 4. EPS 虚拟模块测试

- 显示 3 个模块的 API 列表（user, order, product）
- 验证 `virtual:eps` 虚拟模块可导入

## 📂 目录结构

```
apps/test-app/
├── src/
│   ├── assets/icons/
│   │   └── icon-home.svg          # SVG 测试（全局图标）
│   ├── modules/
│   │   ├── user/
│   │   │   └── avatar.svg         # SVG 测试（模块图标）
│   │   └── order/
│   │       └── cart.svg           # SVG 测试（模块图标）
│   ├── components/
│   │   └── TestComponent.vue      # Tag 测试
│   ├── App.vue                    # 主页面
│   ├── main.ts                    # 入口
│   └── env.d.ts                   # 虚拟模块类型声明
├── build/eps/
│   └── eps.json                   # Mock EPS 数据
├── mock-server.js                 # Mock HTTP 服务器（可选）
├── vite.config.ts
└── package.json
```

## 🔧 Mock 服务器（可选）

如果需要测试 EPS 热更新功能，启动 Mock 服务器：

```bash
# 终端 1：启动 Mock 服务器
pnpm mock

# 终端 2：修改 vite.config.ts 中的 eps.api 为 'http://localhost:8001/admin/base/open/eps'
# 终端 2：启动测试应用
pnpm dev
```

Mock 服务器提供：

- `http://localhost:8001/admin/base/open/eps` - EPS 元数据
- `http://localhost:8001/admin/base/comm/program` - 服务语言类型

## 📋 验证清单

- [x] 服务器成功启动
- [x] SVG 图标显示正常
- [x] Ctx 信息显示正常
- [x] Tag 组件命名正常
- [x] EPS 虚拟模块加载成功
- [x] 控制台无错误
- [x] 构建成功（`pnpm build`）

## 💡 常见问题

**Q: 看到 npm 警告？**  
A: 不要使用 `npx` 或 `npm` 命令，使用 `pnpm dev` 或 `pnpm exec vite`

**Q: 虚拟模块导入报错？**  
A: 确保插件已构建 `pnpm --filter @btc/vite-plugin build`

**Q: SVG 图标不显示？**  
A: 检查 `virtual:svg-icons` 是否在 main.ts 中导入

**Q: 中文乱码？**  
A: 所有插件日志已改为英文，不会出现乱码
