import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"文档修复指南","description":"","frontmatter":{"title":"文档修复指南","type":"changelog","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-14","publish":true,"tags":["changelog","doc-fixes"],"sidebar_label":"文档修复","sidebar_order":4,"sidebar_group":"changelog"},"headers":[],"relativePath":"guides/changelog/doc-fixes.md","filePath":"guides/changelog/doc-fixes.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/changelog/doc-fixes.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="文档修复指南" tabindex="-1">文档修复指南 <a class="header-anchor" href="#文档修复指南" aria-label="Permalink to &quot;文档修复指南&quot;">​</a></h1><h2 id="编码问题修复" tabindex="-1">编码问题修复 <a class="header-anchor" href="#编码问题修复" aria-label="Permalink to &quot;编码问题修复&quot;">​</a></h2><p>解决了文档编码和特殊字符处理问题。</p><h2 id="文档内容修复" tabindex="-1">文档内容修复 <a class="header-anchor" href="#文档内容修复" aria-label="Permalink to &quot;文档内容修复&quot;">​</a></h2><p>修复了文档格式和内容显示问题。</p><h2 id="修复状态" tabindex="-1">修复状态 <a class="header-anchor" href="#修复状态" aria-label="Permalink to &quot;修复状态&quot;">​</a></h2><p>✅ 完成</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/changelog/doc-fixes.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const docFixes = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  docFixes as default
};
