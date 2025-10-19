# EPS API 设计文档

## 概述

EPS (EndPoint Service) 是 BTC Shopflow 项目的核心设计，通过扫描后端 Controller 自动生成前端的 TypeScript 类型定义和服务方法，实现了前后端 API 的自动化对接。本项目已完整实现了 EPS 系统，参考 cool-admin 的架构设计。

## 核心原理

### 1. 后端 API 扫描

- 后端提供 `/admin/base/open/eps` 接口
- 自动扫描所有 Controller 类和方法
- 解析注解信息（@Controller、@Post、@Get 等）
- 返回完整的 API 元数据
- 支持字段验证规则和搜索配置

### 2. 前端类型生成

- Vite 插件请求 EPS 接口获取 API 信息
- 根据 API 路径构建 service 对象树
- 生成对应的 TypeScript 类型定义（eps.d.ts）
- 创建 `virtual:eps` 和 `virtual:eps-json` 模块
- 支持权限系统和搜索配置

### 3. 热更新支持

- 开发时监听后端 API 变化
- 自动重新生成类型定义
- 支持手动刷新 EPS 数据
- 虚拟模块自动更新

### 4. 完整实现架构

- **HTTP 请求层**：基于 axios 的统一请求封装（request.ts）
- **类型定义**：完整的 EPS 类型体系（types.ts）
- **工具函数**：代码生成和格式化工具（utils.ts）
- **生成器核心**：完整的代码生成逻辑（generator.ts）
- **插件系统**：Vite 插件集成（index.ts）
- **虚拟模块**：动态 service 对象生成

## 数据结构详解

### 1. 后端 EPS 接口返回格式

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "模块/实体名": {
      "prefix": "/api/path",
      "name": "EntityName",
      "module": "模块名",
      "api": [...],
      "columns": [...],
      "pageColumns": [...],
      "pageQueryOp": {...},
      "search": {...}
    }
  }
}
```

### 2. API 定义结构

```typescript
interface Api {
  name: string; // 方法名
  method: string; // HTTP 方法（GET/POST/PUT/DELETE）
  path: string; // API 路径
  summary: string; // API 描述
  tag: string; // API 标签/分类
  dts?: {
    // TypeScript 类型定义
    parameters?: {
      // 参数定义
      description: string; // 参数描述
      name: string; // 参数名
      required: boolean; // 是否必填
      schema: {
        // 参数类型
        type: string;
      };
    }[];
  };
}
```

### 3. 字段定义结构

#### A. columns（实体字段）

```typescript
interface Column {
  comment: string; // 字段注释/描述
  nullable: boolean; // 是否可为空
  propertyName: string; // 属性名（驼峰命名）
  source: string; // 数据库字段名（下划线命名）
  type: string; // 数据类型
  dict: string[] | string | null; // 字典类型（用于下拉选择）
  defaultValue: any; // 默认值
  [key: string]: any; // 其他扩展属性
}
```

#### B. pageColumns（分页查询字段）

```typescript
interface PageColumn {
  comment: string; // 字段注释
  propertyName: string; // 参数名
  source: string; // 查询参数名
  type: string; // 参数类型
  dict: string[] | null; // 可选值（如排序方向：asc/desc）
  defaultValue: any; // 默认值
}
```

### 4. 搜索配置结构

#### A. pageQueryOp（查询操作配置）

```typescript
interface PageQueryOp {
  fieldEq: string[]; // 精确匹配字段（WHERE field = value）
  fieldLike: string[]; // 模糊匹配字段（WHERE field LIKE '%value%'）
  keyWordLikeFields: string[]; // 关键词搜索字段（全局搜索时使用）
}
```

#### B. search（搜索字段定义）

```typescript
interface Search {
  fieldEq: Column[]; // 精确匹配字段的完整定义
  fieldLike: Column[]; // 模糊匹配字段的完整定义
  keyWordLikeFields: Column[]; // 关键词搜索字段的完整定义
}
```

## 结构设计原理分析

### 1. API 结构设计原理

#### A. 为什么需要 API 结构？

**设计原因：**

1. **统一接口规范**：
   - 所有 API 都遵循相同的结构，便于前端统一处理
   - 支持 RESTful 和自定义 API 路径

2. **类型安全**：
   - `dts.parameters` 提供参数的类型定义
   - 前端可以根据参数类型生成对应的 TypeScript 接口

3. **文档化**：
   - `summary` 提供 API 描述，便于开发者理解
   - `tag` 用于 API 分类管理

4. **灵活性**：
   - 支持不同的 HTTP 方法（GET、POST、PUT、DELETE）
   - 支持自定义路径和参数

#### B. 实际应用场景

```typescript
// 后端定义
@Controller('/base/sys/user')
export class UserController {
  @Post('/page') // method: 'POST', path: '/page'
  async page() {}

