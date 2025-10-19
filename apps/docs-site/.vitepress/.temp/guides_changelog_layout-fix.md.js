import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"布局修复完成","description":"","frontmatter":{"title":"布局修复完成","type":"changelog","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-14","publish":true,"tags":["changelog","layout"],"sidebar_label":"布局修复","sidebar_order":2,"sidebar_group":"changelog"},"headers":[],"relativePath":"guides/changelog/layout-fix.md","filePath":"guides/changelog/layout-fix.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/changelog/layout-fix.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="布局修复完成" tabindex="-1">布局修复完成 <a class="header-anchor" href="#布局修复完成" aria-label="Permalink to &quot;布局修复完成&quot;">​</a></h1><h2 id="修复内容" tabindex="-1">修复内容 <a class="header-anchor" href="#修复内容" aria-label="Permalink to &quot;修复内容&quot;">​</a></h2><ul><li>修复了文档iframe与主应用的布局统一问题</li><li>优化了响应式设计</li><li>改善了移动端显示效果</li></ul><h2 id="修复状态" tabindex="-1">修复状态 <a class="header-anchor" href="#修复状态" aria-label="Permalink to &quot;修复状态&quot;">​</a></h2><p>✅ 完成</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/changelog/layout-fix.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const layoutFix = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  layoutFix as default
};
