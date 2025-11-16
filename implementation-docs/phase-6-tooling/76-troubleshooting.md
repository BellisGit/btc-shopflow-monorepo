# 42.5 - 常见问题排查

> **阶段**: Phase 6 | **时间**: 3小时 | **前置**: 42

## 🎯 任务目标

整理常见问题和解决方案，建立问题排查知识库。

## 📋 问题分类

### 🔧 环境和构建问题

#### Q1: pnpm install 失败

**问题**: 依赖安装失败或卡住

**原因**:
- 网络问题
- 镜像源不可用
- 版本冲突

**解决**:
```bash
# 1. 切换镜像源
pnpm config set registry https://registry.npmmirror.com

# 2. 清除缓存
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 3. 使用 --frozen-lockfile
pnpm install --frozen-lockfile
```

#### Q2: TypeScript 类型错误

**问题**: 路径别名不识别，类型提示不准确

**解决**:
```bash
# 1. 检查 tsconfig.json 路径配置
# 2. 重启 TS Server（VSCode: Cmd+Shift+P -> Restart TS Server）
# 3. 删除 node_modules/@types 重新安装
rm -rf node_modules/@types
pnpm install
```

#### Q3: Vite 构建失败

**问题**: 构建时出现模块解析错误

**解决**:
```bash
# 1. 清除 Vite 缓存
rm -rf node_modules/.vite
pnpm dev

# 2. 检查 vite.config.ts 中的 alias 配置
# 3. 确保所有依赖安装完整
pnpm install
```

---

### 🎨 qiankun 微前端问题

#### Q4: 子应用加载 404

**问题**: 子应用资源加载失败

**原因**:
- publicPath 配置错误
- CORS 未配置
- entry 地址错误

**解决**:
```typescript
// 1. 检查 public-path.ts
if ((window as any).__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// 2. 检查 Vite 配置
export default defineConfig({
  base: '/',
  server: {
    cors: true,
    origin: 'http://localhost:5001',
  },
});

// 3. 检查主应用配置
entry: isDev ? 'http://localhost:5001' : 'https://logistics.btc-shopflow.com.cn',
```

#### Q5: 子应用样式冲突

**问题**: 主子应用样式互相影响

**解决**:
```typescript
// qiankun 配置
start({
  sandbox: {
    strictStyleIsolation: false, // 不使用 Shadow DOM
    experimentalStyleIsolation: true, // 使用实验性隔离
  },
});

// CSS 使用 scoped 或 CSS Modules
// 避免全局样式污染
```

#### Q6: 子应用路由不生效

**问题**: 子应用路由跳转失败

**解决**:
```typescript
// 1. 确保子应用使用 routerBase
const router = createRouter({
  history: createWebHistory(props.routerBase || '/logistics'),
  routes,
});

// 2. 检查主应用的 activeRule
activeRule: '/logistics',

// 3. 子应用路由使用相对路径
routes: [
  { path: 'order', component: OrderPage }, // ✅
  { path: '/order', component: OrderPage }, // ❌
];
```

---

### 💾 状态管理问题

#### Q7: 全局状态不同步

**问题**: 主子应用状态更新不同步

**解决**:
```typescript
// 主应用
import { setGlobalState } from './micro-app';

setGlobalState({ user: userInfo });

// 子应用
props.globalState?.onGlobalStateChange((state) => {
  console.log('收到状态', state);
  // 更新本地状态
  userStore.setUser(state.user);
});
```

#### Q8: Pinia Store 丢失

**问题**: 刷新页面后 Store 数据丢失

**解决**:
```typescript
// 使用持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Store 中启用持久化
export const useUserStore = defineStore('user', {
  state: () => ({ /* ... */ }),
  persist: true, // 或详细配置
});
```

---

### 🎨 CRUD 系统问题

#### Q9: CRUD 表格不显示数据

**问题**: CrudTable 组件空白

