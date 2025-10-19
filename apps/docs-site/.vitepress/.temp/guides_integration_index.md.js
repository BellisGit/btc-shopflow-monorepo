import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"集成部署","description":"","frontmatter":{"title":"集成部署","type":"guide","project":"integration","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["integration","guides"],"sidebar_label":"集成部署","sidebar_order":5,"sidebar_group":"guides"},"headers":[],"relativePath":"guides/integration/index.md","filePath":"guides/integration/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/integration/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="集成部署" tabindex="-1">集成部署 <a class="header-anchor" href="#集成部署" aria-label="Permalink to &quot;集成部署&quot;">​</a></h1><p>本部分介绍了文档中心与主应用的集成方案，以及相关的部署和优化策略</p><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ul><li><a href="/internal/archive/guides/integration/vitepress-integration-complete">文档集成</a> - VitePress 文档中心集成</li><li><a href="/internal/archive/guides/integration/docs-cache-debug">缓存优化</a> - 文档缓存策略和优化</li><li><a href="/internal/archive/guides/integration/docs-iframe-cache-optimization">iframe 优化</a> - iframe 性能优化</li><li><a href="/internal/archive/guides/integration/docs-instant-switch">瞬间切换</a> - 应用间快速切换</li><li><a href="/internal/archive/guides/integration/vitepress-search-integration">搜索集成</a> - 全局搜索整合</li><li><a href="/internal/archive/guides/integration/docs-layout-hide-strategy">布局隐藏</a> - 布局隐藏策略</li><li><a href="/internal/archive/guides/integration/layout-refactor-complete">布局重构</a> - 布局系统重构</li><li><a href="/internal/archive/guides/integration/doc-migration-complete">文档迁移</a> - 文档系统迁移</li><li><a href="/internal/archive/guides/integration/docs-integration-summary">集成总结</a> - 完整集成方案总结</li></ul><hr><h2 id="目标" tabindex="-1">目标 <a class="header-anchor" href="#目标" aria-label="Permalink to &quot;目标&quot;">​</a></h2><ul><li>实现文档中心与主应用的无缝集成</li><li>优化文档应用的加载速度和切换体验</li><li>确保主题语言等配置在主应用和文档应用之间同步</li><li>提供清晰的集成方案和最佳实践</li></ul><hr><h2 id="关键技术" tabindex="-1">关键技术 <a class="header-anchor" href="#关键技术" aria-label="Permalink to &quot;关键技术&quot;">​</a></h2><ul><li><strong>iframe 嵌入</strong>：将 VitePress 文档应用作为 iframe 嵌入到主应用中</li><li><strong>PostMessage</strong>：用于主应用和 iframe 之间进行跨域通信，实现主题语言等状态同步</li><li><strong>VitePress 配置</strong>：通过 <code>config.ts</code> 配置 VitePress 的行为，如禁用 <code>appearance</code></li><li><strong>LocalStorage</strong>：用于持久化主题状态，确保刷新后主题一致</li></ul><hr><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><p>请按照以下步骤进行系统集成：</p><ol><li><strong>配置 VitePress</strong>：禁用 <code>appearance</code>，注入早期脚本</li><li><strong>配置主应用</strong>：在 <code>docs-iframe/index.vue</code> 中实现主题同步逻辑</li><li><strong>部署</strong>：确保 VitePress 应用独立部署并可通过 URL 访问</li></ol><p>详细步骤请参考各子文档</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/integration/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
