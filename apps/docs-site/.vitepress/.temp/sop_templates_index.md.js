import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"文档模板","description":"","frontmatter":{"title":"文档模板","type":"sop","sidebar_label":"文档模板","sidebar_order":1,"sidebar_group":"templates"},"headers":[],"relativePath":"sop/templates/index.md","filePath":"sop/templates/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "sop/templates/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="文档模板" tabindex="-1">文档模板 <a class="header-anchor" href="#文档模板" aria-label="Permalink to &quot;文档模板&quot;">​</a></h1><p>这里提供了各种文档类型的标准模板，用于保持文档格式的一致性。</p><h2 id="模板列表" tabindex="-1">模板列表 <a class="header-anchor" href="#模板列表" aria-label="Permalink to &quot;模板列表&quot;">​</a></h2><h3 id="架构决策" tabindex="-1">架构决策 <a class="header-anchor" href="#架构决策" aria-label="Permalink to &quot;架构决策&quot;">​</a></h3><ul><li><strong><a href="./adr-template">ADR 模板</a></strong> - 架构决策记录模板</li></ul><h3 id="组件文档" tabindex="-1">组件文档 <a class="header-anchor" href="#组件文档" aria-label="Permalink to &quot;组件文档&quot;">​</a></h3><ul><li><strong><a href="./component-template">组件模板</a></strong> - 组件文档模板</li></ul><h3 id="方案设计" tabindex="-1">方案设计 <a class="header-anchor" href="#方案设计" aria-label="Permalink to &quot;方案设计&quot;">​</a></h3><ul><li><strong><a href="./rfc-template">RFC 模板</a></strong> - 方案设计文档模板</li></ul><h3 id="操作流程" tabindex="-1">操作流程 <a class="header-anchor" href="#操作流程" aria-label="Permalink to &quot;操作流程&quot;">​</a></h3><ul><li><strong><a href="./sop-template">SOP 模板</a></strong> - 标准操作流程模板</li></ul><h2 id="使用指南" tabindex="-1">使用指南 <a class="header-anchor" href="#使用指南" aria-label="Permalink to &quot;使用指南&quot;">​</a></h2><ol><li><strong>选择合适的模板</strong>: 根据文档类型选择对应的模板</li><li><strong>复制模板内容</strong>: 将模板内容复制到新文档</li><li><strong>填写具体信息</strong>: 替换模板中的占位符</li><li><strong>保持格式一致</strong>: 确保遵循模板的格式要求</li></ol><h2 id="模板规范" tabindex="-1">模板规范 <a class="header-anchor" href="#模板规范" aria-label="Permalink to &quot;模板规范&quot;">​</a></h2><ul><li>所有模板都包含标准的 frontmatter</li><li>使用统一的标题层级</li><li>保持一致的格式风格</li><li>包含必要的元数据</li></ul><hr><p><strong>维护</strong>: 开发团队 <strong>更新</strong>: 按需更新模板内容</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("sop/templates/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