  @Get('/info') // method: 'GET', path: '/info'
  async info() {}
}

// 前端生成
service.base.sys.user.page(); // 调用 POST /base/sys/user/page
service.base.sys.user.info(); // 调用 GET /base/sys/user/info
```

### 2. 字段定义结构设计原理

#### A. columns（实体字段）设计原因

**设计原因：**

1. **前后端字段映射**：

   ```typescript
   // 数据库字段：user_name (下划线)
   // 前端属性：userName (驼峰)
   propertyName: 'userName',  // 前端使用
   source: 'user_name',       // 后端数据库
   ```

2. **类型转换支持**：

   ```typescript
   // 数据库类型：bigint, varchar, datetime
   // 前端类型：number, string, Date
   type: 'bigint'; // 映射到 number
   type: 'varchar'; // 映射到 string
   ```

3. **表单生成支持**：

   ```typescript
   // 根据字段信息自动生成表单
   nullable: false → 必填字段
   dict: ['status'] → 下拉选择组件
   defaultValue: 1 → 默认值
   ```

4. **文档化**：
   ```typescript
   comment: '用户名'; // 提供字段说明
   ```

#### B. pageColumns（分页查询字段）设计原因

**设计原因：**

1. **分页参数标准化**：

   ```typescript
   // 标准分页参数
   { propertyName: 'page', defaultValue: 1 }
   { propertyName: 'size', defaultValue: 20 }
   { propertyName: 'keyword', defaultValue: null }
   ```

2. **查询条件支持**：

   ```typescript
   // 动态查询条件
   { propertyName: 'departmentIds', type: 'array' }
   { propertyName: 'status', type: 'number' }
   ```

3. **排序支持**：
   ```typescript
   { propertyName: 'orderBy', defaultValue: 'create_time' }
   { propertyName: 'orderDirection', dict: ['asc', 'desc'] }
   ```

### 3. 搜索配置结构设计原理

#### A. pageQueryOp（查询操作配置）设计原因

**设计原因：**

1. **查询类型分类**：

   ```sql
   -- fieldEq: 精确匹配
   WHERE status = 1
   WHERE department_id = 5

   -- fieldLike: 模糊匹配
   WHERE username LIKE '%张三%'
   WHERE name LIKE '%李四%'

   -- keyWordLikeFields: 关键词搜索
   WHERE (username LIKE '%张%' OR name LIKE '%张%')
   ```

2. **前端组件生成**：

   ```typescript
   // 根据配置生成不同的搜索组件
   fieldEq → 下拉选择框（精确匹配）
   fieldLike → 输入框（模糊搜索）
   keyWordLikeFields → 全局搜索框
   ```

3. **后端查询优化**：
   ```typescript
   // 后端可以根据字段类型选择不同的查询策略
   fieldEq → 使用索引进行精确查询
   fieldLike → 使用 LIKE 查询
   keyWordLikeFields → 使用全文搜索或 OR 查询
   ```

#### B. search（搜索字段定义）设计原因

**设计原因：**

1. **字段信息完整性**：

   ```typescript
   // 不仅知道字段名，还知道字段的完整信息
   fieldEq: [
     {
       propertyName: 'status',
       type: 'tinyint',
       dict: ['status'], // 可以生成下拉选择
       comment: '状态',
     },
   ];
   ```

2. **前端组件智能生成**：

   ```typescript
   // 根据字段信息生成合适的组件
   dict: ['status'] → 下拉选择框
   type: 'number' → 数字输入框
   type: 'datetime' → 日期选择器
   ```

3. **表单验证支持**：
   ```typescript
   nullable: false → 必填验证
   type: 'number' → 数字格式验证
   dict: ['asc', 'desc'] → 枚举值验证
   ```

### 4. 整体架构设计优势

#### A. 自动化程度高

```typescript
// 后端定义一次，前端自动生成所有相关代码
@Controller('/base/sys/user')
@ApiTags('用户管理')
export class UserController {
  @Post('/page')
  @ApiOperation('分页查询用户')
  async page(@Body() dto: UserPageDto) {}
}

