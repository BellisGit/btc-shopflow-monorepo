import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"操作流程标题","description":"","frontmatter":{"title":"操作流程标题","type":"sop","sidebar_label":"操作流程标题","sidebar_order":1,"sidebar_group":"sop"},"headers":[],"relativePath":"sop/templates/sop-template.md","filePath":"sop/templates/sop-template.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "sop/templates/sop-template.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="操作流程标题" tabindex="-1">操作流程标题 <a class="header-anchor" href="#操作流程标题" aria-label="Permalink to &quot;操作流程标题&quot;">​</a></h1><h2 id="概述" tabindex="-1">概述 <a class="header-anchor" href="#概述" aria-label="Permalink to &quot;概述&quot;">​</a></h2><p>操作流程的简要描述</p><h2 id="前置条件" tabindex="-1">前置条件 <a class="header-anchor" href="#前置条件" aria-label="Permalink to &quot;前置条件&quot;">​</a></h2><ul><li>条件1</li><li>条件2</li></ul><h2 id="操作步骤" tabindex="-1">操作步骤 <a class="header-anchor" href="#操作步骤" aria-label="Permalink to &quot;操作步骤&quot;">​</a></h2><h3 id="步骤1-步骤标题" tabindex="-1">步骤1: 步骤标题 <a class="header-anchor" href="#步骤1-步骤标题" aria-label="Permalink to &quot;步骤1: 步骤标题&quot;">​</a></h3><ol><li>具体操作1</li><li>具体操作2</li></ol><h3 id="步骤2-步骤标题" tabindex="-1">步骤2: 步骤标题 <a class="header-anchor" href="#步骤2-步骤标题" aria-label="Permalink to &quot;步骤2: 步骤标题&quot;">​</a></h3><ol><li>具体操作1</li><li>具体操作2</li></ol><h2 id="注意事项" tabindex="-1">注意事项 <a class="header-anchor" href="#注意事项" aria-label="Permalink to &quot;注意事项&quot;">​</a></h2><p>⚠️ <strong>重要提醒</strong>:</p><ul><li>注意1</li><li>注意2</li></ul><h2 id="故障排除" tabindex="-1">故障排除 <a class="header-anchor" href="#故障排除" aria-label="Permalink to &quot;故障排除&quot;">​</a></h2><h3 id="常见问题" tabindex="-1">常见问题 <a class="header-anchor" href="#常见问题" aria-label="Permalink to &quot;常见问题&quot;">​</a></h3><p><strong>问题1</strong>: 问题描述</p><ul><li><strong>解决方案</strong>: 解决方案描述</li></ul><p><strong>问题2</strong>: 问题描述</p><ul><li><strong>解决方案</strong>: 解决方案描述</li></ul><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./related-doc1">相关文档1</a></li><li><a href="./related-doc2">相关文档2</a></li></ul><hr><p><strong>维护团队</strong>: 开发团队 <strong>最后更新</strong>: YYYY-MM-DD <strong>版本</strong>: v1.0</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("sop/templates/sop-template.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const sopTemplate = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  sopTemplate as default
};
