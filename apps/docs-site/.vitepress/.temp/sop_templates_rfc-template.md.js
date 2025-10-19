import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"RFC: 提案标题","description":"","frontmatter":{"title":"RFC: 提案标题","type":"rfc","owner":"dev-team","created":"YYYY-MM-DD","updated":"YYYY-MM-DD","publish":true,"tags":["rfc"],"sidebar_label":"RFC: 提案标题","sidebar_order":999,"sidebar_group":"rfc"},"headers":[],"relativePath":"sop/templates/rfc-template.md","filePath":"sop/templates/rfc-template.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "sop/templates/rfc-template.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="rfc-提案标题" tabindex="-1">RFC: 提案标题 <a class="header-anchor" href="#rfc-提案标题" aria-label="Permalink to &quot;RFC: 提案标题&quot;">​</a></h1><blockquote><p><strong>文档类型</strong>: RFC <strong>状态</strong>: 🟡 待评审 <strong>作者</strong>: 作者姓名 <strong>日期</strong>: YYYY-MM-DD <strong>评审者</strong>: 开发团队</p></blockquote><hr><h2 id="_1-目标与非目标" tabindex="-1">1. 目标与非目标 <a class="header-anchor" href="#_1-目标与非目标" aria-label="Permalink to &quot;1. 目标与非目标&quot;">​</a></h2><h3 id="目标-🎯" tabindex="-1">目标 🎯 <a class="header-anchor" href="#目标-🎯" aria-label="Permalink to &quot;目标 🎯&quot;">​</a></h3><ol><li>目标1</li><li>目标2</li></ol><h3 id="非目标-❌" tabindex="-1">非目标 ❌ <a class="header-anchor" href="#非目标-❌" aria-label="Permalink to &quot;非目标 ❌&quot;">​</a></h3><ol><li>非目标1</li><li>非目标2</li></ol><hr><h2 id="_2-背景与动机" tabindex="-1">2. 背景与动机 <a class="header-anchor" href="#_2-背景与动机" aria-label="Permalink to &quot;2. 背景与动机&quot;">​</a></h2><h3 id="现状问题" tabindex="-1">现状问题 <a class="header-anchor" href="#现状问题" aria-label="Permalink to &quot;现状问题&quot;">​</a></h3><ol><li>问题1</li><li>问题2</li></ol><hr><h2 id="_3-详细设计" tabindex="-1">3. 详细设计 <a class="header-anchor" href="#_3-详细设计" aria-label="Permalink to &quot;3. 详细设计&quot;">​</a></h2><h3 id="_3-1-技术方案" tabindex="-1">3.1 技术方案 <a class="header-anchor" href="#_3-1-技术方案" aria-label="Permalink to &quot;3.1 技术方案&quot;">​</a></h3><p>详细的技术实现方案</p><h3 id="_3-2-实施计划" tabindex="-1">3.2 实施计划 <a class="header-anchor" href="#_3-2-实施计划" aria-label="Permalink to &quot;3.2 实施计划&quot;">​</a></h3><ol><li>Phase 1</li><li>Phase 2</li></ol><hr><h2 id="_4-风险评估" tabindex="-1">4. 风险评估 <a class="header-anchor" href="#_4-风险评估" aria-label="Permalink to &quot;4. 风险评估&quot;">​</a></h2><h3 id="风险1" tabindex="-1">风险1 <a class="header-anchor" href="#风险1" aria-label="Permalink to &quot;风险1&quot;">​</a></h3><ul><li>缓解措施</li></ul><h3 id="风险2" tabindex="-1">风险2 <a class="header-anchor" href="#风险2" aria-label="Permalink to &quot;风险2&quot;">​</a></h3><ul><li>缓解措施</li></ul><hr><h2 id="_5-成功标准" tabindex="-1">5. 成功标准 <a class="header-anchor" href="#_5-成功标准" aria-label="Permalink to &quot;5. 成功标准&quot;">​</a></h2><ol><li>标准1</li><li>标准2</li></ol><hr><p><strong>状态</strong>: 待评审 <strong>评审截止</strong>: YYYY-MM-DD</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("sop/templates/rfc-template.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const rfcTemplate = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  rfcTemplate as default
};