// 前端自动生成
interface BaseSysUserService {
  page(data?: UserPageDto): Promise<BaseSysUserServicePageResponse>;
}
```

#### B. 类型安全

```typescript
// 所有类型都自动生成，避免手动维护
interface UserPageDto {
  page?: number;
  size?: number;
  departmentIds?: number[];
  keyword?: string;
}
```

#### C. 扩展性强

```typescript
// 支持自定义字段类型映射
config.eps.mapping = [
  { test: ['bigint'], type: 'number' },
  { test: ['varchar'], type: 'string' },
  {
    custom: ({ propertyName, type }) => {
      if (propertyName.includes('Time')) return 'Date';
      return null;
    },
  },
];
```

#### D. 维护性好

```typescript
// 后端修改 API，前端自动更新
// 无需手动同步前后端接口定义
// 减少因接口不一致导致的 bug
```

## 完整示例

### 1. 用户管理 API 的 EPS 数据结构

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "base/sys/user": {
      "prefix": "/base/sys/user",
      "name": "BaseSysUserEntity",
      "module": "base",
      "api": [
        {
          "name": "page",
          "method": "POST",
          "path": "/page",
          "summary": "分页查询用户",
          "tag": "用户管理",
          "dts": {
            "parameters": [
              {
                "name": "page",
                "description": "页码",
                "required": true,
                "schema": { "type": "number" }
              },
              {
                "name": "size",
                "description": "每页数量",
                "required": true,
                "schema": { "type": "number" }
              },
              {
                "name": "departmentIds",
                "description": "部门ID数组",
                "required": false,
                "schema": { "type": "array" }
              }
            ]
          }
        },
        {
          "name": "list",
          "method": "POST",
          "path": "/list",
          "summary": "获取用户列表",
          "tag": "用户管理"
        },
        {
          "name": "info",
          "method": "GET",
          "path": "/info",
          "summary": "获取用户详情",
          "tag": "用户管理"
        }
      ],
      "columns": [
        {
          "comment": "用户ID",
          "nullable": false,
          "propertyName": "id",
          "source": "id",
          "type": "bigint",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "用户名",
          "nullable": false,
          "propertyName": "username",
          "source": "username",
          "type": "varchar",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "姓名",
          "nullable": true,
          "propertyName": "name",
          "source": "name",
          "type": "varchar",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "邮箱",
          "nullable": true,
          "propertyName": "email",
          "source": "email",
          "type": "varchar",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "手机号",
          "nullable": true,
          "propertyName": "phone",
          "source": "phone",
          "type": "varchar",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "头像",
          "nullable": true,
          "propertyName": "headImg",
          "source": "head_img",
          "type": "varchar",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "部门ID",
          "nullable": true,
          "propertyName": "departmentId",
          "source": "department_id",
          "type": "bigint",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "状态",
          "nullable": false,
          "propertyName": "status",
          "source": "status",
          "type": "tinyint",
          "dict": ["status"],
          "defaultValue": 1
        },
        {
          "comment": "创建时间",
          "nullable": false,
          "propertyName": "createTime",
          "source": "create_time",
          "type": "datetime",
          "dict": null,
          "defaultValue": "CURRENT_TIMESTAMP"
        },
        {
          "comment": "更新时间",
          "nullable": false,
          "propertyName": "updateTime",
          "source": "update_time",
          "type": "datetime",
          "dict": null,
          "defaultValue": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        }
      ],
      "pageColumns": [
        {
          "comment": "页码",
          "nullable": false,
          "propertyName": "page",
          "source": "page",
          "type": "number",
          "dict": null,
          "defaultValue": 1
        },
        {
          "comment": "每页数量",
          "nullable": false,
          "propertyName": "size",
          "source": "size",
          "type": "number",
          "dict": null,
          "defaultValue": 20
        },
        {
          "comment": "关键词",
          "nullable": true,
          "propertyName": "keyword",
          "source": "keyword",
          "type": "string",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "部门ID数组",
          "nullable": true,
          "propertyName": "departmentIds",
          "source": "department_ids",
          "type": "array",
          "dict": null,
          "defaultValue": null
        },
        {
          "comment": "排序字段",
          "nullable": true,
          "propertyName": "orderBy",
          "source": "order_by",
          "type": "string",
          "dict": null,
          "defaultValue": "create_time"
        },
        {
          "comment": "排序方向",
          "nullable": true,
          "propertyName": "orderDirection",
          "source": "order_direction",
          "type": "string",
          "dict": ["asc", "desc"],
          "defaultValue": "desc"
        }
      ],
      "pageQueryOp": {
        "fieldEq": ["status", "departmentId"],
        "fieldLike": ["username", "name", "email", "phone"],
        "keyWordLikeFields": ["username", "name", "email"]
      },
      "search": {
        "fieldEq": [
          {
            "comment": "状态",
            "propertyName": "status",
            "source": "status",
            "type": "tinyint",
            "dict": ["status"]
          },
          {
            "comment": "部门ID",
            "propertyName": "departmentId",
            "source": "department_id",
            "type": "bigint",
            "dict": null
          }
        ],
        "fieldLike": [
          {
            "comment": "用户名",
            "propertyName": "username",
            "source": "username",
            "type": "varchar",
            "dict": null
          },
          {
            "comment": "姓名",
            "propertyName": "name",
            "source": "name",
            "type": "varchar",
            "dict": null
          }
        ],
        "keyWordLikeFields": [
          {
            "comment": "用户名",
            "propertyName": "username",
            "source": "username",
            "type": "varchar",
            "dict": null
          },
          {
            "comment": "姓名",
            "propertyName": "name",
            "source": "name",
            "type": "varchar",
            "dict": null
          }
        ]
      }
    }
  }
}
```

