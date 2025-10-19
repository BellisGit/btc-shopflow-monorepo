import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"缓存优化","description":"","frontmatter":{"title":"缓存优化","type":"guide","project":"btc-shopflow","owner":"dev-team","created":"2025-10-13","updated":"2025-10-13","publish":true,"tags":["integration","guides"],"sidebar_label":"缓存优化","sidebar_order":2,"sidebar_group":"integration"},"headers":[],"relativePath":"guides/integration/cache-debug.md","filePath":"guides/integration/cache-debug.md","lastUpdated":1760420026000}');
const _sfc_main = { name: "guides/integration/cache-debug.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="文档缓存调试指南" tabindex="-1">文档缓存调试指南 <a class="header-anchor" href="#文档缓存调试指南" aria-label="Permalink to &quot;文档缓存调试指南&quot;">​</a></h1><h2 id="测试步骤" tabindex="-1">测试步骤 <a class="header-anchor" href="#测试步骤" aria-label="Permalink to &quot;测试步骤&quot;">​</a></h2><h3 id="_1-首次访问文档" tabindex="-1">1. 首次访问文档 <a class="header-anchor" href="#_1-首次访问文档" aria-label="Permalink to &quot;1. 首次访问文档&quot;">​</a></h3><ol><li>刷新浏览器（F5）</li><li>打开开发者工具控制台（F12）</li><li>观察缓存相关的日志信息</li></ol><h3 id="_2-缓存验证" tabindex="-1">2. 缓存验证 <a class="header-anchor" href="#_2-缓存验证" aria-label="Permalink to &quot;2. 缓存验证&quot;">​</a></h3><ol><li>检查网络请求状态</li><li>验证缓存策略是否正确</li><li>确认资源加载性能</li></ol><h3 id="_3-缓存清理" tabindex="-1">3. 缓存清理 <a class="header-anchor" href="#_3-缓存清理" aria-label="Permalink to &quot;3. 缓存清理&quot;">​</a></h3><ol><li>清除浏览器缓存</li><li>重新访问文档</li><li>验证缓存重建过程</li></ol><h2 id="缓存策略" tabindex="-1">缓存策略 <a class="header-anchor" href="#缓存策略" aria-label="Permalink to &quot;缓存策略&quot;">​</a></h2><h3 id="静态资源缓存" tabindex="-1">静态资源缓存 <a class="header-anchor" href="#静态资源缓存" aria-label="Permalink to &quot;静态资源缓存&quot;">​</a></h3><ul><li>HTML 文件：不缓存</li><li>CSS/JS 文件：长期缓存</li><li>图片资源：中期缓存</li></ul><h3 id="文档内容缓存" tabindex="-1">文档内容缓存 <a class="header-anchor" href="#文档内容缓存" aria-label="Permalink to &quot;文档内容缓存&quot;">​</a></h3><ul><li>Markdown 内容：短期缓存</li><li>搜索结果：内存缓存</li><li>导航数据：会话缓存</li></ul><h2 id="性能优化" tabindex="-1">性能优化 <a class="header-anchor" href="#性能优化" aria-label="Permalink to &quot;性能优化&quot;">​</a></h2><h3 id="缓存命中率" tabindex="-1">缓存命中率 <a class="header-anchor" href="#缓存命中率" aria-label="Permalink to &quot;缓存命中率&quot;">​</a></h3><ul><li>目标：&gt; 80%</li><li>监控：缓存命中统计</li><li>优化：调整缓存策略</li></ul><h3 id="加载时间" tabindex="-1">加载时间 <a class="header-anchor" href="#加载时间" aria-label="Permalink to &quot;加载时间&quot;">​</a></h3><ul><li>首屏加载：&lt; 2s</li><li>文档切换：&lt; 500ms</li><li>搜索响应：&lt; 200ms</li></ul><hr><p><strong>测试状态</strong>: 通过 <strong>优化状态</strong>: 完成</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guides/integration/cache-debug.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const cacheDebug = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  cacheDebug as default
};
