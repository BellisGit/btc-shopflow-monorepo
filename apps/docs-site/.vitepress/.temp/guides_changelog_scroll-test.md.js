import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"滚动测试","description":"","frontmatter":{"title":"滚动测试","type":"changelog","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-14","publish":true,"tags":["changelog","test"],"sidebar_label":"滚动测试","sidebar_order":8,"sidebar_group":"changelog"},"headers":[],"relativePath":"guides/changelog/scroll-test.md","filePath":"guides/changelog/scroll-test.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/changelog/scroll-test.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="滚动测试" tabindex="-1">滚动测试 <a class="header-anchor" href="#滚动测试" aria-label="Permalink to &quot;滚动测试&quot;">​</a></h1><h2 id="测试内容" tabindex="-1">测试内容 <a class="header-anchor" href="#测试内容" aria-label="Permalink to &quot;测试内容&quot;">​</a></h2><p>滚动功能的测试记录和验证结果。</p><h2 id="测试状态" tabindex="-1">测试状态 <a class="header-anchor" href="#测试状态" aria-label="Permalink to &quot;测试状态&quot;">​</a></h2><p>✅ 通过</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/changelog/scroll-test.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const scrollTest = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  scrollTest as default
};
