# @build-utils/logger

构建工具包 - 日志工具

专门用于构建阶段脚本（构建脚本、lint 脚本、部署脚本等），不依赖任何业务包，避免循环依赖。

## 特性

- ✅ **纯构建工具**：不依赖任何业务包（包括 @btc/shared-core）
- ✅ **统一规范**：提供统一的构建日志规范（颜色、格式等）
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **零依赖**：仅使用 Node.js 内置模块

## 安装

```bash
pnpm add @build-utils/logger --workspace
```

## 使用

```typescript
import { logger } from '@build-utils/logger';

// 基本使用
logger.info('开始构建...');
logger.success('构建完成');
logger.warn('警告信息');
logger.error('错误信息', error);

// 创建带前缀的子 logger
const childLogger = logger.child('build');
childLogger.info('构建中...');
```

## API

### logger.debug(message, ...args)
仅在 DEBUG 模式下输出调试信息。

### logger.info(message, ...args)
输出信息日志。

### logger.warn(message, ...args)
输出警告日志。

### logger.error(message, error?, ...args)
输出错误日志，支持传入 Error 对象。

### logger.success(message, ...args)
输出成功信息（带绿色 ✓ 标记）。

### logger.child(prefix)
创建带前缀的子 logger。

## 环境变量

- `DEBUG` 或 `LOG_LEVEL=debug`：启用 debug 日志
- `NO_COLOR` 或 `FORCE_COLOR=0`：禁用颜色输出
- `FORCE_COLOR=1|2|3`：强制启用颜色输出
