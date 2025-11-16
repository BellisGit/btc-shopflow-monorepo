# 39 - CLI 创建子应用

> **阶段**: Phase 6 | **时间**: 4小时 | **前置**: 38

## 🎯 任务目标

开发 CLI 工具，快速创建新的子应用。

## 📋 执行步骤

### 1. 安装依赖

```bash
pnpm add -Dw prompts chalk fs-extra
```

### 2. 创建 CLI 脚本

**scripts/create-app.js**:
```javascript
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

(async () => {
  console.log(chalk.blue('🚀 创建新的微前端子应用\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'appName',
      message: '应用名称（如：sales-app）',
      validate: value => /^[a-z-]+$/.test(value) || '只能包含小写字母和连字符',
    },
    {
      type: 'text',
      name: 'appTitle',
      message: '应用标题（如：销售管理）',
    },
    {
      type: 'number',
      name: 'port',
      message: '开发端口',
      initial: 5003,
    },
    {
      type: 'text',
      name: 'activeRule',
      message: '激活路由（如：/sales）',
      initial: prev => `/${prev}`,
    },
  ]);

  if (!response.appName) {
    console.log(chalk.red('❌ 已取消'));
    process.exit(0);
  }

  const { appName, appTitle, port, activeRule } = response;
  const appPath = path.join(__dirname, `../packages/${appName}`);

  // 复制模板
  const templatePath = path.join(__dirname, '../packages/sub-app-template');
  await fs.copy(templatePath, appPath);

  // 更新 package.json
  const pkgPath = path.join(appPath, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = appName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // 更新 vite.config.ts
  const viteConfigPath = path.join(appPath, 'vite.config.ts');
  let viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
  viteConfig = viteConfig
    .replace(/qiankun\('.*?'/, `qiankun('${appName}'`)
    .replace(/port: \d+/, `port: ${port}`);
  await fs.writeFile(viteConfigPath, viteConfig);

  // 更新 App.vue
  const appVuePath = path.join(appPath, 'src/App.vue');
  let appVue = await fs.readFile(appVuePath, 'utf-8');
  appVue = appVue.replace(/子应用/g, appTitle);
  await fs.writeFile(appVuePath, appVue);

  // 提示注册到主应用
  console.log(chalk.green('\n✅ 应用创建成功！\n'));
  console.log(chalk.yellow('📝 下一步：\n'));
  console.log(`1. 在主应用的 micro-apps.config.ts 中注册：`);
  console.log(chalk.cyan(`
  {
    name: '${appName}',
    entry: isDev ? 'http://localhost:${port}' : 'https://${appName}.btc-shopflow.com.cn',
    container: '#subapp-container',
    activeRule: '${activeRule}',
  }
  `));
  console.log(`2. 启动应用：pnpm --filter ${appName} dev`);
})();
```

### 3. 添加脚本到 package.json

**根目录 package.json**:
```json
{
  "scripts": {
    "create:app": "node scripts/create-app.js"
  }
}
```

## ✅ 验收标准

### 检查：创建应用

```bash
# 运行脚本
pnpm create:app

# 输入信息
应用名称: sales-app
应用标题: 销售管理
开发端口: 5003
激活路由: /sales

# 验证结果
ls packages/sales-app
# 预期: 应用目录存在

cd packages/sales-app
pnpm dev
# 预期: 应用正常启动
```

## 📝 检查清单

- [ ] CLI 脚本创建
- [ ] 交互式输入
- [ ] 模板复制
- [ ] 配置自动更新
- [ ] 脚本添加到 package.json
- [ ] 创建应用成功
- [ ] 应用能正常启动

## 🔗 下一步

- [40 - CLI 创建业务模块](./40-cli-create-module.md)

---

**状态**: ✅ 就绪 | **预计时间**: 4小时

