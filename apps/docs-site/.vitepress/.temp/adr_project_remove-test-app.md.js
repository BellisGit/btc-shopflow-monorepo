import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"删除重复的 test-app 应用","description":"","frontmatter":{"title":"删除重复的 test-app 应用","type":"adr","project":"project","owner":"dev-team","created":"2025-10-11","updated":"2025-10-13","publish":true,"tags":["adr","project","cleanup"],"sidebar_label":"删除测试应用","sidebar_order":1,"sidebar_group":"adr-project"},"headers":[],"relativePath":"adr/project/remove-test-app.md","filePath":"adr/project/remove-test-app.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "adr/project/remove-test-app.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-删除重复的-test-app-应用" tabindex="-1">ADR: 删除重复的 test-app 应用 <a class="header-anchor" href="#adr-删除重复的-test-app-应用" aria-label="Permalink to &quot;ADR: 删除重复的 test-app 应用&quot;">​</a></h1><blockquote><p><strong>状态</strong>: 已采纳<br><strong>日期</strong>: 2025-10-11<br><strong>决策者</strong>: 开发团队<br><strong>影响范围</strong>: 项目结构和维护成本</p></blockquote><hr><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>test-app 最初作为&quot;Vite 插件测试应用&quot;创建，但实际包含了完整的业务页面（系统管理权限配置等），与 main-app 功能 100% 重复</p><p>问题：</p><ul><li>维护成本翻倍（每次改动需同步两个应用）</li><li>技术债务累积（test-app 使用旧架构）</li><li>定位模糊（名为测试，实为业务副本）</li><li>占用资源（~500KB 代码，100+ 重复文件）</li></ul><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h2><ul><li><p><strong>Option A: 保留 test-app，同步维护</strong></p></li><li><p>优点: 有独立测试环境</p></li><li><p>缺点: 维护成本高，技术债务持续</p></li><li><p><strong>Option B: 删除 test-app</strong></p></li><li><p>优点: 消除重复，降低维护成本</p></li><li><p>缺点: 失去独立测试应用</p></li><li><p><strong>Option C: 简化为纯插件测试</strong></p></li><li><p>优点: 保留测试环境，减少代码</p></li><li><p>缺点: 仍需维护，收益有限</p></li></ul><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>采用 <strong>Option B: 删除 test-app</strong></p><p>核心理由：</p><ol><li>main-app 已充分验证所有插件功能</li><li>插件测试应该用单元测试（Vitest），而非完整应用</li><li>消除 100% 重复代码，专注 5 个正式应用</li></ol><p>插件测试改用：</p><ul><li>单元测试：<code>packages/vite-plugin/test/*.test.ts</code></li><li>实际使用：main-app 就是最好的测试环境</li></ul><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p><strong>正向影响</strong>:</p><ul><li>节省 ~500KB 代码</li><li>减少 ~100 个重复文件</li><li>维护成本减半</li><li>项目结构更清晰</li></ul><p><strong>负向影响/需要注意</strong>:</p><ul><li>失去独立测试环境（用单元测试替代）</li><li>需要更新相关文档和配置</li></ul><p><strong>行动项</strong>:</p><ul><li>[x] 删除 apps/test-app/ 目录</li><li>[x] 更新 apps/README.md</li><li>[ ] 为 vite-plugin 添加单元测试（未来）</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("adr/project/remove-test-app.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const removeTestApp = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  removeTestApp as default
};
