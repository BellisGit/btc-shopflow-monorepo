import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"项目管理决策","description":"","frontmatter":{"title":"项目管理决策","type":"adr","project":"project","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["adr","project","management"],"sidebar_label":"项目管理","sidebar_order":3,"sidebar_group":"adr-project"},"headers":[],"relativePath":"adr/project/index.md","filePath":"adr/project/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/project/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="项目管理决策" tabindex="-1">项目管理决策 <a class="header-anchor" href="#项目管理决策" aria-label="Permalink to &quot;项目管理决策&quot;">​</a></h1><p>本部分记录了项目管理和组织相关的决策，包括项目结构调整组件澄清等项目级决策</p><h2 id="决策列表" tabindex="-1">决策列表 <a class="header-anchor" href="#决策列表" aria-label="Permalink to &quot;决策列表&quot;">​</a></h2><h3 id="项目结构" tabindex="-1">项目结构 <a class="header-anchor" href="#项目结构" aria-label="Permalink to &quot;项目结构&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/project/2025-10-11-remove-test-app">移除测试应用</a></strong> - 测试应用的移除决策和影响评估</li></ul><h3 id="组件澄清" tabindex="-1">组件澄清 <a class="header-anchor" href="#组件澄清" aria-label="Permalink to &quot;组件澄清&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/project/2025-10-12-btc-upsert-form-clarification">BTC表单澄清</a></strong> - BTC表单组件的功能澄清和定义</li></ul><hr><h2 id="管理原则" tabindex="-1">管理原则 <a class="header-anchor" href="#管理原则" aria-label="Permalink to &quot;管理原则&quot;">​</a></h2><h3 id="_1-简化原则" tabindex="-1">1. 简化原则 <a class="header-anchor" href="#_1-简化原则" aria-label="Permalink to &quot;1. 简化原则&quot;">​</a></h3><ul><li>移除不必要的复杂性</li><li>保持项目结构清晰</li><li>专注于核心功能</li></ul><h3 id="_2-一致性原则" tabindex="-1">2. 一致性原则 <a class="header-anchor" href="#_2-一致性原则" aria-label="Permalink to &quot;2. 一致性原则&quot;">​</a></h3><ul><li>统一的组件命名规范</li><li>一致的功能定义</li><li>标准化的开发流程</li></ul><h3 id="_3-效率原则" tabindex="-1">3. 效率原则 <a class="header-anchor" href="#_3-效率原则" aria-label="Permalink to &quot;3. 效率原则&quot;">​</a></h3><ul><li>减少重复工作</li><li>提高开发效率</li><li>优化资源使用</li></ul><hr><h2 id="决策流程" tabindex="-1">决策流程 <a class="header-anchor" href="#决策流程" aria-label="Permalink to &quot;决策流程&quot;">​</a></h2><p>项目管理决策遵循以下流程：</p><ol><li><strong>问题识别</strong>：明确需要解决的问题</li><li><strong>影响分析</strong>：评估决策对项目的影响</li><li><strong>方案对比</strong>：比较不同解决方案的优劣</li><li><strong>团队讨论</strong>：团队内部讨论和评审</li><li><strong>决策记录</strong>：记录决策过程和结果</li><li><strong>执行跟踪</strong>：跟踪决策的执行效果</li></ol><hr><h2 id="决策影响" tabindex="-1">决策影响 <a class="header-anchor" href="#决策影响" aria-label="Permalink to &quot;决策影响&quot;">​</a></h2><p>每个项目决策都会记录：</p><ul><li><strong>决策背景</strong>：为什么需要这个决策</li><li><strong>影响范围</strong>：决策影响的模块和功能</li><li><strong>执行计划</strong>：具体的执行步骤和时间安排</li><li><strong>风险评估</strong>：可能的风险和应对措施</li><li><strong>成功标准</strong>：如何评估决策的成功</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/project/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
