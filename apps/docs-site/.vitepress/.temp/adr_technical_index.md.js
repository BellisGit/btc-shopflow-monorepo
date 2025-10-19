import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"技术实现决策","description":"","frontmatter":{"title":"技术实现决策","type":"adr","project":"technical","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["adr","technical","implementation"],"sidebar_label":"技术实现","sidebar_order":2,"sidebar_group":"adr-technical"},"headers":[],"relativePath":"adr/technical/index.md","filePath":"adr/technical/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/technical/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="技术实现决策" tabindex="-1">技术实现决策 <a class="header-anchor" href="#技术实现决策" aria-label="Permalink to &quot;技术实现决策&quot;">​</a></h1><p>本部分记录了项目中重要的技术实现决策，包括插件修复国际化支持组件设计等技术细节</p><h2 id="决策列表" tabindex="-1">决策列表 <a class="header-anchor" href="#决策列表" aria-label="Permalink to &quot;决策列表&quot;">​</a></h2><h3 id="插件与工具" tabindex="-1">插件与工具 <a class="header-anchor" href="#插件与工具" aria-label="Permalink to &quot;插件与工具&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/technical/2025-10-11-svg-plugin-fix">SVG插件修复</a></strong> - SVG图标插件的技术问题和解决方案</li></ul><h3 id="国际化支持" tabindex="-1">国际化支持 <a class="header-anchor" href="#国际化支持" aria-label="Permalink to &quot;国际化支持&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/technical/2025-10-12-browser-title-i18n">浏览器标题国际化</a></strong> - 浏览器标题的多语言支持实现</li></ul><h3 id="组件设计" tabindex="-1">组件设计 <a class="header-anchor" href="#组件设计" aria-label="Permalink to &quot;组件设计&quot;">​</a></h3><ul><li><strong><a href="/internal/archive/adr/technical/2025-10-12-btc-dialog-component">BTC对话框组件</a></strong> - 对话框组件的技术设计和实现方案</li></ul><hr><h2 id="技术原则" tabindex="-1">技术原则 <a class="header-anchor" href="#技术原则" aria-label="Permalink to &quot;技术原则&quot;">​</a></h2><h3 id="_1-可维护性" tabindex="-1">1. 可维护性 <a class="header-anchor" href="#_1-可维护性" aria-label="Permalink to &quot;1. 可维护性&quot;">​</a></h3><ul><li>清晰的代码结构</li><li>完善的错误处理</li><li>详细的文档说明</li></ul><h3 id="_2-性能优化" tabindex="-1">2. 性能优化 <a class="header-anchor" href="#_2-性能优化" aria-label="Permalink to &quot;2. 性能优化&quot;">​</a></h3><ul><li>合理的资源加载策略</li><li>高效的渲染机制</li><li>最小化不必要的计算</li></ul><h3 id="_3-用户体验" tabindex="-1">3. 用户体验 <a class="header-anchor" href="#_3-用户体验" aria-label="Permalink to &quot;3. 用户体验&quot;">​</a></h3><ul><li>流畅的交互体验</li><li>一致的视觉设计</li><li>友好的错误提示</li></ul><hr><h2 id="技术选型" tabindex="-1">技术选型 <a class="header-anchor" href="#技术选型" aria-label="Permalink to &quot;技术选型&quot;">​</a></h2><p>每个技术决策都经过以下考虑：</p><ol><li><strong>技术可行性</strong>：是否能够满足功能需求</li><li><strong>性能影响</strong>：对系统性能的影响评估</li><li><strong>维护成本</strong>：长期维护的复杂度</li><li><strong>团队技能</strong>：团队对技术的掌握程度</li><li><strong>生态支持</strong>：技术生态的成熟度</li></ol><hr><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><a href="https://vuejs.org/" target="_blank" rel="noreferrer">Vue 3 官方文档</a></li><li><a href="https://element-plus.org/" target="_blank" rel="noreferrer">Element Plus 组件库</a></li><li><a href="https://vitejs.dev/" target="_blank" rel="noreferrer">Vite 构建工具</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/technical/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
