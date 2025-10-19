import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"快速修复指南","description":"","frontmatter":{"title":"快速修复指南","type":"changelog","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-14","publish":true,"tags":["changelog","quick-fix"],"sidebar_label":"快速修复","sidebar_order":3,"sidebar_group":"changelog"},"headers":[],"relativePath":"guides/changelog/quick-fix.md","filePath":"guides/changelog/quick-fix.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/changelog/quick-fix.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="快速修复指南" tabindex="-1">快速修复指南 <a class="header-anchor" href="#快速修复指南" aria-label="Permalink to &quot;快速修复指南&quot;">​</a></h1><h2 id="导航高亮修复" tabindex="-1">导航高亮修复 <a class="header-anchor" href="#导航高亮修复" aria-label="Permalink to &quot;导航高亮修复&quot;">​</a></h2><p>快速解决菜单高亮显示问题的方法。</p><h2 id="滚动条修复" tabindex="-1">滚动条修复 <a class="header-anchor" href="#滚动条修复" aria-label="Permalink to &quot;滚动条修复&quot;">​</a></h2><p>优化滚动条样式的步骤。</p><h2 id="修复状态" tabindex="-1">修复状态 <a class="header-anchor" href="#修复状态" aria-label="Permalink to &quot;修复状态&quot;">​</a></h2><p>✅ 完成</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/changelog/quick-fix.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const quickFix = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  quickFix as default
};
