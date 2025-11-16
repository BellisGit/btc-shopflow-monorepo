# 40.5 - CLI 生成 EPS

> **阶段**: Phase 6 | **时间**: 2小时 | **前置**: 40

## 🎯 任务目标

创建 CLI 命令，手动触发 EPS 服务层生成。

## 📋 执行步骤

### 1. 创建 CLI 脚本

**scripts/generate-eps.js**:
```javascript
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function generateEps(appName, epsUrl, outputDir) {
  console.log(chalk.blue(`🔄 开始生成 ${appName} 的 EPS 服务层...\n`));

  try {
    // 从后端获取 API 元数据
    const response = await axios.get(epsUrl);
    const apiMeta = response.data;

    // 解析生成服务数据
    const services = {};

    for (const [namespace, config] of Object.entries(apiMeta)) {
      const moduleName = namespace.split('/').pop();
      
      services[moduleName] = config.api.map(item => ({
        path: `${namespace}${item.path}`,
        method: item.method.toLowerCase(),
        name: item.path.replace('/', ''),
        summary: item.summary,
      }));
    }

    // 确保输出目录存在
    await fs.ensureDir(outputDir);

    // 生成 JSON
    await fs.writeJson(
      path.join(outputDir, 'eps.json'),
      services,
      { spaces: 2 }
    );

    // 生成 TypeScript 类型定义
    const dts = generateDts(services);
    await fs.writeFile(path.join(outputDir, 'eps.d.ts'), dts);

    console.log(chalk.green(`✅ EPS 生成成功！\n`));
    console.log(chalk.gray(`输出目录: ${outputDir}`));
    console.log(chalk.gray(`模块数量: ${Object.keys(services).length}`));
  } catch (error) {
    console.error(chalk.red(`❌ EPS 生成失败: ${error.message}`));
    process.exit(1);
  }
}

function generateDts(services) {
  let code = `declare module 'virtual:eps' {\n`;
  code += `  interface Service {\n`;

  for (const [module, apis] of Object.entries(services)) {
    code += `    ${module}: {\n`;
    for (const api of apis) {
      const comment = api.summary ? `      /** ${api.summary} */\n` : '';
      code += `${comment}      ${api.name}(data?: any): Promise<any>;\n`;
    }
    code += `    };\n`;
  }

  code += `  }\n`;
  code += `  const service: Service;\n`;
  code += `  export default service;\n`;
  code += `}\n`;

  return code;
}

// 主函数
(async () => {
  const apps = [
    {
      name: 'main-app',
      epsUrl: 'http://localhost:8001/admin/base/open/eps',
      outputDir: path.join(__dirname, '../packages/main-app/build/eps'),
    },
    {
      name: 'logistics-app',
      epsUrl: 'http://localhost:8001/admin/logistics/open/eps',
      outputDir: path.join(__dirname, '../packages/logistics-app/build/eps'),
    },
    {
      name: 'production-app',
      epsUrl: 'http://localhost:8001/admin/production/open/eps',
      outputDir: path.join(__dirname, '../packages/production-app/build/eps'),
    },
  ];

  for (const app of apps) {
    await generateEps(app.name, app.epsUrl, app.outputDir);
  }

  console.log(chalk.green('\n🎉 所有应用的 EPS 生成完成！'));
})();
```

### 2. 添加脚本

**package.json**:
```json
{
  "scripts": {
    "eps:generate": "node scripts/generate-eps.js",
    "eps:watch": "nodemon --watch 'backend/**' --exec 'pnpm eps:generate'"
  }
}
```

### 3. 创建配置文件

**eps.config.js**:
```javascript
module.exports = {
  apps: [
    {
      name: 'main-app',
      epsUrl: process.env.EPS_URL || 'http://localhost:8001/admin/base/open/eps',
      outputDir: 'packages/main-app/build/eps',
    },
    {
      name: 'logistics-app',
      epsUrl: process.env.EPS_URL_LOGISTICS || 'http://localhost:8001/admin/logistics/open/eps',
      outputDir: 'packages/logistics-app/build/eps',
    },
  ],
};
```

### 4. 支持命令行参数

**scripts/generate-eps.js** 补充:
```javascript
const { program } = require('commander');

program
  .option('-a, --app <app>', '指定应用')
  .option('-u, --url <url>', 'EPS URL')
  .option('-o, --output <output>', '输出目录')
  .parse();

const options = program.opts();

if (options.app) {
  const app = apps.find(a => a.name === options.app);
  if (app) {
    await generateEps(
      app.name,
      options.url || app.epsUrl,
      options.output || app.outputDir
    );
  }
} else {
  // 生成所有应用
  for (const app of apps) {
    await generateEps(app.name, app.epsUrl, app.outputDir);
  }
}
```

### 5. 使用示例

```bash
# 生成所有应用
pnpm eps:generate

# 生成指定应用
pnpm eps:generate -- --app main-app

# 指定 URL
pnpm eps:generate -- --app main-app --url http://test-api:8001/admin/base/open/eps

# 监听模式（后端 API 变化时自动生成）
pnpm eps:watch
```

## ✅ 验收标准

### 检查 1: 手动生成

```bash
pnpm eps:generate

# 预期输出:
# 🔄 开始生成 main-app 的 EPS 服务层...
# ✅ EPS 生成成功！
# 输出目录: packages/main-app/build/eps
# 模块数量: 5

# 检查文件
ls packages/*/build/core/
# 预期: eps.json 和 eps.d.ts
```

### 检查 2: 指定应用

```bash
pnpm eps:generate -- --app logistics-app

# 预期: 只生成物流应用的 EPS
```

### 检查 3: 生成内容

```bash
cat packages/main-app/build/core/eps.json

# 预期: 正确的 JSON 格式
{
  "user": [
    { "path": "/admin/user/list", "method": "post", "name": "list" }
  ]
}
```

## 📝 检查清单

- [ ] CLI 脚本创建
- [ ] 配置文件支持
- [ ] 命令行参数
- [ ] 批量生成
- [ ] 单应用生成
- [ ] 监听模式
- [ ] 错误处理
- [ ] 日志输出

## 🎯 使用场景

### 开发时
- 后端 API 更新后手动生成
- 使用监听模式自动生成

### 集成到 CI/CD
```yaml
# .github/workflows/build.yml
- name: Generate EPS
  run: pnpm eps:generate
  env:
    EPS_URL: ${{ secrets.EPS_URL }}
```

## 🔗 下一步

- [41 - 开发规范文档](./41-dev-guidelines.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

