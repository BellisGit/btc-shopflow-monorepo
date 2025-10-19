import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"简短动词开头，如：采用微前端架构","description":"","frontmatter":{"doc_type":"adr","title":"简短动词开头，如：采用微前端架构","owner":"dev-team","reviewers":[],"status":"active","last_review_at":"YYYY-MM-DD","next_review_at":"YYYY-MM-DD + 6~12mo","canonical_url":"/docs/adr/YYYY-MM-DD-slug.md","related":[],"sidebar_label":"ADR 模板","sidebar_order":1,"sidebar_group":"templates"},"headers":[],"relativePath":"sop/templates/adr-template.md","filePath":"sop/templates/adr-template.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "sop/templates/adr-template.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-模板" tabindex="-1">ADR 模板 <a class="header-anchor" href="#adr-模板" aria-label="Permalink to &quot;ADR 模板&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>问题背景约束条件为什么要做这个决策</p><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h2><ul><li><strong>Option A</strong>: 方案描述</li><li>优点:</li><li>缺点:</li><li><strong>Option B</strong>: 方案描述</li><li>优点:</li><li>缺点:</li></ul><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>选择 Option X，因为 原因说明</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><ul><li>正面影响:</li><li>负面影响:</li><li>风险:</li></ul><hr><p><strong>状态</strong>: active <strong>最后评审</strong>: YYYY-MM-DD <strong>下次评审</strong>: YYYY-MM-DD + 6~12mo</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("sop/templates/adr-template.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const adrTemplate = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  adrTemplate as default
};
