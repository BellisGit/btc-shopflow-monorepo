import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"VitePress导航滚动修复","description":"","frontmatter":{"title":"VitePress导航滚动修复","type":"changelog","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-14","publish":true,"tags":["changelog","vitepress"],"sidebar_label":"VitePress 修复","sidebar_order":7,"sidebar_group":"changelog"},"headers":[],"relativePath":"guides/changelog/vitepress-fix.md","filePath":"guides/changelog/vitepress-fix.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/changelog/vitepress-fix.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vitepress导航滚动修复" tabindex="-1">VitePress导航滚动修复 <a class="header-anchor" href="#vitepress导航滚动修复" aria-label="Permalink to &quot;VitePress导航滚动修复&quot;">​</a></h1><h2 id="修复内容" tabindex="-1">修复内容 <a class="header-anchor" href="#修复内容" aria-label="Permalink to &quot;修复内容&quot;">​</a></h2><ul><li>修复了VitePress导航问题</li><li>优化了滚动行为</li><li>改善了用户体验</li></ul><h2 id="修复状态" tabindex="-1">修复状态 <a class="header-anchor" href="#修复状态" aria-label="Permalink to &quot;修复状态&quot;">​</a></h2><p>✅ 完成</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/changelog/vitepress-fix.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const vitepressFix = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  vitepressFix as default
};
