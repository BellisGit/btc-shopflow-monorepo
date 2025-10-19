import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"采用文档金字塔体系约束文档增长","description":"","frontmatter":{"title":"采用文档金字塔体系约束文档增长","type":"adr","project":"system","owner":"dev-team","created":"2025-10-11","updated":"2025-10-13","publish":true,"tags":["adr","system","documentation"],"sidebar_label":"文档金字塔体系","sidebar_order":2,"sidebar_group":"adr-system"},"headers":[],"relativePath":"adr/system/doc-pyramid.md","filePath":"adr/system/doc-pyramid.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/system/doc-pyramid.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-采用文档金字塔体系" tabindex="-1">ADR: 采用文档金字塔体系 <a class="header-anchor" href="#adr-采用文档金字塔体系" aria-label="Permalink to &quot;ADR: 采用文档金字塔体系&quot;">​</a></h1><blockquote><p><strong>状态</strong>: 已采纳<br><strong>日期</strong>: 2025-10-11<br><strong>决策者</strong>: 系统架构师<br><strong>影响范围</strong>: 文档系统和开发流程</p></blockquote><hr><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>项目文档爆炸：根目录 ~30 个 MD 文件，类型混乱（guide、tutorial、summary、troubleshooting、analysis 等）</p><p>问题：</p><ul><li>文档类型不明确，难以分类</li><li>新文档随意创建，缺乏约束</li><li>文档质量参差不齐</li><li>维护成本高，查找困难</li></ul><p>约束：</p><ul><li>需要清晰的文档分类体系</li><li>需要约束文档创建行为</li><li>需要保证文档质量</li><li>需要降低维护成本</li></ul><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h2><ul><li><p><strong>Option A</strong>: 自由文档模式</p></li><li><p>优点: 灵活性高</p></li><li><p>缺点: 文档混乱，难以管理</p></li><li><p><strong>Option B</strong>: 严格分类体系</p></li><li><p>优点: 结构清晰，易于管理</p></li><li><p>缺点: 可能过于僵化</p></li><li><p><strong>Option C</strong>: 文档金字塔体系</p></li><li><p>优点: 层次清晰，约束明确，质量可控</p></li><li><p>缺点: 初期需要投入时间建立规范</p></li></ul><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>采用 Option C: 文档金字塔体系</p><p>核心理由：</p><ul><li>层次清晰：从概览到细节，逐层深入</li><li>约束明确：每层文档有明确的目标和格式</li><li>质量可控：通过模板和检查确保质量</li></ul><p>金字塔结构：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>顶层：概览文档（README、OVERVIEW）</span></span>
<span class="line"><span>├── 中层：指南文档（GUIDE、TUTORIAL）</span></span>
<span class="line"><span>│   ├── 底层：参考文档（API、REFERENCE）</span></span>
<span class="line"><span>│   ├── 底层：故障排除（TROUBLESHOOTING）</span></span>
<span class="line"><span>│   └── 底层：分析文档（ANALYSIS、SUMMARY）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>文档类型约束：</p><ul><li><strong>概览</strong>：项目整体介绍，不超过 3 个</li><li><strong>指南</strong>：操作指南，每个主题 1 个</li><li><strong>参考</strong>：API 文档，按模块组织</li><li><strong>故障排除</strong>：常见问题，按问题类型组织</li><li><strong>分析</strong>：技术分析，按分析主题组织</li></ul><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>正向影响:</p><ul><li>文档结构清晰，易于导航</li><li>文档质量统一，维护成本降低</li><li>新文档创建有明确规范</li><li>查找效率提升</li></ul><p>负向影响/需要注意:</p><ul><li>初期需要大量重构工作</li><li>需要团队统一认知和执行</li><li>可能需要工具支持（模板、检查等）</li></ul><p>行动项:</p><ul><li>[x] 设计文档金字塔结构</li><li>[x] 创建文档模板</li><li>[x] 重构现有文档</li><li>[ ] 建立文档检查机制</li><li>[ ] 培训团队使用规范</li></ul><hr><p><strong>状态</strong>: 已实施 <strong>最后评审</strong>: 2025-10-13 <strong>下次评审</strong>: 2025-11-13</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/system/doc-pyramid.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const docPyramid = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  docPyramid as default
};
