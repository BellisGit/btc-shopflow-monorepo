# 42 - 团队培训材料

> **阶段**: Phase 6 | **时间**: 4小时 | **前置**: 41

## 🎯 任务目标

准备团队培训材料，确保新成员快速上手。

## 📋 执行步骤

### 1. 创建培训大纲

**docs/training/README.md**:
```markdown
# 微前端项目培训大纲

## 培训周期：5 天

### Day 1: 架构概览
- 微前端概念和 qiankun 原理
- Monorepo 架构介绍
- 项目目录结构讲解
- 开发环境搭建

### Day 2: 核心系统
- EPS 自动化服务生成
- CRUD 配置化开发
- 插件系统使用
- 数据字典和权限

### Day 3: 主应用开发
- 主应用结构
- 全局状态管理
- 布局系统
- 路由和权限控制

### Day 4: 子应用开发
- 子应用创建
- 生命周期理解
- 跨应用通信
- 实战：开发一个模块

### Day 5: 部署和工具
- 构建优化
- Docker 部署
- CI/CD 流程
- CLI 工具使用
```

### 2. 创建快速上手指南

**docs/training/quick-start.md**:
```markdown
# 新人快速上手指南

## 1. 环境准备（30分钟）

### 安装工具
\`\`\`bash
# Node.js >= 18
node --version

# pnpm >= 8
npm install -g pnpm

# Git
git --version
\`\`\`

### 克隆项目
\`\`\`bash
git clone xxx
cd btc-shopflow-monorepo
pnpm install
\`\`\`

### 启动项目
\`\`\`bash
pnpm dev:all
\`\`\`

## 2. 第一个任务（2小时）

### 创建新模块
\`\`\`bash
pnpm create:module
\`\`\`

### 配置 CRUD
编辑 \`crud.ts\`，配置表格列和表单项

### 测试功能
访问页面，验证增删改查功能

## 3. 常见问题

### Q: 端口被占用？
A: 修改 vite.config.ts 中的 port

### Q: 类型报错？
A: 运行 \`pnpm type-check\`

### Q: 提交被拒绝？
A: 检查代码规范，运行 \`pnpm lint:fix\`
```

### 3. 创建实战练习

**docs/training/exercises.md**:
```markdown
# 实战练习

## 练习 1: 创建商品管理模块（2小时）

### 需求
- 商品列表展示
- 新增/编辑商品
- 商品上下架
- 导出商品数据

### 步骤
1. 使用 CLI 创建模块
2. 配置 CRUD
3. 添加自定义操作（上下架）
4. 集成导出插件

### 验收标准
- [ ] 列表正常显示
- [ ] 新增/编辑功能正常
- [ ] 上下架操作正常
- [ ] 导出功能正常

## 练习 2: 子应用通信（1小时）

### 需求
- 在商品模块创建订单
- 订单模块接收商品信息

### 步骤
1. 使用 eventBus 发送事件
2. 在订单模块监听事件
3. 显示接收到的数据

### 验收标准
- [ ] 事件发送成功
- [ ] 事件接收成功
- [ ] 数据传递正确
```

### 4. 创建 FAQ 文档

**docs/training/faq.md**:
```markdown
# 常见问题解答

## 开发相关

### Q: 如何创建新的子应用？
\`\`\`bash
pnpm create:app
\`\`\`

### Q: 如何创建新的业务模块？
\`\`\`bash
pnpm create:module
\`\`\`

### Q: 如何调试子应用？
1. 独立启动子应用
2. 在主应用中加载子应用
3. 使用 Vue DevTools

## CRUD 相关

### Q: 如何自定义表格列？
\`\`\`typescript
{
  prop: 'status',
  label: '状态',
  formatter: (row) => row.status === 1 ? '启用' : '禁用',
}
\`\`\`

### Q: 如何添加自定义操作？
\`\`\`typescript
table: {
  actions: {
    custom: [
      {
        label: '审批',
        click: (row) => { /* 处理逻辑 */ },
      },
    ],
  },
}
\`\`\`

## 部署相关

### Q: 如何构建生产版本？
\`\`\`bash
pnpm build:all
\`\`\`

### Q: 如何部署到服务器？
参考 CI/CD 文档或运行：
\`\`\`bash
bash scripts/deploy.sh
\`\`\`
```

## ✅ 验收标准

### 检查：培训材料

```bash
ls docs/training/
# 预期文件:
- README.md (培训大纲)
- quick-start.md (快速上手)
- exercises.md (实战练习)
- faq.md (常见问题)
```

### 新人测试

- [ ] 新成员能在 1 小时内搭建环境
- [ ] 能在 2 小时内完成第一个模块
- [ ] 能理解 CRUD 配置化开发
- [ ] 能独立创建新模块

## 📝 检查清单

- [ ] 培训大纲完整
- [ ] 快速上手指南
- [ ] 实战练习设计
- [ ] FAQ 文档
- [ ] 示例代码完整
- [ ] 新人能独立上手

## 🎉 里程碑 M6 完成！

### 恭喜！完成所有42个文档！

**已完成**:
- ✅ 阶段一：基础设施（7个文档）
- ✅ 阶段二：核心功能（8个文档）
- ✅ 阶段三：主应用（9个文档）
- ✅ 阶段四：子应用（8个文档）
- ✅ 阶段五：部署（6个文档）
- ✅ 阶段六：工具链（4个文档）

**项目交付清单**:
- ✅ Monorepo 环境
- ✅ 核心系统（EPS + CRUD）
- ✅ 主应用和子应用
- ✅ 部署流程
- ✅ CLI 工具
- ✅ 开发规范
- ✅ 培训材料

## 🚀 开始实施

从 [01-monorepo-init.md](../phase-1-infrastructure/01-monorepo-init.md) 开始，按顺序执行所有文档！

---

**状态**: ✅ 完成 | **总计**: 42/42 文档

