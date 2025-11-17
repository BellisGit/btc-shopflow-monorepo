# BTC ShopFlow Mobile App

移动端应用，首期聚焦盘点功能，后续可扩展其他业务模块。

## 技术栈

- **框架**: Vue 3 + Vite
- **UI**: Vant Mobile
- **状态管理**: Pinia
- **路由**: Vue Router
- **本地存储**: Dexie (IndexedDB)
- **PWA**: Workbox
- **扫码**: @zxing/library (PWA) / Capacitor Barcode Scanner (原生)
- **构建**: Capacitor (可选，用于生成 APK/IPA)

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 目录结构

```
apps/mobile-app/
├── src/
│   ├── modules/
│   │   ├── auth/          # 认证模块
│   │   ├── base/           # 基础组件和布局
│   │   ├── inventory/      # 盘点模块（首期功能）
│   │   ├── sync/           # 数据同步模块
│   │   ├── masterdata/     # 主数据管理
│   │   └── logs/           # 日志系统
│   ├── db/                 # IndexedDB 数据库定义
│   ├── stores/             # Pinia 状态管理
│   ├── router/             # 路由配置
│   └── i18n/               # 国际化
├── public/                 # 静态资源
└── capacitor.config.ts     # Capacitor 配置
```

## 数据模型

盘点相关表结构对齐系统域的盘点模块：

- `items`: 物料信息
- `locations`: 库位信息
- `inventory_sessions`: 盘点会话
- `counts`: 盘点记录
- `attachments`: 附件
- `pending_ops`: 待同步操作队列

## PWA 功能

- 离线优先架构
- Service Worker 自动更新
- 后台同步（Background Sync）
- 运行时缓存 API 请求
- 预缓存静态资源

## Android 构建

### 使用 Docker 构建 APK

```bash
# 1. 先构建 Web 版本
docker build -f Dockerfile --build-arg APP_DIR=apps/mobile-app -t mobile-app-web .

# 2. 构建 APK（需要 Dockerfile.android）
docker build -f Dockerfile.android -t mobile-app-apk --output type=local,dest=./out .
```

### 本地构建（需要 Android SDK）

```bash
# 安装 Capacitor CLI
pnpm add -g @capacitor/cli

# 同步到 Android 项目
npx cap sync android

# 构建 APK
cd android && ./gradlew assembleRelease
```

## Docker 部署

```bash
# 使用 docker-compose
docker compose up mobile-app --build

# 或单独构建
docker build -f Dockerfile --build-arg APP_DIR=apps/mobile-app -t btc-shopflow/mobile-app:latest .
docker run -p 8091:80 btc-shopflow/mobile-app:latest
```

访问: http://localhost:8091

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=BTC ShopFlow Mobile
```

## 注意事项

1. 所有样式应使用全局样式文件，禁止内联或局部样式
2. 使用原生 fetch API，不使用 axios
3. 遵循项目的 i18n 规范
4. 组件命名使用 `btc-` 前缀

