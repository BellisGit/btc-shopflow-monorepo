import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"系统架构决策","description":"","frontmatter":{"title":"系统架构决策","type":"adr","project":"system","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["adr","system","architecture"],"sidebar_label":"系统架构","sidebar_order":1,"sidebar_group":"adr-system"},"headers":[],"relativePath":"adr/system/index.md","filePath":"adr/system/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/system/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="系统架构决策" tabindex="-1">系统架构决策 <a class="header-anchor" href="#系统架构决策" aria-label="Permalink to &quot;系统架构决策&quot;">​</a></h1><p>本部分记录了系统中重要的架构决策，包括目录结构文档系统菜单系统等核心架构设计</p><h2 id="决策列表" tabindex="-1">决策列表 <a class="header-anchor" href="#决策列表" aria-label="Permalink to &quot;决策列表&quot;">​</a></h2><h3 id="目录结构设计" tabindex="-1">目录结构设计 <a class="header-anchor" href="#目录结构设计" aria-label="Permalink to &quot;目录结构设计&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/system/2025-10-11-directory-based-layout">基于目录的布局架构</a></strong> - 采用目录即组件的架构模式</li><li><strong><a href="/internal/archive/adr/system/2025-10-11-doc-system-pyramid">文档系统金字塔</a></strong> - 文档系统的层次化组织结构</li><li><strong><a href="/internal/archive/adr/system/2025-10-12-system-menu-restructure">系统菜单重构</a></strong> - 系统菜单的结构优化和重组</li></ul><hr><h2 id="设计原则" tabindex="-1">设计原则 <a class="header-anchor" href="#设计原则" aria-label="Permalink to &quot;设计原则&quot;">​</a></h2><h3 id="_1-模块化设计" tabindex="-1">1. 模块化设计 <a class="header-anchor" href="#_1-模块化设计" aria-label="Permalink to &quot;1. 模块化设计&quot;">​</a></h3><ul><li>每个功能模块独立开发</li><li>清晰的模块边界和接口定义</li><li>便于维护和扩展</li></ul><h3 id="_2-可扩展性" tabindex="-1">2. 可扩展性 <a class="header-anchor" href="#_2-可扩展性" aria-label="Permalink to &quot;2. 可扩展性&quot;">​</a></h3><ul><li>支持新功能的快速集成</li><li>灵活的配置机制</li><li>向后兼容的设计</li></ul><h3 id="_3-一致性" tabindex="-1">3. 一致性 <a class="header-anchor" href="#_3-一致性" aria-label="Permalink to &quot;3. 一致性&quot;">​</a></h3><ul><li>统一的开发规范</li><li>一致的命名约定</li><li>标准化的组件接口</li></ul><hr><h2 id="演进历程" tabindex="-1">演进历程 <a class="header-anchor" href="#演进历程" aria-label="Permalink to &quot;演进历程&quot;">​</a></h2><p>这些架构决策记录了系统从初始设计到当前状态的演进过程，每个决策都基于当时的技术需求和约束条件</p><p>通过回顾这些决策，我们可以：</p><ul><li>理解设计思路的演进</li><li>为未来的架构调整提供参考</li><li>避免重复讨论已解决的问题</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/system/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
