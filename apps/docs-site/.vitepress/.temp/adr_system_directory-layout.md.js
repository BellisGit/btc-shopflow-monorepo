import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"基于目录的布局架构","description":"","frontmatter":{"title":"基于目录的布局架构","type":"adr","project":"system","owner":"dev-team","created":"2025-10-11","updated":"2025-10-13","publish":true,"tags":["adr","system","layout"],"sidebar_label":"目录布局架构","sidebar_order":1,"sidebar_group":"adr-system"},"headers":[],"relativePath":"adr/system/directory-layout.md","filePath":"adr/system/directory-layout.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/system/directory-layout.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-基于目录的布局架构" tabindex="-1">ADR: 基于目录的布局架构 <a class="header-anchor" href="#adr-基于目录的布局架构" aria-label="Permalink to &quot;ADR: 基于目录的布局架构&quot;">​</a></h1><blockquote><p><strong>状态</strong>: 已采纳<br><strong>日期</strong>: 2025-10-11<br><strong>决策者</strong>: 开发团队<br><strong>影响范围</strong>: 组件架构和开发流程</p></blockquote><hr><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>布局组件（TopbarSidebarProcess 等）原本以单文件形式存放在 <code>layout/components/</code> 目录下随着功能增长，单文件难以扩展，相关逻辑类型样式混在一起，维护困难</p><p>约束：</p><ul><li>需要支持组件逻辑拆分（composablestypes）</li><li>需要符合现代前端生态（Nuxtunplugin-vue-router）</li><li>需要清晰的功能边界</li></ul><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h2><ul><li><p><strong>Option A</strong>: 保持单文件</p></li><li><p>优点: 简单直接</p></li><li><p>缺点: 组件长大后难以维护，无法就地扩展</p></li><li><p><strong>Option B</strong>: 目录即组件</p></li><li><p>优点: 可扩展职责清晰符合生态</p></li><li><p>缺点: 初期目录稍多</p></li><li><p><strong>Option C</strong>: 混合模式</p></li><li><p>优点: 灵活</p></li><li><p>缺点: 规范不统一，混乱</p></li></ul><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>采用 Option B: 目录即组件架构</p><p>核心理由：</p><ul><li>可扩展性：组件长大时可添加 composables.ts、types.ts、styles.scss</li><li>生态契合：Nuxt、unplugin-vue-router 默认此模式</li><li>协作友好：新人一看目录就懂组件边界</li></ul><p>结构：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>layout/</span></span>
<span class="line"><span>├── topbar/</span></span>
<span class="line"><span>│   ├── index.vue</span></span>
<span class="line"><span>│   └── README.md</span></span>
<span class="line"><span>├── sidebar/</span></span>
<span class="line"><span>│   ├── index.vue</span></span>
<span class="line"><span>│   └── README.md</span></span>
<span class="line"><span>└── index.vue</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>命名规范：</p><ul><li>目录名：kebab-case（theme-switcher）</li><li>组件名：PascalCase（LayoutThemeSwitcher）</li><li>主文件：统一 index.vue</li></ul><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>正向影响:</p><ul><li>组件逻辑可拆分，便于维护</li><li>目录即功能边界，职责清晰</li><li>未来切换到文件路由几乎零成本</li></ul><p>负向影响/需要注意:</p><ul><li>导入路径变长：./topbar/index.vue</li><li>需要统一规范，避免混乱</li></ul><p>行动项:</p><ul><li>[x] 创建新目录结构</li><li>[x] 迁移所有布局组件</li><li>[x] 更新导入路径</li><li>[x] 为每个组件添加 README.md</li><li>[ ] 其他应用（logistics、engineering 等）逐步跟进</li></ul><hr><p><strong>状态</strong>: 已实施 <strong>最后评审</strong>: 2025-10-13 <strong>下次评审</strong>: 2025-11-13</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/system/directory-layout.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const directoryLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  directoryLayout as default
};
