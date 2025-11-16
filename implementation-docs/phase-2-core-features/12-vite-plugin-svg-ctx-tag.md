# 文档 11：Vite 插件扩展（SVG、Ctx、Tag）

## 📋 目标

实现 `@btc/vite-plugin` 包中的三个核心插件：SVG 图标处理、Ctx 上下文管理、Tag 组件命名。

## 🎯 实施内容

### 1. 安装依赖

```bash
cd packages/vite-plugin
pnpm add -D svgo@^3.0.0 glob@^10.3.0 magic-string@^0.30.0 lodash@^4.17.21 axios@^1.6.0 prettier@^3.0.0 @types/lodash@^4.14.0 @vue/compiler-sfc@^3.4.0
```

### 2. 实现工具模块

创建 `packages/vite-plugin/src/utils/index.ts`：

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import { join } from 'path';
import prettier from 'prettier';

// 获取项目根目录
export function rootDir(path: string): string {
	return join(process.cwd(), path);
}

// 首字母大写
export function firstUpperCase(value: string): string {
	return value.replace(/\b(\w)(\w*)/g, function (_$0, $1, $2) {
		return $1.toUpperCase() + $2;
	});
}

// 横杠转驼峰
export function toCamel(str: string): string {
	return str.replace(/([^-])(?:-+([^-]))/g, function (_$0, $1, $2) {
		return $1 + $2.toUpperCase();
	});
}

// 读取文件
export function readFile(path: string, json?: boolean): any {
	try {
		const content = fs.readFileSync(path, 'utf8');
		return json ? JSON.parse(removeJsonComments(content)) : content;
	} catch (_err) {
		// ignore
	}
	return json ? {} : '';
}

// 写入文件
export function writeFile(path: string, data: string): void {
	try {
		fs.writeFileSync(path, data);
	} catch (_err) {
		// ignore
	}
}

// 格式化内容
export async function formatContent(
	content: string,
	options?: prettier.Options
): Promise<string> {
	return prettier.format(content, {
		parser: 'typescript',
		useTabs: true,
		tabWidth: 4,
		endOfLine: 'lf',
		semi: true,
		...options,
	});
}

// 日志工具
export function error(message: string): void {
	console.log('\x1B[31m%s\x1B[0m', message);
}

export function success(message: string): void {
	console.log('\x1B[32m%s\x1B[0m', message);
}
```

### 3. 实现 SVG 插件

`packages/vite-plugin/src/svg/index.ts`：

**功能**：
- 扫描 `src/` 目录下所有 `.svg` 文件
- 使用 `svgo` 优化 SVG 代码
- 根据模块名自动生成图标名称（如 `user/avatar.svg` → `icon-user-avatar`）
- 将 SVG 转换为 `<symbol>` 格式
- 生成虚拟模块 `virtual:svg-icons` 注入到页面

**使用示例**：
```vue
<template>
  <svg><use href="#icon-user-avatar"></use></svg>
</template>

<script setup>
import 'virtual:svg-icons';
</script>
```

### 4. 实现 Ctx 插件

`packages/vite-plugin/src/ctx/index.ts`：

**功能**：
- 扫描 `src/modules/` 目录，获取所有模块名
- 从后端 API 获取服务语言类型（Node/Java）
- 通过虚拟模块 `virtual:ctx` 导出上下文信息

**使用示例**：
```typescript
import ctx from 'virtual:ctx';