**排查**:
```typescript
// 1. 检查 service 是否正确
console.log(crudConfig.service);

// 2. 检查 API 返回格式
{
  list: [...],  // 必须是 list
  total: 10     // 必须是 total
}

// 3. 检查 columns 配置
table: {
  columns: [
    { prop: 'id', label: 'ID' }, // prop 必须匹配数据字段
  ],
}
```

#### Q10: 表单提交失败

**问题**: CrudForm 提交时报错

**排查**:
```typescript
// 1. 检查表单校验
await formRef.value?.validate();

// 2. 检查 onSubmit 配置
upsert: {
  items: [...],
  onSubmit: async (isEdit, data, { close, refresh }) => {
    await service[isEdit ? 'update' : 'add'](data);
    close();
    refresh();
  },
}

// 3. 检查数据格式
console.log('提交数据:', data);
```

---

### 🚀 性能问题

#### Q11: 首屏加载慢

**排查和优化**:
```bash
# 1. 分析包大小
pnpm build
ls -lh dist/js/*.js

# 2. 检查代码分割
# 查看 dist/stats.html

# 3. 优化建议
- 路由懒加载
- 组件异步加载
- 图片压缩和懒加载
- 开启 Gzip
- 使用 CDN
```

#### Q12: 内存泄漏

**排查**:
```typescript
// 1. 检查事件监听器清理
onMounted(() => {
  eventBus.on('some-event', handler);
});

onUnmounted(() => {
  eventBus.off('some-event', handler); // 必须清理
});

// 2. 检查定时器清理
const timer = setInterval(() => {}, 1000);

onUnmounted(() => {
  clearInterval(timer); // 必须清理
});

// 3. 使用 Chrome DevTools Memory Profiler 分析
```

---

### 🔒 部署问题

#### Q13: Docker 构建失败

**问题**: Docker build 报错

**解决**:
```dockerfile
# 1. 检查 .dockerignore
node_modules
.git

# 2. 使用多阶段构建
FROM node:18-alpine as builder
# ...

FROM nginx:alpine
# ...

# 3. 查看构建日志
docker build -t app . --progress=plain
```

#### Q14: Nginx 502 Bad Gateway

**问题**: 反向代理失败

**排查**:
```bash
# 1. 检查后端服务是否运行
curl http://backend:8001/health

# 2. 检查 Nginx 配置
nginx -t

# 3. 查看 Nginx 日志
tail -f /var/log/nginx/error.log

# 4. 检查网络连接
docker network ls
docker network inspect btc-shopflow-network
```

---

### 🐛 运行时错误

#### Q15: "ResizeObserver loop limit exceeded"

**问题**: 控制台大量 ResizeObserver 错误

**解决**:
```typescript
// 全局捕获并忽略
window.addEventListener('error', (e) => {
  if (e.message.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
  }
});

// Sentry 中忽略
ignoreErrors: ['ResizeObserver loop limit exceeded'],
```

#### Q16: 跨域问题

**问题**: API 请求 CORS 错误

**解决**:
```nginx
# Nginx 配置
add_header Access-Control-Allow-Origin "https://btc-shopflow.com.cn" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

# 处理 OPTIONS 请求
if ($request_method = 'OPTIONS') {
    return 204;
}
```

## 📝 排查流程

### 1. 问题定位
```
收集信息 → 复现问题 → 查看日志 → 定位代码
```

### 2. 常用工具
- Chrome DevTools
- Vue DevTools
- Network 面板
- Console 日志
- Performance 分析

### 3. 日志查看
```bash
# 前端日志
浏览器 Console

# Nginx 日志
tail -f /var/log/nginx/error.log

# Docker 日志
docker logs -f container-name

# 应用日志
tail -f /var/log/app/app.log
```

## 🔗 相关资源

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [Vite 故障排除](https://vitejs.dev/guide/troubleshooting.html)
- [Vue 3 常见问题](https://vuejs.org/guide/extras/faq.html)

## 🔗 下一步

- [42.6 - 迁移指南](./42.6-migration-guide.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

