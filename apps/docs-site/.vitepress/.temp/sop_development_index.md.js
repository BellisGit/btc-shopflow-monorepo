import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"开发环境操作流程","description":"","frontmatter":{"title":"开发环境操作流程","type":"sop","project":"development","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["sop","development","environment"],"sidebar_label":"开发环境","sidebar_order":1,"sidebar_group":"sop-development"},"headers":[],"relativePath":"sop/development/index.md","filePath":"sop/development/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "sop/development/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="开发环境操作流程" tabindex="-1">开发环境操作流程 <a class="header-anchor" href="#开发环境操作流程" aria-label="Permalink to &quot;开发环境操作流程&quot;">​</a></h1><p>本部分提供了开发环境相关的标准操作流程，包括环境搭建项目启动依赖管理等开发环境操作</p><h2 id="操作流程" tabindex="-1">操作流程 <a class="header-anchor" href="#操作流程" aria-label="Permalink to &quot;操作流程&quot;">​</a></h2><h3 id="环境搭建" tabindex="-1">环境搭建 <a class="header-anchor" href="#环境搭建" aria-label="Permalink to &quot;环境搭建&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/sop/development/start-development">开发环境启动</a></strong> - 快速启动开发环境的完整流程</li></ul><hr><h2 id="开发原则" tabindex="-1">开发原则 <a class="header-anchor" href="#开发原则" aria-label="Permalink to &quot;开发原则&quot;">​</a></h2><h3 id="_1-环境一致性" tabindex="-1">1. 环境一致性 <a class="header-anchor" href="#_1-环境一致性" aria-label="Permalink to &quot;1. 环境一致性&quot;">​</a></h3><ul><li>确保所有开发者的环境配置一致</li><li>使用统一的依赖版本</li><li>标准化的开发工具配置</li></ul><h3 id="_2-快速启动" tabindex="-1">2. 快速启动 <a class="header-anchor" href="#_2-快速启动" aria-label="Permalink to &quot;2. 快速启动&quot;">​</a></h3><ul><li>最小化环境搭建时间</li><li>提供一键启动脚本</li><li>自动化依赖安装</li></ul><h3 id="_3-问题排查" tabindex="-1">3. 问题排查 <a class="header-anchor" href="#_3-问题排查" aria-label="Permalink to &quot;3. 问题排查&quot;">​</a></h3><ul><li>提供常见问题的解决方案</li><li>详细的错误日志说明</li><li>快速恢复机制</li></ul><hr><h2 id="开发工具" tabindex="-1">开发工具 <a class="header-anchor" href="#开发工具" aria-label="Permalink to &quot;开发工具&quot;">​</a></h2><h3 id="必需工具" tabindex="-1">必需工具 <a class="header-anchor" href="#必需工具" aria-label="Permalink to &quot;必需工具&quot;">​</a></h3><ul><li><strong>Node.js</strong> (v18+)</li><li><strong>pnpm</strong> (v8+)</li><li><strong>Git</strong></li><li><strong>VS Code</strong> (推荐)</li></ul><h3 id="推荐插件" tabindex="-1">推荐插件 <a class="header-anchor" href="#推荐插件" aria-label="Permalink to &quot;推荐插件&quot;">​</a></h3><ul><li>Vue Language Features (Volar)</li><li>TypeScript Importer</li><li>Auto Rename Tag</li><li>Bracket Pair Colorizer</li></ul><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="/internal/archive/guides/getting-started">快速开始指南</a></li><li><a href="/internal/archive/guides/components">组件开发指南</a></li><li><a href="/internal/archive/guides/system">系统配置指南</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("sop/development/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