### 2. 生成的 TypeScript 类型

```typescript
// 用户实体类型
interface BaseSysUserEntity {
  /**
   * 用户ID
   */
  id?: bigint;

  /**
   * 用户名
   */
  username?: string;

  /**
   * 姓名
   */
  name?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 手机号
   */
  phone?: string;

  /**
   * 头像
   */
  headImg?: string;

  /**
   * 部门ID
   */
  departmentId?: bigint;

  /**
   * 状态
   */
  status?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * 任意键值
   */
  [key: string]: any;
}

// 用户服务接口
interface BaseSysUserService {
  /**
   * 分页查询用户
   */
  page(data?: {
    page?: number;
    size?: number;
    keyword?: string;
    departmentIds?: number[];
    orderBy?: string;
    orderDirection?: string;
  }): Promise<BaseSysUserServicePageResponse>;

  /**
   * 获取用户列表
   */
  list(data?: any): Promise<BaseSysUserEntity[]>;

  /**
   * 获取用户详情
   */
  info(data?: any): Promise<BaseSysUserEntity>;

  /**
   * 权限标识
   */
  permission: {
    page: string;
    list: string;
    info: string;
  };

  /**
   * 权限状态
   */
  _permission: {
    page: boolean;
    list: boolean;
    info: boolean;
  };

  request: Request;
}

// 分页响应类型
interface BaseSysUserServicePageResponse {
  pagination: PagePagination;
  list: BaseSysUserEntity[];
}

interface PagePagination {
  size: number;
  page: number;
  total: number;
  [key: string]: any;
}
```

### 3. 生成的 Service 对象结构

