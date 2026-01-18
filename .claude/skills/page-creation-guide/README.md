# 页面创建指南 Skill

本 skill 帮助 AI 助手根据项目已有的页面布局模式和自定义组件，为新页面推荐合适的组件组合和代码模板。

## 文件结构

```
page-creation-guide/
├── SKILL.md                    # 主要技能文档
├── templates/                  # 代码模板
│   ├── crud-page-template.vue  # CRUD 页面模板
│   ├── form-page-template.vue  # 表单页面模板
│   └── detail-page-template.vue # 详情页面模板
└── README.md                   # 本文件
```

## 使用方法

当用户要求创建新页面时，AI 助手应该：

1. 读取本 skill：`openskills read page-creation-guide`
2. 分析用户需求，识别页面类型
3. 根据页面类型推荐合适的组件组合
4. 使用模板文件生成代码
5. 参考现有相似页面完善代码

## 页面类型

- **CRUD 页面**：使用 `crud-page-template.vue`
- **表单页面**：使用 `form-page-template.vue`
- **详情页面**：使用 `detail-page-template.vue`

## 更新日志

- v1.0.0 (2025-01-17): 初始版本
