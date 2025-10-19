import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"VitePress 文档站点集成简要方案","description":"","frontmatter":{"title":"VitePress 文档站点集成简要方案","type":"rfc","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["rfc"],"sidebar_label":"VitePress 文档站点集成简要方案","sidebar_order":999,"sidebar_collapsed":false,"sidebar_group":"rfc"},"headers":[],"relativePath":"adr/rfc/vitepress-integration-brief.md","filePath":"adr/rfc/vitepress-integration-brief.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/rfc/vitepress-integration-brief.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vitepress-文档站点集成简要方案" tabindex="-1">VitePress 文档站点集成简要方案 <a class="header-anchor" href="#vitepress-文档站点集成简要方案" aria-label="Permalink to &quot;VitePress 文档站点集成简要方案&quot;">​</a></h1><blockquote><p><strong>日期</strong>: 2025-10-12 <strong>结论</strong>: <strong>完全可行且推荐</strong></p></blockquote><h2 id="方案概述" tabindex="-1">方案概述 <a class="header-anchor" href="#方案概述" aria-label="Permalink to &quot;方案概述&quot;">​</a></h2><p>将现有文档系统迁移到VitePress，构建统一的文档站点。</p><h2 id="核心优势" tabindex="-1">核心优势 <a class="header-anchor" href="#核心优势" aria-label="Permalink to &quot;核心优势&quot;">​</a></h2><ol><li><strong>统一体验</strong>: 所有文档在一个站点中</li><li><strong>强大搜索</strong>: 内置全文搜索功能</li><li><strong>响应式设计</strong>: 支持各种设备访问</li><li><strong>易于维护</strong>: 基于Markdown，维护简单</li></ol><h2 id="技术方案" tabindex="-1">技术方案 <a class="header-anchor" href="#技术方案" aria-label="Permalink to &quot;技术方案&quot;">​</a></h2><ul><li><strong>框架</strong>: VitePress</li><li><strong>部署</strong>: 静态站点部署</li><li><strong>搜索</strong>: 内置搜索功能</li><li><strong>主题</strong>: 自定义主题</li></ul><h2 id="实施计划" tabindex="-1">实施计划 <a class="header-anchor" href="#实施计划" aria-label="Permalink to &quot;实施计划&quot;">​</a></h2><ol><li><strong>搭建框架</strong> (1周)</li><li><strong>迁移文档</strong> (2周)</li><li><strong>优化体验</strong> (1周)</li></ol><h2 id="风险评估" tabindex="-1">风险评估 <a class="header-anchor" href="#风险评估" aria-label="Permalink to &quot;风险评估&quot;">​</a></h2><ul><li><strong>技术风险</strong>: 低</li><li><strong>业务风险</strong>: 低</li><li><strong>时间风险</strong>: 可控</li></ul><h2 id="结论" tabindex="-1">结论 <a class="header-anchor" href="#结论" aria-label="Permalink to &quot;结论&quot;">​</a></h2><p><strong>推荐实施</strong>，预期收益大于风险。</p><hr><p><strong>状态</strong>: 已批准 <strong>实施时间</strong>: 2025-10-25</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/rfc/vitepress-integration-brief.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const vitepressIntegrationBrief = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  vitepressIntegrationBrief as default
};