```typescript
const service = {
  base: {
    sys: {
      user: {
        namespace: "/base/sys/user",
        page: { method: "POST", path: "/page" },
        list: { method: "POST", path: "/list" },
        info: { method: "GET", path: "/info" },
        permission: {
          page: "base:sys:user:page",
          list: "base:sys:user:list",
          info: "base:sys:user:info"
        },
        _permission: {
          page: true,
          list: true,
          info: true
        },
        search: {
          fieldEq: [...],
          fieldLike: [...],
          keyWordLikeFields: [...]
        }
      }
    }
  }
};
```

## 使用场景

### 1. 用户管理页面

```typescript
// 获取部门列表（左侧组织架构）
service.base.sys.department.list();

// 获取用户分页数据（右侧用户列表）
service.base.sys.user.page({
  page: 1,
  size: 20,
  departmentIds: [1, 2, 3],
  keyword: '搜索词',
});
```

### 2. 字典数据获取

```typescript
// 获取字典数据
service.dict.info.data({
  types: ['occupation', 'status'],
});
```

### 3. 权限检查

```typescript
// 动态权限检查
v-permission="service.base.sys.user.permission.move"
v-permission="service.base.sys.department.permission.add"
```

## 配置说明

### 1. Vite 配置

```typescript
// vite.config.ts
import { btc } from '@btc-vue/vite-plugin';

export default {
  plugins: [
    cool({
      type: 'admin',
      eps: {
        enable: true, // 启用 EPS
      },
    }),
  ],
};
```

### 2. 后端配置

```typescript
// 后端需要提供 EPS 接口
@Controller('/admin/base/open')
export class OpenController {
  @Get('/eps')
  async eps() {
    // 扫描所有 Controller 并返回 API 元数据
    return scanControllers();
  }
}
```

## 优势特点

1. **自动化**：后端添加 API，前端自动生成对应的服务方法
2. **类型安全**：TypeScript 类型自动生成，IDE 有智能提示
3. **热更新**：开发时修改后端 API，前端自动更新
4. **统一规范**：所有 API 都遵循相同的调用模式
5. **权限集成**：每个 API 都有对应的权限配置
6. **搜索支持**：自动生成搜索字段配置
7. **字典集成**：支持字典类型字段的下拉选择

## 总结

EPS 设计通过自动化扫描后端 API 并生成前端类型定义，实现了前后端的无缝对接。它不仅提供了类型安全，还支持权限管理、搜索配置、字典集成等高级功能，大大提高了开发效率和代码质量。

### 核心设计思想

1. **标准化**：统一的 API 结构，便于自动化处理
2. **类型化**：完整的类型定义，保证类型安全
3. **自动化**：后端定义，前端自动生成，减少重复工作
4. **智能化**：根据字段信息智能生成前端组件
5. **扩展性**：支持自定义映射和扩展配置

这种设计让开发者可以专注于业务逻辑，而不用关心前后端接口的同步和维护问题。

## 实现状态

### ✅ 已完成功能

1. **HTTP 请求层重构**
   - 基于 axios 的统一 request 函数
   - 支持请求/响应拦截器
   - 支持权限检查和错误处理

2. **完整的 EPS 类型定义**
   - EpsEntity、EpsColumn、EpsSearch 等核心类型
   - TypeMapping 类型映射配置
   - EpsConfig 插件配置接口

3. **工具函数库**
   - 代码格式化、类型映射、字段查找等工具
   - 参考 cool-admin 的完整工具函数集

4. **EPS 生成器核心**
   - 数据获取与处理（getData）
   - Service 树构建（createService）
   - Entity 接口生成（createEntity）
   - Controller 接口生成（createController）
   - Service 代码生成（createServiceCode）
   - 字典类型生成（createDict）

5. **增强的 EPS 插件**
   - 虚拟模块支持（virtual:eps、virtual:eps-json）
   - 开发模式热更新
   - 构建时自动生成

6. **配置文件扩展**
   - 支持自定义类型映射
   - 支持字典类型生成
   - 支持后端请求地址配置

7. **Mock 数据准备**
   - 用户和部门模块的完整 EPS 数据
   - 支持搜索配置和字段验证规则

8. **集成测试**
   - 在 main-app 中集成测试
   - 提供测试页面验证功能
   - 支持 service 导入和使用测试

