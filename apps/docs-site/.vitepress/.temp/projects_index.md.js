import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"📁 项目索引","description":"","frontmatter":{"title":"📁 项目索引","type":"guide","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":[],"sidebar_label":"📁 项目索引","sidebar_order":0,"sidebar_collapsed":false},"headers":[],"relativePath":"projects/index.md","filePath":"projects/index.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "projects/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="项目索引" tabindex="-1">项目索引 <a class="header-anchor" href="#项目索引" aria-label="Permalink to &quot;项目索引&quot;">​</a></h1><blockquote><p>按项目分类的所有文档</p></blockquote><div class="tip custom-block"><p class="custom-block-title">提示</p><p>目前还没有收录任何文档请运行 <code>pnpm --filter docs-site ingest</code> 来收录文档</p></div><h2 id="项目说明" tabindex="-1">项目说明 <a class="header-anchor" href="#项目说明" aria-label="Permalink to &quot;项目说明&quot;">​</a></h2><p>文档会按以下项目分类：</p><ul><li><strong>components</strong> - 组件系统</li><li><strong>forms</strong> - 表单系统</li><li><strong>system</strong> - 系统功能</li><li><strong>layout</strong> - 布局系统</li><li><strong>shared-core</strong> - 核心共享库</li><li><strong>shared-components</strong> - 共享组件库</li><li><strong>shared-utils</strong> - 工具函数库</li><li><strong>architecture</strong> - 架构决策</li><li><strong>operations</strong> - 运维操作</li></ul><h2 id="如何收录文档" tabindex="-1">如何收录文档 <a class="header-anchor" href="#如何收录文档" aria-label="Permalink to &quot;如何收录文档&quot;">​</a></h2><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 1. 为文档添加 frontmatter</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> --filter</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> docs-site</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> add-frontmatter</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 2. 运行收录脚本</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> --filter</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> docs-site</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> ingest</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>收录完成后，此页面会自动生成项目索引</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("projects/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
