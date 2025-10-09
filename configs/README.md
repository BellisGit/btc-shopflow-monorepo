# 共享配置文件

此目录存放 Monorepo 中所有应用共享的配置文件。

## 📋 配置文件

### auto-import.config.ts

自动导入配置，供所有应用使用。

**使用方式**：

```typescript
// packages/main-app/vite.config.ts
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';

export default defineConfig({
  plugins: [vue(), createAutoImportConfig(), createComponentsConfig()],
});
```

## 🎯 优势

- ✅ 配置统一，所有应用行为一致
- ✅ 维护方便，修改一处，所有应用生效
- ✅ 避免重复，DRY 原则

---

后续会添加更多共享配置：

- Vite 公共配置
- TypeScript 公共配置
- 测试配置
