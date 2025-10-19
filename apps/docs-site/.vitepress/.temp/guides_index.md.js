import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"简介","description":"","frontmatter":{"title":"简介","type":"guide","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["guides","introduction"],"sidebar_label":"开发指南","sidebar_order":1,"sidebar_group":"guides"},"headers":[],"relativePath":"guides/index.md","filePath":"guides/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="开发指南" tabindex="-1">开发指南 <a class="header-anchor" href="#开发指南" aria-label="Permalink to &quot;开发指南&quot;">​</a></h1><p>本文档库提供了完整的开发指南，包括前端组件开发、后端服务开发、系统配置和部署指南，帮助您快速上手和深入理解 BTC 车间管理系统。</p><h2 id="核心特性" tabindex="-1">核心特性 <a class="header-anchor" href="#核心特性" aria-label="Permalink to &quot;核心特性&quot;">​</a></h2><ul><li><strong>开箱即用</strong>：提供完整的 CRUD 组件，简化业务开发</li><li><strong>类型安全</strong>：基于 TypeScript，提供完整的类型定义</li><li><strong>主题定制</strong>：支持动态主题切换和自定义样式</li><li><strong>国际化</strong>：内置多语言支持</li><li><strong>响应式</strong>：适配各种屏幕尺寸</li></ul><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 安装依赖</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> install</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 启动开发服务器</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h2 id="指南结构" tabindex="-1">指南结构 <a class="header-anchor" href="#指南结构" aria-label="Permalink to &quot;指南结构&quot;">​</a></h2><h3 id="前端开发" tabindex="-1">前端开发 <a class="header-anchor" href="#前端开发" aria-label="Permalink to &quot;前端开发&quot;">​</a></h3><ul><li><a href="/internal/archive/guides/getting-started/">快速开始</a> - 快速上手指南</li><li><a href="/internal/archive/guides/components/">组件开发</a> - CRUD、表单等组件开发</li><li><a href="/internal/archive/guides/forms/">表单处理</a> - 表单设计和处理</li><li><a href="/internal/archive/guides/system/">系统配置</a> - 环境配置和主题定制</li><li><a href="/internal/archive/guides/integration/">集成部署</a> - 文档集成和部署指南</li></ul><h3 id="后端开发" tabindex="-1">后端开发 <a class="header-anchor" href="#后端开发" aria-label="Permalink to &quot;后端开发&quot;">​</a></h3><ul><li><a href="/internal/archive/guides/backend/">后端开发指南</a> - 微服务架构和开发指南</li><li><a href="/internal/archive/guides/test-network">网络测试</a> - 网络访问测试和故障排除</li><li><a href="/internal/archive/guides/deployment-guide">部署指南</a> - 后端服务部署指南</li></ul><hr><h2 id="设计理念" tabindex="-1">设计理念 <a class="header-anchor" href="#设计理念" aria-label="Permalink to &quot;设计理念&quot;">​</a></h2><p>我们致力于提供：</p><ul><li><strong>简单易用</strong>：降低学习成本，提高开发效率</li><li><strong>灵活可扩展</strong>：支持自定义配置和扩展</li><li><strong>性能优化</strong>：关注加载速度和运行性能</li><li><strong>开发体验</strong>：提供完整的开发工具和调试支持</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
