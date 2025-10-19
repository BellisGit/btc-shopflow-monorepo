import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"RFC 文档","description":"","frontmatter":{"title":"RFC 文档","type":"rfc","project":"btc-shopflow","owner":"dev-team","created":"2025-10-14","updated":"2025-10-14","publish":true,"tags":["rfc"],"sidebar_label":"RFC 文档","sidebar_order":1,"sidebar_group":"rfc"},"headers":[],"relativePath":"adr/rfc/index.md","filePath":"adr/rfc/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/rfc/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="rfc-文档" tabindex="-1">RFC 文档 <a class="header-anchor" href="#rfc-文档" aria-label="Permalink to &quot;RFC 文档&quot;">​</a></h1><p>RFC (Request for Comments) 文档记录了系统设计和方案讨论过程。</p><h2 id="文档列表" tabindex="-1">文档列表 <a class="header-anchor" href="#文档列表" aria-label="Permalink to &quot;文档列表&quot;">​</a></h2><h3 id="方案设计" tabindex="-1">方案设计 <a class="header-anchor" href="#方案设计" aria-label="Permalink to &quot;方案设计&quot;">​</a></h3><ul><li><strong><a href="./2025-10-12-vitepress-integration">VitePress 文档站点集成方案</a></strong> - 详细的集成方案设计</li><li><strong><a href="./vitepress-integration-brief">VitePress 集成简要方案</a></strong> - 简要方案概述</li></ul><h2 id="rfc-流程" tabindex="-1">RFC 流程 <a class="header-anchor" href="#rfc-流程" aria-label="Permalink to &quot;RFC 流程&quot;">​</a></h2><ol><li><strong>提案阶段</strong>: 提交RFC提案</li><li><strong>评审阶段</strong>: 团队评审讨论</li><li><strong>决策阶段</strong>: 确定实施方案</li><li><strong>实施阶段</strong>: 执行方案</li><li><strong>总结阶段</strong>: 记录结果和经验</li></ol><hr><p><strong>维护</strong>: 开发团队 <strong>更新</strong>: 按需更新</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/rfc/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