## 使用方式

### 1. 配置 EPS 插件

```typescript
// vite.config.ts
import { btc } from '@btc/vite-plugin';

export default defineConfig({
  plugins: [
    btc({
      type: 'admin',
      reqUrl: 'http://your-backend-url', // 后端请求地址
      eps: {
        enable: true,
        api: '/admin/base/open/eps', // EPS API 路径，空字符串使用本地 Mock
        dist: 'build/eps', // 输出目录
        dict: true, // 是否生成字典类型
        mapping: [], // 自定义类型映射
      },
    }),
  ],
});
```

### 2. 使用 EPS Service

```typescript
// 导入 service
import service from 'virtual:eps';

// 使用 service
const { data } = await service.base.sys.user.page({
  page: 1,
  size: 20,
  keyword: 'test',
});

// 权限检查
if (service.base.sys.user._permission.add) {
  await service.base.sys.user.add({ username: 'newuser' });
}

// 获取权限标识
const permission = service.base.sys.user.permission.page; // 'base:sys:user:page'
```

### 3. 使用 EPS JSON 数据

```typescript
// 导入 EPS 数据
import epsData from 'virtual:eps-json';

// 获取所有模块
console.log(epsData); // 包含所有 API 元数据

// 查找特定模块
const userModule = epsData.find((item) => item.prefix === '/base/sys/user');
```

### 4. 类型安全

生成的 `eps.d.ts` 提供完整的类型定义：

```typescript
declare namespace Eps {
  interface UserEntity {
    id?: number;
    username?: string;
    email?: string;
    // ...
  }

  interface BaseApiSysUser {
    page(data?: {
      page?: number;
      size?: number;
      keyword?: string;
    }): Promise<BaseApiSysUserPageResponse>;
    list(data?: any): Promise<UserEntity[]>;
    info(data?: { id: number }): Promise<UserEntity>;
    add(data?: UserEntity): Promise<any>;
    update(data?: UserEntity): Promise<any>;
    delete(data?: { ids: number[] }): Promise<any>;
    permission: {
      page: string;
      list: string;
      info: string;
      add: string;
      update: string;
      delete: string;
    };
    _permission: {
      page: boolean;
      list: boolean;
      info: boolean;
      add: boolean;
      update: boolean;
      delete: boolean;
    };
    request: Request;
  }

  type Service = {
    request: Request;
    base: {
      sys: {
        user: BaseApiSysUser;
        department: BaseApiSysDepartment;
        // ...
      };
    };
  };
}
```

## 测试验证

项目提供了完整的测试页面来验证 EPS 功能：

1. 访问 `/test/eps` 页面
2. 测试 Service 导入
3. 测试 EPS JSON 数据
4. 测试用户和部门服务
5. 验证权限系统和搜索配置

## 文件结构

```
btc-shopflow-monorepo/
├── packages/
│   ├── vite-plugin/
│   │   └── src/
│   │       ├── eps/
│   │       │   ├── index.ts          # EPS 插件主入口
│   │       │   ├── generator.ts      # EPS 生成器核心
│   │       │   ├── types.ts          # EPS 类型定义
│   │       │   └── utils.ts          # EPS 工具函数
│   │       └── config.ts             # 插件配置
│   └── shared-core/
│       └── src/
│           └── btc/
│               └── service/
│                   ├── request.ts    # HTTP 请求封装
│                   ├── base.ts       # 基础服务类
│                   └── index.ts      # 导出
└── apps/
    └── main-app/
        ├── build/
        │   └── eps/
        │       ├── eps.json          # EPS 数据文件
        │       └── eps.d.ts          # 类型定义文件
        ├── src/
        │   ├── test-eps.vue          # EPS 测试页面
        │   └── vite.config.ts        # Vite 配置
        └── package.json              # 依赖配置
```

## 后续扩展

1. **权限系统集成**：与后端权限系统深度集成
2. **缓存优化**：添加 EPS 数据缓存机制
3. **错误处理**：完善错误处理和重试机制
4. **性能优化**：优化大型项目的生成性能
5. **文档生成**：自动生成 API 文档