console.log(ctx.modules);     // ['user', 'order', 'product']
console.log(ctx.serviceLang); // 'Node' | 'Java'
```

### 5. 实现 Tag 插件

`packages/vite-plugin/src/tag/index.ts`：

**功能**：
- 解析 `.vue` 文件
- 检测 `<script setup name="ComponentName">` 语法
- 自动生成标准 `<script>` 块，添加 `name` 选项
- 用于 Vue DevTools 显示组件名称和 keep-alive 缓存

**使用示例**：
```vue
<script setup lang="ts" name="UserList">
// Tag 插件会自动转换为：
// <script lang="ts">
// export default defineComponent({ name: "UserList" })
// </script>
</script>
```

### 6. 更新配置文件

`packages/vite-plugin/src/config.ts`：

```typescript
export interface BtcPluginConfig {
	type: 'admin' | 'app' | 'uniapp-x';
	reqUrl: string;                    // 后端地址
	demo: boolean;
	nameTag: boolean;                   // 启用 Tag 插件
	eps: {
		enable: boolean;
		api: string;
		dist: string;
		mapping: EpsMapping[];
	};
	svg: {
		skipNames?: string[];            // 跳过的模块名
	};
	clean: boolean;
}
```

### 7. 集成插件

`packages/vite-plugin/src/index.ts`：

```typescript
export function btc(options: Partial<BtcPluginConfig> = {}): Plugin[] {
	Object.assign(config, options);
	
	const plugins: Plugin[] = [];
	
	// EPS 插件
	if (config.eps?.enable !== false) {
		plugins.push(epsPlugin({...}));
	}
	
	// SVG 插件
	plugins.push(svgPlugin());
	
	// Ctx 插件
	plugins.push(ctxPlugin());
	
	// Tag 插件
	if (config.nameTag) {
		plugins.push(tagPlugin());
	}
	
	return plugins.filter(Boolean);
}
```

### 8. 创建测试应用

创建 `apps/test-app` 测试应用验证插件功能：

**目录结构**：
```
apps/test-app/
├── src/
│   ├── assets/icons/
│   │   └── icon-home.svg          # 测试 SVG
│   ├── modules/
│   │   ├── user/
│   │   │   └── avatar.svg         # 测试 SVG（模块）
│   │   └── order/
│   │       └── cart.svg           # 测试 SVG（模块）
│   ├── components/
│   │   └── TestComponent.vue      # 测试 Tag
│   ├── App.vue                    # 主应用
│   └── main.ts
├── vite.config.ts
└── package.json
```

**验证内容**：
1. SVG 图标是否正确显示（3个图标）
2. Ctx 上下文信息是否正确（2个模块：order、user）
3. Tag 插件是否生效（Vue DevTools 中查看组件名）

## ✅ 验收标准

### 1. SVG 插件
- [ ] 成功扫描项目中的 SVG 文件
- [ ] 自动生成图标名称（含模块前缀）
- [ ] SVG 优化正常工作
- [ ] 虚拟模块 `virtual:svg-icons` 可访问
- [ ] 图标在页面中正确显示

### 2. Ctx 插件
- [ ] 成功扫描 `src/modules/` 目录
- [ ] 正确获取模块列表
- [ ] 虚拟模块 `virtual:ctx` 可访问
- [ ] 上下文信息正确导出

### 3. Tag 插件
- [ ] 正确解析 `<script setup name="...">` 语法
- [ ] 自动注入组件 `name` 属性
- [ ] Vue DevTools 显示正确的组件名

### 4. 构建测试
- [ ] `pnpm build:all` 全量构建通过
- [ ] 所有包构建无错误
- [ ] 测试应用构建成功

### 5. 测试验证
- [ ] 测试应用开发服务器启动成功
- [ ] SVG 图标在浏览器中正确显示
- [ ] Ctx 信息在控制台正确输出
- [ ] 组件名在 Vue DevTools 中正确显示

## 📝 注意事项

1. **SVG 处理**：
   - 简化 SVG 内容提取逻辑，避免复杂的正则匹配
   - 保留 `viewBox` 属性以确保图标缩放正确
   - 处理带换行符的 SVG 文件

2. **模块命名**：
   - 根据目录结构自动生成前缀
   - 支持 `skipNames` 配置跳过特定模块
   - 包含 `icon-` 前缀的文件不再添加模块前缀

3. **类型定义**：
   - 为虚拟模块添加类型声明
   - 创建 `env.d.ts` 文件定义 `virtual:*` 模块

4. **ESLint 配置**：
   - 更新 `.eslintrc.js` 支持 `_` 前缀忽略未使用变量
   - 添加 `caughtErrorsIgnorePattern` 规则

5. **Workspace 配置**：
   - 更新 `pnpm-workspace.yaml` 包含 `apps/*`
   - 确保 workspace 包正确链接

## 🔗 相关文档

- 文档 12：EPS 插件实现
- 文档 13：EPS 完善
- 后续将实现：File、Proxy 等其他插件

## 📊 完成情况

- [x] 工具模块实现
- [x] SVG 插件实现
- [x] Ctx 插件实现
- [x] Tag 插件实现
- [x] 配置文件更新
- [x] 插件集成
- [x] 测试应用创建
- [x] 功能验证
- [x] 文档更新
- [x] 代码提交

**实施时间**：约 2 小时  
**代码行数**：约 600 行（含测试应用）

