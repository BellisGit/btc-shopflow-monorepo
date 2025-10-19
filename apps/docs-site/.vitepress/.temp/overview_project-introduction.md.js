import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"BTC 车间流程管理系统","description":"","frontmatter":{"title":"BTC 车间流程管理系统","type":"overview","project":"btc-shopflow","owner":"dev-team","created":"2025-10-14","updated":"2025-10-14","publish":true,"tags":["overview","project","introduction"],"sidebar_label":"项目介绍","sidebar_order":1,"sidebar_group":"overview"},"headers":[],"relativePath":"overview/project-introduction.md","filePath":"overview/project-introduction.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "overview/project-introduction.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="btc-车间流程管理系统" tabindex="-1">BTC 车间流程管理系统 <a class="header-anchor" href="#btc-车间流程管理系统" aria-label="Permalink to &quot;BTC 车间流程管理系统&quot;">​</a></h1><p>基于 Qiankun 的微前端架构，提供车间流程管理的一站式解决方案</p><h2 id="文档" tabindex="-1">文档 <a class="header-anchor" href="#文档" aria-label="Permalink to &quot;文档&quot;">​</a></h2><p><strong>所有文档已迁移到文档中心，请访问：</strong></p><ul><li><strong>开发环境</strong>：<a href="http://localhost:8085" target="_blank" rel="noreferrer">http://localhost:8085</a></li><li><strong>生产环境</strong>：<code>/internal/archive/</code></li></ul><p>或在主应用中点击&quot;文档中心&quot;菜单查看</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><h3 id="启动所有应用" tabindex="-1">启动所有应用 <a class="header-anchor" href="#启动所有应用" aria-label="Permalink to &quot;启动所有应用&quot;">​</a></h3><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">cd</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> btc-shopflow-monorepo</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> install</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:all</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h3 id="启动单个应用" tabindex="-1">启动单个应用 <a class="header-anchor" href="#启动单个应用" aria-label="Permalink to &quot;启动单个应用&quot;">​</a></h3><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 主应用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:main</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 物流应用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:logistics</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 工程应用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:engineering</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 品质应用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:quality</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 生产应用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:production</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}"># 文档中心</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">pnpm</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> dev:docs</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="项目结构" tabindex="-1">项目结构 <a class="header-anchor" href="#项目结构" aria-label="Permalink to &quot;项目结构&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>btc-shopflow-monorepo/</span></span>
<span class="line"><span>apps/ # 应用</span></span>
<span class="line"><span>main-app/ # 主应用（系统管理）</span></span>
<span class="line"><span>logistics-app/ # 物流应用</span></span>
<span class="line"><span>engineering-app/ # 工程应用</span></span>
<span class="line"><span>quality-app/ # 品质应用</span></span>
<span class="line"><span>production-app/ # 生产应用</span></span>
<span class="line"><span>docs-site/ # 文档中心（VitePress）</span></span>
<span class="line"><span>packages/ # 共享包</span></span>
<span class="line"><span>shared-core/ # 核心功能</span></span>
<span class="line"><span>shared-components/ # 共享组件</span></span>
<span class="line"><span>shared-utils/ # 工具函数</span></span>
<span class="line"><span>vite-plugin/ # Vite 插件</span></span>
<span class="line"><span>README.md # 本文件</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h2 id="相关链接" tabindex="-1">相关链接 <a class="header-anchor" href="#相关链接" aria-label="Permalink to &quot;相关链接&quot;">​</a></h2><ul><li><strong>文档中心</strong>：查看完整文档组件 API架构决策操作手册</li><li><strong>应用 README</strong>：</li><li><a href="/internal/archive/overview/main-app-readme">主应用</a></li><li><a href="/internal/archive/overview/logistics-app-readme">物流应用</a></li><li><a href="/internal/archive/overview/engineering-app-readme">工程应用</a></li><li><a href="/internal/archive/overview/quality-app-readme">品质应用</a></li><li><a href="/internal/archive/overview/production-app-readme">生产应用</a></li><li><a href="/internal/archive/overview/docs-site-readme">文档站点</a></li></ul><h2 id="重要提示" tabindex="-1">重要提示 <a class="header-anchor" href="#重要提示" aria-label="Permalink to &quot;重要提示&quot;">​</a></h2><p><strong>所有技术文档组件文档架构决策记录（ADR）操作手册（SOP）都已迁移到文档中心（<code>apps/docs-site/</code>）</strong></p><p><strong>不允许在文档中心之外创建新的 Markdown 文档（防止孤儿文档）</strong></p><p>如需创建新文档，请：</p><ol><li>访问文档中心</li><li>使用 <code>pnpm --filter docs-site new-doc</code> 命令创建</li><li>或直接在 <code>apps/docs-site/</code> 相应目录下创建</li></ol><h2 id="license" tabindex="-1">License <a class="header-anchor" href="#license" aria-label="Permalink to &quot;License&quot;">​</a></h2><p>MIT</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("overview/project-introduction.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const projectIntroduction = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  projectIntroduction as default
};
