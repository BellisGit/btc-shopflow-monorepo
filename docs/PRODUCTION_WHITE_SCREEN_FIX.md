# 生产环境子应用白屏问题修复指南

## 问题描述

生产环境访问子应用时出现白屏，通常是由于资源路径不匹配导致的。

## 问题原因

1. **构建时 base 路径不匹配**：
   - 子应用构建时使用的 base 是 `/`（根路径）
   - 资源路径被构建为 `/assets/xxx.js`
   - 但生产环境子应用入口是 `/micro-apps/<app>/`
   - 实际需要从 `/micro-apps/<app>/assets/xxx.js` 加载资源

2. **资源加载路径错误**：
   - 浏览器尝试从 `/assets/xxx.js` 加载资源
   - 但实际资源在 `/micro-apps/<app>/assets/xxx.js`
   - 导致资源加载失败（404），从而白屏

## 诊断步骤

### 1. 检查浏览器控制台错误

打开浏览器开发者工具（F12），查看 Console 和 Network 标签：

**常见的错误信息：**
- `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`
- `404 (Not Found)` - 资源文件加载失败
- `Resource interpreted as Stylesheet but transferred with MIME type text/html`

**检查 Network 标签：**
- 查看是否有资源文件返回 404
- 查看资源请求的 URL 是否正确
- 检查资源文件的 Content-Type 是否正确

### 2. 检查 HTML 中的 base 标签

在浏览器中查看子应用的 HTML 源码，检查是否有 `<base>` 标签：

```html
<head>
  <base href="https://production.bellis.com.cn/micro-apps/production/">
  <!-- 其他资源标签 -->
</head>
```

如果没有 `<base>` 标签，或者 `<base>` 标签的 href 不正确，就是问题所在。

### 3. 检查资源路径

查看 HTML 中的资源引用路径：
- 应该是相对路径或正确的绝对路径
- 如果资源路径是 `/assets/xxx.js`，但实际应该从 `/micro-apps/<app>/assets/xxx.js` 加载，则路径不匹配

## 解决方案

### 方案 1：检查并修复运行时 base 标签设置（推荐）

代码中已经有动态设置 `<base>` 标签的逻辑（`apps/system-app/src/micro/index.ts`），但可能存在问题。

**检查点：**
1. 确认 `getTemplate` 函数被正确调用
2. 确认 base 标签被正确插入到 HTML 中
3. 确认 base 标签的 href 值正确

**如果 base 标签未生效，可能需要：**
1. 检查 qiankun 的 `getTemplate` 配置是否正确
2. 检查 base 标签是否在所有资源标签之前
3. 检查 HTML 解析是否正确

### 方案 2：修改子应用构建配置

如果运行时 base 标签设置不可靠，可以修改子应用构建时的 base 路径。

**修改 `configs/vite-app-config.ts`：**

```typescript
export function getBaseUrl(appName: string, isPreviewBuild: boolean = false): string {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`未找到 ${appName} 的环境配置`);
  }
  
  // 判断是否为子应用
  const appType = getAppType(appName);
  
  // 生产环境子应用：使用 /micro-apps/<app>/ 作为 base
  if (!isPreviewBuild && appType === 'sub') {
    const appId = appName.replace('-app', '');
    return `/micro-apps/${appId}/`;
  }
  
  // 预览构建：使用绝对路径
  if (isPreviewBuild) {
    return `http://${appConfig.preHost}:${appConfig.prePort}/`;
  }
  
  // 其他情况：使用相对路径
  return '/';
}
```

**注意：** 这个方案会影响子应用的独立运行（通过子域名访问），需要确保子域名访问时路径正确。

### 方案 3：使用 Nginx 配置修复路径

在 Nginx 配置中，可以添加路径重写规则来修复资源路径。

**但这不是推荐的方案，因为：**
- 增加了 Nginx 配置复杂度
- 可能导致其他问题
- 维护成本高

## 临时解决方案

如果问题紧急，可以先检查以下几点：

1. **检查 Nginx 配置**：
   - 确认 `/micro-apps/<app>/` 路径配置正确
   - 确认静态资源能正常访问

2. **检查构建产物**：
   - 确认构建产物中资源路径是否正确
   - 确认 index.html 中的资源引用是否正确

3. **检查浏览器控制台**：
   - 查看具体的错误信息
   - 查看资源请求的 URL
   - 查看资源返回的状态码

## 推荐修复步骤

1. **首先检查浏览器控制台**，确认具体的错误信息
2. **检查 HTML 源码**，确认 base 标签是否存在且正确
3. **如果 base 标签不存在或错误**，检查 `getTemplate` 函数是否正常工作
4. **如果运行时修复不可靠**，考虑修改构建配置

## 验证修复

修复后，请验证以下内容：

1. ✅ 子应用能正常加载，不再白屏
2. ✅ 浏览器控制台没有资源加载错误
3. ✅ Network 标签中所有资源都返回 200 状态码
4. ✅ HTML 中有正确的 base 标签
5. ✅ 资源路径正确（相对于 base 路径）
