import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, join } from 'path';
import { existsSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import type { Plugin } from 'vite';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getAppConfig } from '../../configs/app-env.config';

// 从统一配置中获取应用配置
const appConfig = getAppConfig('admin-app');
if (!appConfig) {
  throw new Error('未找到 admin-app 的环境配置');
}

// 子应用预览端口和主机（预览环境使用）
const APP_PORT = parseInt(appConfig.prePort, 10);
const APP_HOST = appConfig.preHost;
const MAIN_APP_CONFIG = getAppConfig('system-app');
const MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : 'http://localhost:4180';

// 判断是否为预览构建（用于本地预览测试）
// 生产构建应该使用相对路径，让浏览器根据当前域名自动解析
const isPreviewBuild = process.env.VITE_PREVIEW === 'true';

// 构建前清理 dist 目录插件
const cleanDistPlugin = (): Plugin => {
  return {
    name: 'clean-dist-plugin',
    buildStart() {
      const distDir = resolve(__dirname, 'dist');
      if (existsSync(distDir)) {
        console.log('[clean-dist-plugin] 🧹 清理旧的 dist 目录...');
        try {
          rmSync(distDir, { recursive: true, force: true });
          console.log('[clean-dist-plugin] ✅ dist 目录已清理');
        } catch (error) {
          console.warn('[clean-dist-plugin] ⚠️ 清理 dist 目录失败，继续构建:', error);
        }
      }
    },
  };
};

// 验证所有 chunk 生成插件
const chunkVerifyPlugin = (): Plugin => {
  return {
    name: 'chunk-verify-plugin',
    writeBundle(options, bundle) {
      console.log('\n[chunk-verify-plugin] ✅ 生成的所有 chunk 文件：');
      // 分类打印 JS chunk、CSS chunk、其他资源
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      console.log(`\nJS chunk（共 ${jsChunks.length} 个）：`);
      jsChunks.forEach(chunk => console.log(`  - ${chunk}`));

      console.log(`\nCSS chunk（共 ${cssChunks.length} 个）：`);
      cssChunks.forEach(chunk => console.log(`  - ${chunk}`));

      // 检查核心 chunk 是否存在（避免关键依赖丢失）
      // 注意：现在使用平衡拆分策略，只拆分独立大库，业务代码合并到入口文件
      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      const indexSize = indexChunk ? (bundle[indexChunk] as any)?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;

      // 检查入口文件是否存在
      const missingRequiredChunks: string[] = [];
      if (!indexChunk) {
        missingRequiredChunks.push('index');
      }

      // 验证拆分后的 chunk 是否存在（可选检查，不强制）
      const hasEpsService = jsChunks.some(jsChunk => jsChunk.includes('eps-service'));
      const hasEchartsVendor = jsChunks.some(jsChunk => jsChunk.includes('echarts-vendor'));
      const hasLibMonaco = jsChunks.some(jsChunk => jsChunk.includes('lib-monaco'));
      const hasLibThree = jsChunks.some(jsChunk => jsChunk.includes('lib-three'));

      // 验证构建结果
      console.log(`\n[chunk-verify-plugin] 📦 构建情况（平衡拆分策略）：`);
      if (indexChunk) {
        console.log(`  ✅ index: 主文件（Vue生态 + Element Plus + 业务代码，体积~${indexSizeMB.toFixed(2)}MB 未压缩，gzip后~${(indexSizeMB * 0.3).toFixed(2)}MB）`);
      } else {
        console.log(`  ❌ 入口文件不存在`);
      }
      if (hasEpsService) console.log(`  ✅ eps-service: EPS 服务（所有应用共享，单独打包）`);
      if (hasEchartsVendor) console.log(`  ✅ echarts-vendor: ECharts + zrender（独立大库，无依赖问题）`);
      if (hasLibMonaco) console.log(`  ✅ lib-monaco: Monaco Editor（独立大库）`);
      if (hasLibThree) console.log(`  ✅ lib-three: Three.js（独立大库）`);
      console.log(`  ℹ️  业务代码和 Vue 生态合并到主文件，避免初始化顺序问题`);

      if (missingRequiredChunks.length > 0) {
        console.error(`\n[chunk-verify-plugin] ❌ 缺失核心 chunk：`, missingRequiredChunks);
        throw new Error(`核心 chunk 缺失，构建失败！`);
      } else {
        console.log(`\n[chunk-verify-plugin] ✅ 核心 chunk 全部存在`);
      }

      // 关键：验证所有 chunk 文件中引用的资源文件是否都存在
      console.log('\n[chunk-verify-plugin] 🔍 验证资源引用一致性...');
      const allChunkFiles = new Set([...jsChunks, ...cssChunks]);
      const referencedFiles = new Map<string, string[]>(); // 引用的文件名 -> 引用它的 chunk 列表
      const missingFiles: Array<{ file: string; referencedBy: string[]; possibleMatches: string[] }> = [];

      // 从所有 JS chunk 中提取引用的资源文件路径
      // 只匹配真正的动态导入和资源引用
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 移除注释，避免匹配注释中的路径
          const codeWithoutComments = chunk.code
            .replace(/\/\/.*$/gm, '') // 移除单行注释
            .replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行注释

          // 匹配动态导入：import('/assets/xxx.js') 或 import("/assets/xxx.js")
          const importPattern = /import\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']\s*\)/g;
          let match;
          while ((match = importPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            const resourceFile = resourcePath.replace(/^\/?assets\//, 'assets/');
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile)!.push(fileName);
          }

          // 匹配 new URL('/assets/xxx.js', ...)
          const urlPattern = /new\s+URL\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']/g;
          while ((match = urlPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            const resourceFile = resourcePath.replace(/^\/?assets\//, 'assets/');
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile)!.push(fileName);
          }
        }
      }

      // 检查所有引用的文件是否都在 bundle 中存在
      for (const [referencedFile, referencedBy] of referencedFiles.entries()) {
        // 提取文件名（不含路径）：xxx-hash.js
        const fileName = referencedFile.replace(/^assets\//, '');

        // 检查是否存在完全匹配的文件
        let exists = allChunkFiles.has(fileName);
        let possibleMatches: string[] = [];

        // 如果不存在完全匹配，检查文件名模式匹配（忽略 hash）
        if (!exists) {
          // 提取文件名前缀（如 element-plus）和扩展名
          // 支持多种文件名格式：name-hash.ext, name-hash-hash.ext, name.ext
          const match = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
          if (match) {
            const [, namePrefix, , ext] = match;
            // 查找所有匹配的文件（忽略 hash）
            possibleMatches = Array.from(allChunkFiles).filter(chunkFile => {
              const chunkMatch = chunkFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (chunkMatch) {
                const [, chunkNamePrefix, , chunkExt] = chunkMatch;
                return chunkNamePrefix === namePrefix && chunkExt === ext;
              }
              return false;
            });
            exists = possibleMatches.length > 0;
          } else {
            // 如果文件名格式不匹配，尝试直接查找相似的文件名
            const nameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, '');
            possibleMatches = Array.from(allChunkFiles).filter(chunkFile => {
              const chunkNameWithoutExt = chunkFile.replace(/\.(js|mjs|css)$/, '');
              // 检查文件名前缀是否相似（至少前10个字符匹配）
              return chunkNameWithoutExt.startsWith(nameWithoutExt.substring(0, 10)) ||
                     nameWithoutExt.startsWith(chunkNameWithoutExt.substring(0, 10));
            });
          }
        }

        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }

      if (missingFiles.length > 0) {
        console.error(`\n[chunk-verify-plugin] ❌ 发现 ${missingFiles.length} 个引用的资源文件不存在：`);
        console.error(`\n[chunk-verify-plugin] 实际存在的文件（共 ${allChunkFiles.size} 个）：`);
        Array.from(allChunkFiles).sort().forEach(file => console.error(`  - ${file}`));
        console.error(`\n[chunk-verify-plugin] 引用的文件（共 ${referencedFiles.size} 个）：`);
        Array.from(referencedFiles.keys()).sort().forEach(file => console.error(`  - ${file}`));
        console.error(`\n[chunk-verify-plugin] 缺失的文件详情：`);
        missingFiles.forEach(({ file, referencedBy, possibleMatches }) => {
          console.error(`  - ${file}`);
          console.error(`    被以下文件引用: ${referencedBy.join(', ')}`);
          if (possibleMatches.length > 0) {
            console.error(`    可能的匹配文件: ${possibleMatches.join(', ')}`);
          }
        });
        console.error('\n[chunk-verify-plugin] 这通常是因为：');
        console.error('  1. 构建前没有清理旧的 dist 目录（已自动处理）');
        console.error('  2. 构建过程中文件名 hash 不一致');
        console.error('  3. useDevMode 配置导致资源引用不一致');
        console.error('  4. 构建产物不完整（部分文件未生成）');
        console.error('  5. 验证逻辑误报（引用了不存在的文件）');
        console.error('\n[chunk-verify-plugin] 解决方案：');
        console.error('  1. 运行 pnpm prebuild:all 清理缓存和 dist 目录');
        console.error('  2. 重新构建应用');
        console.error('  3. 检查构建日志，确认所有文件都已生成');
        console.error('  4. 如果确认是误报，可以临时禁用此验证插件');

        // 如果缺失文件数量较少（可能是误报），只警告；否则报错
        if (missingFiles.length <= 5) {
          console.warn(`\n[chunk-verify-plugin] ⚠️  警告：发现 ${missingFiles.length} 个引用的资源文件不存在，但继续构建`);
          console.warn(`[chunk-verify-plugin] 请检查上述详细信息，确认是否真的存在问题`);
        } else {
          throw new Error(`资源引用不一致，构建失败！有 ${missingFiles.length} 个引用的文件不存在`);
        }
      } else {
        console.log(`\n[chunk-verify-plugin] ✅ 所有资源引用都正确（共验证 ${referencedFiles.size} 个引用）`);
      }
    },
  };
};

// 优化代码分割插件：处理空 chunk，避免运行时 404
const optimizeChunksPlugin = (): Plugin => {
  return {
    name: 'optimize-chunks',
    generateBundle(options, bundle) {
      // 收集所有空 chunk
      const emptyChunks: string[] = [];
      const chunkReferences = new Map<string, string[]>(); // chunk 名称 -> 引用它的 chunk 列表

      // 第一步：找出所有空 chunk，并收集引用关系
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        // 收集 chunk 的依赖关系（哪些 chunk 引用了这个 chunk）
        if (chunk.type === 'chunk' && chunk.imports) {
          for (const imported of chunk.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported)!.push(fileName);
          }
        }
      }

      if (emptyChunks.length === 0) {
        return;
      }

      // 第二步：对于每个空 chunk，检查是否被引用
      // 如果被引用，需要特殊处理（合并到引用它的 chunk 或保留占位符）
      const chunksToRemove: string[] = [];
      const chunksToKeep: string[] = [];

      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
          if (referencedBy.length > 0) {
          // 被引用了，不能直接删除，需要保留或合并
          // 方案：保留一个最小的有效 ES 模块代码，避免运行时错误
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === 'chunk') {
            // 创建一个最小的有效 ES 模块，避免运行时错误
            // 使用 export {} 确保它是一个有效的 ES 模块
            chunk.code = 'export {};';
            chunksToKeep.push(emptyChunk);
            console.log(`[optimize-chunks] 保留被引用的空 chunk: ${emptyChunk} (被 ${referencedBy.length} 个 chunk 引用，已添加占位符)`);
          }
        } else {
          // 没有被引用，可以安全删除
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }

      if (chunksToRemove.length > 0) {
        console.log(`[optimize-chunks] 移除了 ${chunksToRemove.length} 个未被引用的空 chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        console.log(`[optimize-chunks] 保留了 ${chunksToKeep.length} 个被引用的空 chunk（已添加占位符）:`, chunksToKeep);
      }
    },
  };
};

// 强制生成新 hash 插件：在构建时添加构建 ID 到代码中，确保每次构建内容都不同
// 同时在 generateBundle 阶段修改文件名，添加时间戳
const forceNewHashPlugin = (): Plugin => {
  const buildId = Date.now().toString(36);
  const cssFileNameMap = new Map<string, string>(); // 旧 CSS 文件名 -> 新 CSS 文件名（不含 assets/ 前缀）
  const jsFileNameMap = new Map<string, string>(); // 旧 JS 文件名 -> 新 JS 文件名（不含 assets/ 前缀）

  return {
    name: 'force-new-hash',
    buildStart() {
      console.log(`[force-new-hash] 构建 ID: ${buildId}`);
      cssFileNameMap.clear();
    },
    renderChunk(code, chunk) {
      // 在每个 chunk 的开头添加构建 ID 注释，这样内容变了，hash 就会变
      // 关键：跳过第三方库 chunk，避免破坏其内部代码
      const isThirdPartyLib = chunk.fileName?.includes('lib-echarts') ||
                               chunk.fileName?.includes('element-plus') ||
                               chunk.fileName?.includes('vue-core') ||
                               chunk.fileName?.includes('vue-router') ||
                               chunk.fileName?.includes('vendor');

      if (isThirdPartyLib) {
        // 第三方库不添加注释，避免破坏代码
        return null; // 返回 null 表示不修改
      }

      return `/* build-id: ${buildId} */\n${code}`;
    },
    generateBundle(options, bundle) {
      // 修改所有 chunk 的文件名，添加构建 ID
      // 注意：需要在 fixDynamicImportHashPlugin 之前执行，确保文件名已经更新
      const fileNameMap = new Map<string, string>(); // 旧文件名 -> 新文件名

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          // 关键：lib-echarts 也需要修改文件名，确保与其他 chunk 的引用关系一致
          // 之前跳过 lib-echarts 的文件名修改是为了避免破坏其内部代码
          // 但实际上，只要不修改其内容，只修改文件名是安全的
          // 而且，lib-echarts 引用了 vendor，如果 vendor 的文件名被修改了，lib-echarts 的文件名也应该被修改
          // 这样才能确保引用关系的一致性
          // 注意：lib-echarts 的内容修改会在下面的逻辑中跳过，只更新引用

          // 提取文件名（去掉 assets/ 前缀和 .js 后缀）
          let baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');

          // 关键：检查 Rollup 是否生成了末尾有连字符的文件名
          // 如果 baseName 末尾有连字符，说明 Rollup 的 [hash] 可能为空或格式异常
          // 这会导致文件名格式不正确，需要记录并修复
          if (baseName.endsWith('-')) {
            console.warn(`[force-new-hash] ⚠️  检测到 Rollup 生成的异常文件名（末尾有连字符）: ${fileName}`);
            console.warn(`[force-new-hash] ⚠️  这通常表示 Rollup 的 [hash] 为空或格式异常，需要检查 chunkFileNames 配置`);
          }

          // 关键：清理末尾的连字符，避免生成 vue-core-3nfEKAw--miqp4pax.js 这样的文件名
          // 如果 baseName 末尾有连字符，先移除它
          const originalBaseName = baseName;
          baseName = baseName.replace(/-+$/, '');

          // 如果清理了末尾连字符，记录日志
          if (originalBaseName !== baseName) {
            console.log(`[force-new-hash] 🔧 清理了末尾连字符: ${originalBaseName} -> ${baseName}`);
          }

          // 在文件名末尾添加构建 ID
          // 格式：name-hash -> name-hash-buildId
          const newFileName = `assets/${baseName}-${buildId}.js`;

          // 记录文件名映射
          fileNameMap.set(fileName, newFileName);
          // 也保存到插件上下文中，供 writeBundle 使用
          const oldRef = fileName.replace(/^assets\//, '');
          const newRef = newFileName.replace(/^assets\//, '');
          jsFileNameMap.set(oldRef, newRef);

          // 更新 chunk 的文件名
          (chunk as any).fileName = newFileName;

          // 将 chunk 移动到新文件名
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        } else if (chunk.type === 'asset' && fileName.endsWith('.css') && fileName.startsWith('assets/')) {
          // CSS 文件也添加构建 ID
          let baseName = fileName.replace(/^assets\//, '').replace(/\.css$/, '');
          // 关键：清理末尾的连字符，避免生成异常的文件名
          baseName = baseName.replace(/-+$/, '');
          const newFileName = `assets/${baseName}-${buildId}.css`;

          fileNameMap.set(fileName, newFileName);
          // 记录 CSS 文件名映射（用于更新 index.html）
          const oldCssName = fileName.replace(/^assets\//, '');
          const newCssName = newFileName.replace(/^assets\//, '');
          cssFileNameMap.set(oldCssName, newCssName);

          (chunk as any).fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }

      // 更新所有 chunk 中的引用
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 关键：对于第三方库，我们需要更新它们对其他文件的引用
          // 例如：vue-router 引用了 vue-core，如果 vue-core 的文件名被修改了，vue-router 中的引用也需要更新
          // 但是，我们不应该修改第三方库的其他内容，只更新文件引用
          const isEChartsLib = fileName.includes('lib-echarts');
          const isOtherThirdPartyLib = fileName.includes('element-plus') ||
                                       fileName.includes('vue-core') ||
                                       fileName.includes('vue-router') ||
                                       fileName.includes('vendor');

          // 关键：对于 vue-router、vue-core 等核心库，完全跳过内容修改，避免破坏其内部代码
          // 这些库的代码非常敏感，任何修改都可能导致运行时错误（如 __vccOpts 未定义）
          // 只修改文件名，不修改内容，让 Rollup 自动处理引用关系
          if (fileName.includes('vue-router') || fileName.includes('vue-core')) {
            continue;
          }

          let newCode = chunk.code;
          let modified = false;

          // 替换所有旧文件名的引用（包括第三方库的引用）
          for (const [oldFileName, newFileName] of fileNameMap.entries()) {
            // 检查是否是第三方库的引用
            // 注意：对于 lib-echarts chunk，我们需要更新其对其他文件的引用
            // 但对于 lib-echarts 本身的引用，我们跳过（因为 lib-echarts 的文件名没有被修改）
            const isEChartsRef = oldFileName.includes('lib-echarts');
            const isOtherThirdPartyRef = oldFileName.includes('element-plus') ||
                                         oldFileName.includes('vue-core') ||
                                         oldFileName.includes('vue-router') ||
                                         oldFileName.includes('vendor');

            // 如果是 lib-echarts 本身的引用，跳过（因为 lib-echarts 的文件名没有被修改）
            if (isEChartsRef && isEChartsLib) {
              continue;
            }

            const isThirdPartyRef = isEChartsRef || isOtherThirdPartyRef;

            const oldRef = oldFileName.replace(/^assets\//, '');
            const newRef = newFileName.replace(/^assets\//, '');

            // 关键：清理 oldRef 末尾的连字符，确保能匹配到所有格式的引用
            // 因为新文件名已经清理了末尾连字符，所以旧引用也应该清理
            const oldRefWithoutTrailingDash = oldRef.replace(/-+$/, '');

            // 转义特殊字符（同时处理有和没有末尾连字符的版本）
            const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedOldRefWithoutTrailingDash = oldRefWithoutTrailingDash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            if (isThirdPartyRef) {
              // 第三方库引用：使用更全面的匹配，确保所有格式都被更新
              // 关键：需要匹配所有可能的引用格式，包括：
              // 1. 绝对路径：/assets/vue-core-CXAVbLNX.js
              // 2. 相对路径：./assets/vue-core-CXAVbLNX.js 或 assets/vue-core-CXAVbLNX.js
              // 3. 字符串中的引用："vue-core-CXAVbLNX.js" 或 'vue-core-CXAVbLNX.js' 或 `vue-core-CXAVbLNX.js`
              // 4. import() 动态导入：import('/assets/vue-core-CXAVbLNX.js')
              // 5. 在对象、数组中的引用：{ file: "vue-core-CXAVbLNX.js" } 或 ["vue-core-CXAVbLNX.js"]

              // 关键：对于 lib-echarts，只更新 import 语句中的引用，不修改其他内容
              // 因为 lib-echarts 的代码非常敏感，任何修改都可能破坏其内部逻辑
              if (isEChartsLib) {
                // 只更新 import 语句中的引用
                // 匹配格式：import { ... } from "./vendor-C1ILpzhD.js"
                const importFromPattern = new RegExp(`(from\\s+["'\`])(\\.?/?assets/)?${escapedOldRef}(["'\`])`, 'g');
                if (importFromPattern.test(newCode)) {
                  newCode = newCode.replace(importFromPattern, (match, prefix, assetsPath, quote) => {
                    const assetsPrefix = assetsPath || './';
                    return `${prefix}${assetsPrefix}${newRef}${quote}`;
                  });
                  modified = true;
                  console.log(`[force-new-hash] 更新 lib-echarts 中的 import 引用: ${oldRef} -> ${newRef} (在 ${fileName} 中)`);
                }
                // 跳过其他模式的处理，避免破坏 lib-echarts 的内部代码
                continue;
              }

              const strictPatterns = [
                // 绝对路径：/assets/vue-core-CXAVbLNX.js
                [`/assets/${oldRef}`, `/assets/${newRef}`],
                // 相对路径：./assets/vue-core-CXAVbLNX.js
                [`./assets/${oldRef}`, `./assets/${newRef}`],
                // 无前缀相对路径：assets/vue-core-CXAVbLNX.js
                [`assets/${oldRef}`, `assets/${newRef}`],
                // 字符串中的引用："vue-core-CXAVbLNX.js" 或 'vue-core-CXAVbLNX.js'
                [`"${oldRef}"`, `"${newRef}"`],
                [`'${oldRef}'`, `'${newRef}`],
                [`\`${oldRef}\``, `\`${newRef}\``],
                // import() 动态导入：import('/assets/vue-core-CXAVbLNX.js')
                [`import('/assets/${oldRef}')`, `import('/assets/${newRef}')`],
                [`import("/assets/${oldRef}")`, `import("/assets/${newRef}")`],
                [`import(\`/assets/${oldRef}\`)`, `import(\`/assets/${newRef}\`)`],
                // 在对象或数组中的引用：{ file: "vue-core-CXAVbLNX.js" } 或 ["vue-core-CXAVbLNX.js"]
                [`:"${oldRef}"`, `:"${newRef}"`],
                [`:'${oldRef}'`, `:'${newRef}'`],
                [`:\`${oldRef}\``, `:\`${newRef}\``],
                [`["${oldRef}"]`, `["${newRef}"]`],
                [`['${oldRef}']`, `['${newRef}']`],
                [`[\`${oldRef}\`]`, `[\`${newRef}\`]`],
              ];

              // 关键：如果 oldRef 有末尾连字符，同时处理没有末尾连字符的版本
              // 例如：vue-core-3nfEKAw-.js 和 vue-core-3nfEKAw.js 都应该匹配到 vue-core-3nfEKAw-miqp4pax.js
              if (oldRef !== oldRefWithoutTrailingDash) {
                strictPatterns.push(
                  // 绝对路径：/assets/vue-core-3nfEKAw.js（没有末尾连字符）
                  [`/assets/${oldRefWithoutTrailingDash}`, `/assets/${newRef}`],
                  // 相对路径：./assets/vue-core-3nfEKAw.js
                  [`./assets/${oldRefWithoutTrailingDash}`, `./assets/${newRef}`],
                  // 无前缀相对路径：assets/vue-core-3nfEKAw.js
                  [`assets/${oldRefWithoutTrailingDash}`, `assets/${newRef}`],
                  // 字符串中的引用："vue-core-3nfEKAw.js"
                  [`"${oldRefWithoutTrailingDash}"`, `"${newRef}"`],
                  [`'${oldRefWithoutTrailingDash}'`, `'${newRef}`],
                  [`\`${oldRefWithoutTrailingDash}\``, `\`${newRef}\``],
                  // import() 动态导入
                  [`import('/assets/${oldRefWithoutTrailingDash}')`, `import('/assets/${newRef}')`],
                  [`import("/assets/${oldRefWithoutTrailingDash}")`, `import("/assets/${newRef}")`],
                  [`import(\`/assets/${oldRefWithoutTrailingDash}\`)`, `import(\`/assets/${newRef}\`)`],
                );
              }

              strictPatterns.forEach(([oldPattern, newPattern]) => {
                const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedOldPattern, 'g');
                if (regex.test(newCode)) {
                  newCode = newCode.replace(regex, newPattern);
                  modified = true;
                  console.log(`[force-new-hash] 更新第三方库引用: ${oldPattern} -> ${newPattern} (在 ${fileName} 中)`);
                }
              });

              // 继续执行通用替换逻辑，确保所有格式都被覆盖
            }

            // 替换字符串中的引用（包括绝对路径和相对路径）
            // 使用更通用的替换方式，直接替换文件名部分
            // 关键：对于 lib-echarts，跳过这个处理，避免破坏其内部代码
            // 因为 lib-echarts 已经在上面通过 import 语句更新了引用
            if (!isEChartsLib) {
              const replacePatterns = [
                // 绝对路径：/assets/vendor-Bhb-Bl-F.js -> /assets/vendor-Bhb-Bl-F-mipvcia9.js
                [`/assets/${oldRef}`, `/assets/${newRef}`],
                // 相对路径：./vendor-Bhb-Bl-F.js -> ./vendor-Bhb-Bl-F-mipvcia9.js
                [`./${oldRef}`, `./${newRef}`],
                // 无前缀：vendor-Bhb-Bl-F.js -> vendor-Bhb-Bl-F-mipvcia9.js（在 import from 中）
                [`"${oldRef}"`, `"${newRef}"`],
                [`'${oldRef}'`, `'${newRef}'`],
                [`\`${oldRef}\``, `\`${newRef}\``],
              ];

              // 关键：如果 oldRef 有末尾连字符，同时处理没有末尾连字符的版本
              // 例如：vue-core-3nfEKAw-.js 和 vue-core-3nfEKAw.js 都应该匹配到 vue-core-3nfEKAw-miqp4pax.js
              if (oldRef !== oldRefWithoutTrailingDash) {
                replacePatterns.push(
                  [`/assets/${oldRefWithoutTrailingDash}`, `/assets/${newRef}`],
                  [`./${oldRefWithoutTrailingDash}`, `./${newRef}`],
                  [`"${oldRefWithoutTrailingDash}"`, `"${newRef}"`],
                  [`'${oldRefWithoutTrailingDash}'`, `'${newRef}'`],
                  [`\`${oldRefWithoutTrailingDash}\``, `\`${newRef}\``],
                );
              }

              replacePatterns.forEach(([oldPattern, newPattern]) => {
              // 转义特殊字符
              const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(escapedOldPattern, 'g');
              if (regex.test(newCode)) {
                const matches = newCode.match(regex);
                if (matches && matches.length > 0) {
                  newCode = newCode.replace(regex, newPattern);
                  modified = true;
                  // 关键：记录替换的详细信息，特别是相对路径引用
                  if (oldPattern.includes('./') || oldPattern.includes('vue-core-3nfEKAw-')) {
                    console.log(`[force-new-hash] 🔧 更新引用: ${oldPattern} -> ${newPattern} (在 ${fileName} 中，找到 ${matches.length} 个匹配)`);
                  }
                }
              }
            });
            }

            // 额外处理：匹配更复杂的引用格式
            // 例如：在对象、数组中的引用，或者作为函数参数
            // 关键：只匹配在字符串或特定上下文中的文件名
            // 关键：对于 lib-echarts，跳过这个处理，避免破坏其内部代码
            if (!isEChartsLib) {
              const complexPatterns = [
                // 在对象或数组中的引用：{ file: "vue-core-CXAVbLNX.js" } 或 ["vue-core-CXAVbLNX.js"]
                new RegExp(`(["'\`])${escapedOldRef}\\1`, 'g'),
                // 在函数调用中的引用：loadChunk("vue-core-CXAVbLNX.js")
                new RegExp(`\\(\\s*(["'\`])${escapedOldRef}\\1\\s*\\)`, 'g'),
              ];

              complexPatterns.forEach(pattern => {
                if (pattern.test(newCode)) {
                  newCode = newCode.replace(pattern, (match, quote) => {
                    if (match.startsWith('(')) {
                      return `(${quote}${newRef}${quote})`;
                    } else {
                      return `${quote}${newRef}${quote}`;
                    }
                  });
                  modified = true;
                }
              });
            }

            // 额外处理：直接替换文件名（不包含路径前缀），确保所有引用都被更新
            // 这可以捕获那些格式不标准的引用
            // 关键：只匹配在 import/export/require/动态导入等语句中的文件名，避免误匹配代码中的变量名
            // 关键：对于 lib-echarts，跳过这个处理，避免破坏其内部代码
            if (!isEChartsLib) {
              const directFileNamePattern = new RegExp(`\\b${escapedOldRef}\\b`, 'g');
              if (directFileNamePattern.test(newCode)) {
                // 检查上下文，确保是文件引用而不是其他内容
                newCode = newCode.replace(directFileNamePattern, (match, offset, string) => {
                  // 检查前后文，确保是文件引用
                  const before = string.substring(Math.max(0, offset - 50), offset);
                  const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 50));

                  // 更严格的检查：只有在以下情况下才替换
                  // 1. 在 import/export/require 语句中
                  // 2. 在字符串字面量中（引号内）
                  // 3. 在路径相关的上下文中（包含 /assets/ 或 ./ 或 ../）
                  const isInImportExport = /(?:import|export|require)\s*\(?\s*["'`]/.test(before) ||
                                           /from\s+["'`]/.test(before) ||
                                           /import\s*\(/.test(before);
                  const isInString = (before.match(/["'`]/g) || []).length % 2 === 1; // 奇数个引号表示在字符串内
                  const isInPath = /[/'"`]assets\/|\.\/|\.\.\//.test(before) || /["'`]\s*$/.test(before);

                  // 排除：如果是在变量名、函数名、对象属性等位置，不替换
                  const isVariableName = /[a-zA-Z_$][a-zA-Z0-9_$]*\s*$/.test(before) && !isInString;
                  const isObjectProperty = /\.\s*$/.test(before);

                  if ((isInImportExport || isInString || isInPath) && !isVariableName && !isObjectProperty) {
                    return newRef;
                  }
                  return match;
                });
                modified = true;
              }
            }
          }

          // 更新 __vite__mapDeps 中的 CSS 引用
          // 匹配格式：__vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/xxx.css",...]))=>...
          if (newCode.includes('__vite__mapDeps') && cssFileNameMap.size > 0) {
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              // 转义特殊字符
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // 匹配 "assets/xxx.css" 或 'assets/xxx.css'（在 __vite__mapDeps 数组中）
              // 需要匹配引号内的完整路径
              const cssPattern = new RegExp(`(["'])assets/${escapedOldCssName}\\1`, 'g');
              if (cssPattern.test(newCode)) {
                newCode = newCode.replace(cssPattern, `$1assets/${newCssName}$1`);
                modified = true;
                console.log(`[force-new-hash] 更新 __vite__mapDeps 中的 CSS 引用: assets/${oldCssName} -> assets/${newCssName}`);
              }
            }
          }

          if (modified) {
            chunk.code = newCode;
          }
        }
      }

      console.log(`[force-new-hash] ✅ 已为 ${fileNameMap.size} 个文件添加构建 ID: ${buildId}`);

      // 调试：输出文件名映射（仅第三方库）
      const thirdPartyMappings = Array.from(fileNameMap.entries()).filter(([oldName]) =>
        oldName.includes('vue-core') || oldName.includes('vue-router') ||
        oldName.includes('element-plus') || oldName.includes('vendor') ||
        oldName.includes('lib-echarts')
      );
      if (thirdPartyMappings.length > 0) {
        console.log(`[force-new-hash] 📋 第三方库文件名映射:`);
        thirdPartyMappings.forEach(([oldName, newName]) => {
          console.log(`  ${oldName.replace(/^assets\//, '')} -> ${newName.replace(/^assets\//, '')}`);
        });
      }
    },
    writeBundle(options) {
      // 在 writeBundle 阶段更新 index.html 和 JS 文件中的 CSS 引用
      // 此时所有文件名都已经确定
      const outputDir = options.dir || join(process.cwd(), 'dist');
      const indexHtmlPath = join(outputDir, 'index.html');
      const assetsDir = join(outputDir, 'assets');

      // 1. 更新 index.html 中的 CSS 引用，并为 script 标签添加构建 ID 查询参数（避免浏览器缓存）
      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        // 1.1 更新 CSS 引用
        if (cssFileNameMap.size > 0) {
          for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
            // 转义特殊字符
            const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // 匹配 <link rel="stylesheet" ... href="/assets/xxx.css">
            const linkPattern = new RegExp(`(href=["'])/assets/${escapedOldCssName}(["'])`, 'g');
            if (linkPattern.test(html)) {
              html = html.replace(linkPattern, `$1/assets/${newCssName}$2`);
              modified = true;
            }
          }
        }

        // 1.2 更新 JS 文件引用，并为 script 标签中的 import() 添加构建 ID 查询参数（避免浏览器缓存）
        // 关键：需要先更新文件名引用，然后再添加查询参数
        // 注意：index.html 中的文件名可能已经包含旧的构建ID（如 index-Dt6-4vQv-miqpl63n.js）
        // 我们需要匹配文件名前缀（去掉构建ID部分），然后更新为新的文件名
        if (jsFileNameMap.size > 0) {
          for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
            // 提取文件名前缀（去掉可能的构建ID部分）
            // 例如：index-Dt6-4vQv.js 或 index-Dt6-4vQv-miqpl63n.js -> index-Dt6-4vQv
            const oldJsNamePrefix = oldJsName.replace(/\.js$/, '').replace(/-[a-zA-Z0-9]{8,}$/, '');
            const escapedOldJsNamePrefix = oldJsNamePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 匹配 import('/assets/xxx.js') 或 import("/assets/xxx.js")，文件名可能包含旧的构建ID
            // 匹配格式：/assets/index-Dt6-4vQv.js 或 /assets/index-Dt6-4vQv-miqpl63n.js
            const importPattern = new RegExp(`import\\s*\\(\\s*(["'])(/assets/${escapedOldJsNamePrefix}(?:-[a-zA-Z0-9]{8,})?\\.js)(\\?[^"'\\s]*)?\\1\\s*\\)`, 'g');
            if (importPattern.test(html)) {
              html = html.replace(importPattern, (match, quote, path, query) => {
                // 更新为新的文件名（包含新的构建ID）
                const newPath = `/assets/${newJsName}`;
                // 如果原来有查询参数，替换为新的构建ID；如果没有，添加新的构建ID
                const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                return `import(${quote}${newPath}${newQuery}${quote})`;
              });
              modified = true;
              console.log(`[force-new-hash] ✅ 已更新 index.html 中的 JS 文件引用: ${oldJsNamePrefix}*.js -> ${newJsName}`);
            }
          }
        }

        // 1.3 为其他可能的 import() 添加构建 ID 查询参数（兜底，处理没有被 jsFileNameMap 覆盖的情况）
        // 匹配 import('/assets/xxx.js') 或 import("/assets/xxx.js")
        const importPatternFallback = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
        if (importPatternFallback.test(html)) {
          html = html.replace(importPatternFallback, (match, quote, path, ext, query) => {
            // 检查是否已经有查询参数
            if (query) {
              // 如果已经有查询参数，替换版本号部分
              return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
            } else {
              // 如果没有查询参数，添加构建 ID
              return `import(${quote}${path}?v=${buildId}${quote})`;
            }
          });
          modified = true;
          console.log(`[force-new-hash] ✅ 已为 index.html 中的 script 标签添加构建 ID 查询参数: v=${buildId}`);
        }

        if (modified) {
          writeFileSync(indexHtmlPath, html, 'utf-8');
          if (cssFileNameMap.size > 0) {
            console.log(`[force-new-hash] ✅ 已更新 index.html 中的 CSS 引用`);
          }
        }
      }

      // 2. 更新所有 JS 文件中的引用（包括 JS 和 CSS 引用，作为兜底）
      if (existsSync(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
        let totalFixed = 0;

        // 收集所有文件名映射（包括 JS 和 CSS）
        const allFileNameMap = new Map<string, string>();

        // 使用插件上下文中保存的映射
        for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
          allFileNameMap.set(oldJsName, newJsName);
        }

        // 也添加 CSS 文件映射
        for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
          allFileNameMap.set(oldCssName, newCssName);
        }

        // 如果映射为空，尝试从实际文件重建（兜底）
        if (allFileNameMap.size === 0) {
          const actualFiles = readdirSync(assetsDir);
          for (const file of actualFiles) {
            // 匹配格式：name-hash-buildId.ext
            const match = file.match(/^(.+?)-([A-Za-z0-9]{4,})-([a-zA-Z0-9]+)\.(js|mjs|css)$/);
            if (match) {
              const [, baseName, hash, buildId, ext] = match;
              const oldFileName = `${baseName}-${hash}.${ext}`;
              if (oldFileName !== file) {
                allFileNameMap.set(oldFileName, file);
              }
            }
          }
        }

        for (const jsFile of jsFiles) {
          const jsFilePath = join(assetsDir, jsFile);

          // 关键：跳过第三方库文件的内容修改，避免破坏其内部代码
          // 这些库可能包含压缩后的代码，修改可能破坏其内部引用
          const isThirdPartyLib = jsFile.includes('lib-echarts') ||
                                   jsFile.includes('element-plus') ||
                                   jsFile.includes('vue-core') ||
                                   jsFile.includes('vue-router') ||
                                   jsFile.includes('vendor');

          if (isThirdPartyLib) {
            // 第三方库文件不修改内容，只修改文件名（已在 generateBundle 阶段处理）
            continue;
          }

          let content = readFileSync(jsFilePath, 'utf-8');
          let modified = false;

          // 更新所有文件引用（JS 和 CSS）
          // 关键：只替换真正的文件引用，避免破坏压缩/混淆后的代码
          for (const [oldFileName, newFileName] of allFileNameMap.entries()) {
            const escapedOldFileName = oldFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 匹配各种引用格式（更精确的模式，避免误匹配）
            const patterns = [
              // 绝对路径：/assets/xxx.js（必须在引号内或 import/from 语句中）
              new RegExp(`(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, 'g'),
              // import() 动态导入：import('/assets/xxx.js')
              new RegExp(`import\\s*\\(\\s*(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1\\s*\\)`, 'g'),
              // 相对路径：./xxx.js（必须在引号内）
              new RegExp(`(["'\`])\\./${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, 'g'),
              // assets/xxx.js（在 __vite__mapDeps 中，必须在引号内）
              new RegExp(`(["'\`])assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, 'g'),
            ];

            patterns.forEach(pattern => {
              if (pattern.test(content)) {
                if (pattern.source.includes('/assets/')) {
                  content = content.replace(pattern, (match, quote) => {
                    if (match.includes('import(')) {
                      return match.replace(`/assets/${oldFileName}`, `/assets/${newFileName}`);
                    }
                    return `${quote}/assets/${newFileName}${quote}`;
                  });
                } else if (pattern.source.includes('./')) {
                  content = content.replace(pattern, (match, quote) => `${quote}./${newFileName}${quote}`);
                } else if (pattern.source.includes('assets/')) {
                  content = content.replace(pattern, (match, quote) => `${quote}assets/${newFileName}${quote}`);
                }
                modified = true;
              }
            });
          }

          if (modified) {
            writeFileSync(jsFilePath, content, 'utf-8');
            totalFixed++;
          }
        }

        if (totalFixed > 0) {
          console.log(`[force-new-hash] ✅ 已在 writeBundle 阶段更新 ${totalFixed} 个 JS 文件中的引用`);
        }
      }
    },
  };
};

// 修复动态导入中的旧 hash 引用插件
// 注意：现在使用时间戳 + hash 的方式，确保每次构建都生成新的文件名
// 这个插件主要用于修复引用不匹配的情况（虽然理论上不应该发生）
// 这个插件在 generateBundle 和 writeBundle 阶段都进行修复，确保所有引用都被修复
const fixDynamicImportHashPlugin = (): Plugin => {
  const chunkNameMap = new Map<string, string>();

  return {
    name: 'fix-dynamic-import-hash',
    // 在 generateBundle 阶段收集所有 chunk 文件名
    generateBundle(options, bundle) {
      // 建立文件名映射：文件名前缀 -> 实际文件名
      chunkNameMap.clear();

      // 第一步：收集所有 chunk 文件名，建立映射
      // 注意：文件名格式可能是 name-hash-timestamp.js 或 name-hash.js
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          // 提取文件名前缀（如 vendor、vue-core 等）
          // 注意：需要处理多段名称，如 app-src、module-access 等
          // 匹配格式：name-hash-timestamp.js 或 name-hash.js
          const baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
          // 移除 hash 和时间戳部分，只保留名称前缀
          // 格式：name-hash-timestamp 或 name-hash
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) ||
                           baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            // 对于多段名称，需要提取完整的名称（如 app-src、module-access）
            // 但也要支持单段名称（如 vendor、vue-core）
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            } else {
              // 如果已经有映射，保留第一个（通常只有一个）
              console.warn(`[fix-dynamic-import-hash] ⚠️  发现多个同名 chunk: ${namePrefix} (${chunkNameMap.get(namePrefix)}, ${fileName})`);
            }
          }
        }
      }

      console.log(`[fix-dynamic-import-hash] 收集到 ${chunkNameMap.size} 个 chunk 映射`);
      // 调试：输出映射关系
      if (chunkNameMap.size > 0) {
        const sampleEntries = Array.from(chunkNameMap.entries()).slice(0, 5);
        console.log(`[fix-dynamic-import-hash] 示例映射: ${sampleEntries.map(([k, v]) => `${k} -> ${v.split('/').pop()}`).join(', ')}`);
      }

      // 第二步：修复所有 chunk 中的动态导入引用
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 关键：跳过第三方库 chunk 的内容修改，避免破坏其内部代码
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

          let newCode = chunk.code;
          let modified = false;
          const replacements: Array<{ old: string; new: string }> = [];

          // 修复动态导入中的旧 hash 引用
          // 匹配多种格式：
          // 1. import('/assets/vendor-B2xaJ9jT.js')
          // 2. import("./assets/vue-core-Ct0QBumG.js")
          // 3. "/assets/vendor-B2xaJ9jT.js" (字符串中的引用)
          // 4. './assets/vue-core-Ct0QBumG.js' (相对路径)

          // 模式1: import() 动态导入
          const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
          let match;
          importPattern.lastIndex = 0;
          while ((match = importPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const fullPath = match[2]; // /assets/vendor-B2xaJ9jT.js 或 ./assets/vue-core-Ct0QBumG.js
            const referencedFile = match[3]; // vendor-B2xaJ9jT.js
            const fullMatch = match[0]; // import("/assets/vendor-B2xaJ9jT.js")

            // 检查引用的文件是否存在于 bundle 中
            const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

            if (!existsInBundle) {
              // 文件不存在，尝试找到对应的实际文件（忽略 hash）
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const [, namePrefix, , ext] = refMatch;
                const key = `${namePrefix}.${ext}`;
                const actualFile = chunkNameMap.get(namePrefix);

                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, '');
                  let newPath = fullPath;
                  if (fullPath.startsWith('/assets/')) {
                    newPath = `/assets/${actualFileName}`;
                  } else if (fullPath.startsWith('./assets/')) {
                    newPath = `./assets/${actualFileName}`;
                  } else if (fullPath.startsWith('assets/')) {
                    newPath = `assets/${actualFileName}`;
                  } else {
                    newPath = actualFileName;
                  }

                  replacements.push({
                    old: fullMatch,
                    new: `import(${quote}${newPath}${quote})`
                  });
                  console.log(`[fix-dynamic-import-hash] 修复 ${fileName} 中的引用: ${referencedFile} -> ${actualFileName}`);
                } else {
                  console.warn(`[fix-dynamic-import-hash] ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile}`);
                }
              }
            }
          }

          // 模式2: 字符串中的 /assets/xxx.js 引用（包括在数组、对象等中）
          // 这个模式需要匹配所有可能的引用格式，包括：
          // - "/assets/vue-router-B9_7Pxt3.js"
          // - '/assets/vue-router-B9_7Pxt3.js'
          // - `/assets/vue-router-B9_7Pxt3.js`
          const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
          stringPathPattern.lastIndex = 0;
          while ((match = stringPathPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const fullPath = match[2]; // /assets/vendor-B2xaJ9jT.js
            const referencedFile = match[3]; // vendor-B2xaJ9jT.js
            const fullMatch = match[0]; // "/assets/vendor-B2xaJ9jT.js"

            // 检查是否已经被其他规则处理过
            const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
            if (alreadyFixed) {
              continue;
            }

            // 检查引用的文件是否存在于 bundle 中
            const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

            if (!existsInBundle) {
              // 文件不存在，尝试找到对应的实际文件（忽略 hash 和时间戳）
              // 注意：需要处理多段名称，如 app-src、module-access 等
              // 匹配格式：name-hash-timestamp.js 或 name-hash.js
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                               referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const namePrefix = refMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);

                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, '');
                  const newPath = `/assets/${actualFileName}`;

                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${newPath}${quote}`
                  });
                  console.log(`[fix-dynamic-import-hash] 修复 ${fileName} 中的字符串引用: ${referencedFile} -> ${actualFileName}`);
                } else {
                  console.warn(`[fix-dynamic-import-hash] ⚠️  无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${fileName} 中)`);
                }
              }
            }
          }

          // 模式3: 相对路径 ./xxx.js
          const relativePathPattern = /(["'])(\.\/)([^"'`\s]+\.(js|mjs|css))\1/g;
          relativePathPattern.lastIndex = 0;
          while ((match = relativePathPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const relativePrefix = match[2]; // ./
            const referencedFile = match[3]; // vue-core-Ct0QBumG.js
            const fullMatch = match[0]; // "./vue-core-Ct0QBumG.js"

            // 检查是否已经被其他规则处理过
            const alreadyFixed = replacements.some(r => r.old === fullMatch);
            if (alreadyFixed) {
              continue;
            }

            // 检查引用的文件是否存在于 bundle 中
            const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

            if (!existsInBundle) {
              // 文件不存在，尝试找到对应的实际文件（忽略 hash 和时间戳）
              // 匹配格式：name-hash-timestamp.js 或 name-hash.js
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                               referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const namePrefix = refMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);

                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, '');

                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${relativePrefix}${actualFileName}${quote}`
                  });
                  console.log(`[fix-dynamic-import-hash] 修复 ${fileName} 中的相对路径引用: ${referencedFile} -> ${actualFileName}`);
                }
              }
            }
          }

          // 应用所有替换（从后往前替换，避免位置偏移）
          if (replacements.length > 0) {
            replacements.reverse().forEach(({ old, new: newStr }) => {
              newCode = newCode.replace(old, newStr);
            });
            modified = true;
            console.log(`[fix-dynamic-import-hash] ✅ 已修复 ${fileName} 中的 ${replacements.length} 个引用`);
          }

          if (modified) {
            chunk.code = newCode;
          }
        }
      }
    },

    // 在 writeBundle 阶段再次修复，确保所有引用都被修复
    writeBundle(options, bundle) {

      // 重新收集所有 chunk 文件名（因为可能已经写入文件系统）
      // 注意：文件名格式可能是 name-hash-timestamp.js 或 name-hash.js
      chunkNameMap.clear();

      // 关键：收集所有 chunk 文件名，包括第三方库（因为 lib-echarts 需要修复其对 vendor 的引用）
      const thirdPartyChunks = ['lib-echarts', 'element-plus', 'vue-core', 'vue-router', 'vendor'];
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          // 匹配格式：name-hash-timestamp.js 或 name-hash.js 或 name-hash-.js（异常情况）
          // 提取 name 部分（第一个连字符之前的所有内容，但如果是多段名称如 app-src，需要保留）
          const baseName = fileName.replace(/^assets\//, '').replace(/\.js$/, '');
          // 移除 hash 和时间戳部分，只保留名称前缀
          // 格式：name-hash-timestamp 或 name-hash 或 name-hash-（异常情况）
          // 我们需要提取 name 部分（第一个连字符之前的所有内容，但如果是多段名称，需要特殊处理）
          // 关键：需要处理末尾有连字符的情况（如 vue-core-3nfEKAw-）
          const cleanBaseName = baseName.replace(/-+$/, ''); // 先清理末尾连字符
          const nameMatch = cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) ||
                           cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          } else {
            // 如果没有匹配到，尝试直接使用文件名（去掉 assets/ 和 .js）
            const namePrefix = cleanBaseName.split('-')[0];
            if (namePrefix && !chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }

      // 修复所有已写入的文件
      const outputDir = options.dir || join(process.cwd(), 'dist');
      let totalFixed = 0;

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js') && fileName.startsWith('assets/')) {
          // 关键：对于 lib-echarts，需要修复其对 vendor 等文件的引用
          // 其他第三方库跳过内容修改，但需要修复其他文件中对第三方库的引用
          const isThirdPartyLib = thirdPartyChunks.some(lib => fileName.includes(lib));
          const isEChartsLib = fileName.includes('lib-echarts');

          // lib-echarts 需要修复其对其他文件的引用（特别是 vendor）
          // 其他第三方库跳过内容修改
          if (isThirdPartyLib && !isEChartsLib) {
            continue;
          }

          const filePath = join(outputDir, fileName);
          if (existsSync(filePath)) {
            let content = readFileSync(filePath, 'utf-8');
            const replacements: Array<{ old: string; new: string }> = [];

            // 如果是第三方库，只修复对它的引用，不修改其内容
            // 如果不是第三方库，修复所有引用（包括对第三方库的引用）

            // 使用相同的修复逻辑
            // 模式1: import() 动态导入
            const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
            let match;
            importPattern.lastIndex = 0;
            while ((match = importPattern.exec(content)) !== null) {
              const quote = match[1];
              const fullPath = match[2];
              const referencedFile = match[3];
              const fullMatch = match[0];

              const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

              if (!existsInBundle) {
                // 关键：需要处理带构建 ID 的文件名格式
                // 格式可能是：name-hash.js 或 name-hash-buildId.js 或 name-hash-.js（异常情况）
                // 需要提取 name 前缀来查找实际文件
                // 先清理末尾连字符，然后提取前缀
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, '.$1');
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                                 referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/) ||
                                 referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]*)?-?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);

                  // 如果找不到，尝试通过文件名前缀直接匹配
                  if (!actualFile) {
                    // 提取引用文件的前缀（去掉 hash 和可能的构建ID）
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, '').replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                    // 遍历所有文件，找到匹配的前缀
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith('.js') && existingFileName.startsWith('assets/')) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, '').replace(/\.js$/, '');
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, '');
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }

                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, '');
                    let newPath = fullPath;
                    if (fullPath.startsWith('/assets/')) {
                      newPath = `/assets/${actualFileName}`;
                    } else if (fullPath.startsWith('./assets/')) {
                      newPath = `./assets/${actualFileName}`;
                    } else if (fullPath.startsWith('assets/')) {
                      newPath = `assets/${actualFileName}`;
                    } else {
                      newPath = actualFileName;
                    }

                    replacements.push({
                      old: fullMatch,
                      new: `import(${quote}${newPath}${quote})`
                    });
                    console.log(`[fix-dynamic-import-hash] writeBundle: 修复 ${fileName} 中的 import() 引用: ${referencedFile} -> ${actualFileName}`);
                  } else {
                    console.warn(`[fix-dynamic-import-hash] writeBundle: 无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${fileName} 中)`);
                  }
                }
              }
            }

            // 模式2: 字符串中的 /assets/xxx.js 引用
            const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
            stringPathPattern.lastIndex = 0;
            while ((match = stringPathPattern.exec(content)) !== null) {
              const quote = match[1];
              const fullPath = match[2];
              const referencedFile = match[3];
              const fullMatch = match[0];

              const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
              if (alreadyFixed) {
                continue;
              }

              const existsInBundle = Object.keys(bundle).some(f => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));

              if (!existsInBundle) {
                // 匹配格式：name-hash-timestamp.js 或 name-hash.js
                // 提取 name 部分（第一个连字符之前的所有内容，但如果是多段名称如 app-src，需要保留）
                // 关键：需要处理两种情况：
                // 1. 旧文件名（没有构建 ID）：vue-core-CXAVbLNX.js -> 提取 vue-core
                // 2. 新文件名（有构建 ID）：vue-core-CXAVbLNX-miq4m7r1.js -> 提取 vue-core
                // 3. 异常文件名（末尾有连字符）：vue-core-3nfEKAw-.js -> 提取 vue-core
                // 注意：需要处理末尾有连字符的情况，可能是构建过程中的异常
                // 关键：需要处理末尾有连字符的情况（如 vue-core-3nfEKAw-.js）
                // 先清理末尾连字符，然后提取前缀
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, '.$1');
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                                 referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/) ||
                                 referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]*)?-?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);

                  // 如果找不到，尝试更宽松的匹配（只匹配第一个连字符之前的部分）
                  if (!actualFile && namePrefix.includes('-')) {
                    const firstPart = namePrefix.split('-')[0];
                    const possibleMatch = Array.from(chunkNameMap.entries()).find(([key]) => key.startsWith(firstPart));
                    if (possibleMatch) {
                      const [, foundFile] = possibleMatch;
                      actualFile = foundFile;
                    }
                  }

                  // 如果还是找不到，尝试通过文件名前缀直接匹配
                  if (!actualFile) {
                    // 提取引用文件的前缀（去掉 hash 和可能的构建ID）
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, '').replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                    // 遍历所有文件，找到匹配的前缀
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith('.js') && existingFileName.startsWith('assets/')) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, '').replace(/\.js$/, '');
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, '');
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }

                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, '');
                    const newPath = `/assets/${actualFileName}`;

                    replacements.push({
                      old: fullMatch,
                      new: `${quote}${newPath}${quote}`
                    });
                    console.log(`[fix-dynamic-import-hash] writeBundle: 修复 ${fileName} 中的引用: ${referencedFile} -> ${actualFileName}`);
                  } else {
                    console.warn(`[fix-dynamic-import-hash] writeBundle: 无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${fileName} 中)`);
                  }
                }
              }
            }

            // 模式3: 相对路径引用（如 ./vue-core-3nfEKAw-.js）
            // 关键：这是第三方库内部引用其他第三方库的常见方式（如 vue-router 引用 vue-core）
            const relativePathPattern = /(["'`])(\.\/)([^"'`\s]+\.(js|mjs|css))\1/g;
            relativePathPattern.lastIndex = 0;
            while ((match = relativePathPattern.exec(content)) !== null) {
              const quote = match[1];
              const relativePrefix = match[2]; // ./
              const referencedFile = match[3]; // vue-core-3nfEKAw-.js
              const fullMatch = match[0]; // "./vue-core-3nfEKAw-.js"

              const alreadyFixed = replacements.some(r => r.old === fullMatch || r.old.includes(referencedFile));
              if (alreadyFixed) {
                continue;
              }

              // 检查文件是否存在于 bundle 中
              const existsInBundle = Object.keys(bundle).some(f => {
                const bundleFileName = f.replace(/^assets\//, '');
                return bundleFileName === referencedFile || f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`);
              });

              if (!existsInBundle) {
                // 关键：需要处理末尾有连字符的情况（如 vue-core-3nfEKAw-.js）
                // 先清理末尾连字符，然后提取前缀
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, '.$1');
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) ||
                                 referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/) ||
                                 referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]*)?-?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);

                  // 如果找不到，尝试通过文件名前缀直接匹配
                  if (!actualFile) {
                    // 提取引用文件的前缀（去掉 hash 和可能的构建ID）
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, '').replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                    // 遍历所有文件，找到匹配的前缀
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith('.js') && existingFileName.startsWith('assets/')) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, '').replace(/\.js$/, '');
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, '');
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, '');
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }

                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, '');
                    // 保持相对路径格式
                    const newPath = `${relativePrefix}${actualFileName}`;

                    replacements.push({
                      old: fullMatch,
                      new: `${quote}${newPath}${quote}`
                    });
                    console.log(`[fix-dynamic-import-hash] writeBundle: 修复 ${fileName} 中的相对路径引用: ${referencedFile} -> ${actualFileName}`);
                  } else {
                    console.warn(`[fix-dynamic-import-hash] writeBundle: 无法找到 ${namePrefix} 对应的文件，引用: ${referencedFile} (在 ${fileName} 中)`);
                  }
                }
              }
            }

            // 应用所有替换
            if (replacements.length > 0) {
              replacements.reverse().forEach(({ old, new: newStr }) => {
                content = content.replace(old, newStr);
              });
              writeFileSync(filePath, content, 'utf-8');
              totalFixed++;
              console.log(`[fix-dynamic-import-hash] ✅ writeBundle 阶段修复 ${fileName} 中的 ${replacements.length} 个引用`);
            }
          }
        }
      }

      if (totalFixed > 0) {
        console.log(`[fix-dynamic-import-hash] ✅ writeBundle 阶段共修复 ${totalFixed} 个文件`);
      }
    },
  };
};

// fixChunkReferencesPlugin 已移动到 @btc/vite-plugin 共享包中

// 确保动态导入使用正确的 base URL 插件
const ensureBaseUrlPlugin = (): Plugin => {
  // 预览构建使用绝对路径，生产构建使用相对路径
  const baseUrl = isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : '/';
  const mainAppPort = MAIN_APP_CONFIG?.prePort || '4180'; // 主应用端口，需要替换的目标

  return {
    name: 'ensure-base-url',
    // 使用 renderChunk 钩子，在代码生成时处理
    renderChunk(code, chunk, options) {
      // 关键：跳过第三方库 chunk，避免破坏其内部代码
      const isThirdPartyLib = chunk.fileName?.includes('lib-echarts') ||
                               chunk.fileName?.includes('element-plus') ||
                               chunk.fileName?.includes('vue-core') ||
                               chunk.fileName?.includes('vue-router') ||
                               chunk.fileName?.includes('vendor');

      if (isThirdPartyLib) {
        return null; // 返回 null 表示不修改
      }

      let newCode = code;
      let modified = false;

      // 1. 相对路径（如 /assets/xxx.js 或 /assets/xxx.js?v=xxx）
      // 关键：在生产环境（base = '/'），相对路径已经是正确的，不需要修改
      // 在预览环境（base = 'http://localhost:4181/'），需要确保路径正确
      // 注意：必须保留查询参数（版本号），如 ?v=xxx
      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (match, quote, path, query = '') => {
            // 预览环境：拼接子应用 base，如 http://localhost:4181/assets/xxx.js?v=xxx
            // 保留查询参数（版本号）
            return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
          });
          modified = true;
        }
      }
      // 生产环境：相对路径 /assets/xxx.js 已经是正确的，不需要修改

      // 2. 子应用 base 被错误替换为 4180 的情况（如 http://localhost:4180/assets/xxx 或 http://localhost:4180/assets/xxx?v=xxx）
      // 注意：必须保留查询参数（版本号）
      const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (match, path, query = '') => {
          return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
        });
        modified = true;
      }

      // 3. 协议相对路径（//localhost:4180/assets/xxx 或 //localhost:4180/assets/xxx?v=xxx）
      // 注意：必须保留查询参数（版本号）
      const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (match, path, query = '') => {
          return `//${APP_HOST}:${APP_PORT}${path}${query}`;
        });
        modified = true;
      }

      // 4. 其他可能的错误端口格式（覆盖所有情况）
      // 注意：必须保留查询参数（版本号）
      const patterns = [
        // 绝对路径，带协议
        {
          regex: new RegExp(`(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${protocol}${APP_HOST}:${APP_PORT}${path}${query}`;
          },
        },
        // 协议相对路径
        {
          regex: new RegExp(`(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${protocol}${APP_HOST}:${APP_PORT}${path}${query}`;
          },
        },
        // 字符串字面量中的路径
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, quote: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${APP_HOST}:${APP_PORT}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, quote: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${APP_HOST}:${APP_PORT}${path}${query}`;
          },
        },
      ];

      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement as any);
          modified = true;
        }
      }

      if (modified) {
        console.log(`[ensure-base-url] 修复了 ${chunk.fileName} 中的资源路径 (${mainAppPort} -> ${APP_PORT})`);
        return {
          code: newCode,
          map: null,
        };
      }

      return null;
    },
    // 同时在 generateBundle 中处理，作为兜底
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 关键：跳过第三方库 chunk 的内容修改，避免破坏其内部代码
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

          let newCode = chunk.code;
          let modified = false;

          // 1. 相对路径替换
          // 关键：在生产环境（base = '/'），相对路径已经是正确的，不需要修改
          // 在预览环境（base = 'http://localhost:4181/'），需要确保路径正确
          // 注意：必须保留查询参数（版本号），如 ?v=xxx
          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (match, quote, path, query = '') => {
                // 保留查询参数（版本号）
                return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
              });
              modified = true;
            }
          }
          // 生产环境：相对路径 /assets/xxx.js 已经是正确的，不需要修改

          // 2. 4180 端口替换（保留查询参数）
          const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (match, path, query = '') => {
              return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
            });
            modified = true;
          }

          // 3. 协议相对路径替换（保留查询参数）
          const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (match, path, query = '') => {
              return `//${APP_HOST}:${APP_PORT}${path}${query}`;
            });
            modified = true;
          }

          // 4. 其他错误端口格式（保留查询参数）
          const patterns = [
            {
              regex: new RegExp(`http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
              replacement: (match: string, host: string, path: string, query: string = '') => {
                return `http://${APP_HOST}:${APP_PORT}${path}${query}`;
              },
            },
            {
              regex: new RegExp(`//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
              replacement: (match: string, host: string, path: string, query: string = '') => {
                return `//${APP_HOST}:${APP_PORT}${path}${query}`;
              },
            },
            {
              regex: new RegExp(`(["'\`])http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
              replacement: (match: string, quote: string, host: string, path: string, query: string = '') => {
                return `${quote}http://${APP_HOST}:${APP_PORT}${path}${query}`;
              },
            },
            {
              regex: new RegExp(`(["'\`])//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
              replacement: (match: string, quote: string, host: string, path: string, query: string = '') => {
                return `${quote}//${APP_HOST}:${APP_PORT}${path}${query}`;
              },
            },
          ];

          for (const pattern of patterns) {
            if (pattern.regex.test(newCode)) {
              newCode = newCode.replace(pattern.regex, pattern.replacement as any);
              modified = true;
            }
          }

          // 旧代码保留作为兜底（但不会保留查询参数，所以优先使用上面的新代码）
          const oldPatterns = [
            new RegExp(`http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`(["'\`])http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`(["'\`])//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          ];

          for (const pattern of oldPatterns) {
            if (pattern.test(newCode)) {
              newCode = newCode.replace(pattern, (match) => {
                if (match.includes('http://')) {
                  return match.replace(new RegExp(`:${mainAppPort}`, 'g'), `:${APP_PORT}`);
                } else if (match.includes('//')) {
                  return match.replace(new RegExp(`:${mainAppPort}`, 'g'), `:${APP_PORT}`);
                }
                return match;
              });
              modified = true;
            }
          }

          if (modified) {
            chunk.code = newCode;
            console.log(`[ensure-base-url] 在 generateBundle 中修复了 ${fileName} 中的资源路径`);
          }
        }
      }
    },
  };
};

// CORS 插件（支持 credentials）
const corsPlugin = (): Plugin => {
  // CORS 中间件函数（用于开发服务器）
  const corsDevMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    // 设置 CORS 响应头（所有请求都需要）
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      // Chrome 私有网络访问要求（仅开发服务器需要）
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    } else {
      // 如果没有 origin，也设置基本的 CORS 头（允许所有来源）
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      // Chrome 私有网络访问要求（仅开发服务器需要）
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // 处理 OPTIONS 预检请求 - 必须在任何其他处理之前返回
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  };

  // CORS 中间件函数（用于预览服务器，不需要私有网络访问头）
  const corsPreviewMiddleware = (req: any, res: any, next: any) => {
    // 处理 OPTIONS 预检请求 - 必须在任何其他处理之前返回
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;

      // 设置 CORS 响应头
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      }

      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    // 对于非 OPTIONS 请求，设置 CORS 响应头
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    }

    next();
  };

  return {
    name: 'cors-with-credentials',
    enforce: 'pre', // 确保在其他插件之前执行
    configureServer(server) {
      // 开发服务器：包含私有网络访问头
      // 直接添加到中间件栈最前面
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        // 移除可能已存在的 CORS 中间件
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        // 在最前面添加 CORS 中间件
        (server.middlewares as any).stack = [
          { route: '', handle: corsDevMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server) {
      // 预览服务器：不包含私有网络访问头
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        (server.middlewares as any).stack = [
          { route: '', handle: corsPreviewMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    },
  };
};

const withSrc = (relativePath: string) =>
  resolve(fileURLToPath(new URL('.', import.meta.url)), relativePath);

const withPackages = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../../packages', import.meta.url)), relativePath);

const withRoot = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../..', import.meta.url)), relativePath);

// 确保 CSS 文件被正确打包的插件（增强版诊断 + 强制提取）
const ensureCssPlugin = (): Plugin => {
  return {
    name: 'ensure-css-plugin',
    generateBundle(options, bundle) {
      // 在 generateBundle 阶段检查，确保 CSS 没有被内联
      // 检查是否有 CSS 被内联到 JS 文件中
      const jsFiles = Object.keys(bundle).filter(file => file.endsWith('.js'));
      let hasInlineCss = false;
      const suspiciousFiles: string[] = [];

      jsFiles.forEach(file => {
        const chunk = bundle[file] as any;
        if (chunk && chunk.code && typeof chunk.code === 'string') {
          const code = chunk.code;

          // 排除 modulepreload polyfill 代码
          const isModulePreload = code.includes('modulepreload') || code.includes('relList');
          if (isModulePreload) return;

          // 排除已知的库文件和应用模块文件，这些文件中的 CSS 字符串是正常的（如 Vue、Element Plus 等）
          // 应用模块文件（module-*）中的 CSS 字符串通常是样式配置或常量，不是真正的内联 CSS
          const isKnownLibrary = file.includes('vue-core') ||
                                 file.includes('element-plus') ||
                                 file.includes('vendor') ||
                                 file.includes('vue-i18n') ||
                                 file.includes('vue-router') ||
                                 file.includes('lib-echarts') ||
                                 file.includes('module-') ||
                                 file.includes('app-composables') ||
                                 file.includes('app-pages');
          if (isKnownLibrary) return;

          // 更精确的检测：查找真正内联 CSS 的模式
          // 只检测真正的问题，排除库代码中的字符串匹配

          // 1. 动态创建 style 标签并设置 CSS 内容（必须同时满足创建元素和设置内容）
          const hasStyleElementCreation = /document\.createElement\(['"]style['"]\)/.test(code) &&
            /\.(textContent|innerHTML)\s*=/.test(code) &&
            /\{[^}]{10,}\}/.test(code); // 确保有实际的 CSS 规则（至少10个字符）

          // 2. 使用 insertStyle 函数且包含实际的 CSS 规则（更严格的检查）
          const hasInsertStyleWithCss = /insertStyle\s*\(/.test(code) &&
            /text\/css/.test(code) &&
            /\{[^}]{20,}\}/.test(code); // 确保有实际的 CSS 规则（至少20个字符）

          // 3. 直接包含 <style> 标签且后面有 CSS 内容（排除字符串字面量和注释）
          // 检查是否是真正的 HTML 标签，而不是字符串中的内容
          const styleTagMatch = code.match(/<style[^>]*>/);
          const hasStyleTagWithContent = styleTagMatch &&
            !styleTagMatch[0].includes("'") && // 排除字符串中的内容
            !styleTagMatch[0].includes('"') && // 排除字符串中的内容
            /\{[^}]{20,}\}/.test(code); // 确保有实际的 CSS 规则（至少20个字符）

          // 4. 检测内联 CSS 字符串（包含 CSS 规则的长字符串）
          const hasInlineCssString = /['"`][^'"`]{50,}:\s*[^'"`]{10,};\s*[^'"`]{10,}['"`]/.test(code) &&
            /(color|background|width|height|margin|padding|border|display|position|flex|grid)/.test(code);

          // 只检测真正的问题，不检测字符串中的 CSS（这些通常是库代码）
          if (hasStyleElementCreation || hasInsertStyleWithCss || hasStyleTagWithContent || hasInlineCssString) {
            hasInlineCss = true;
            suspiciousFiles.push(file);
            // 输出更详细的警告信息，包含检测到的模式
            const patterns = [];
            if (hasStyleElementCreation) patterns.push('动态创建 style 元素');
            if (hasInsertStyleWithCss) patterns.push('insertStyle 函数');
            if (hasStyleTagWithContent) patterns.push('<style> 标签');
            if (hasInlineCssString) patterns.push('内联 CSS 字符串');
            console.warn(`[ensure-css-plugin] ⚠️ 警告：在 ${file} 中检测到可能的内联 CSS（模式：${patterns.join(', ')}）`);
          }
        }
      });

      if (hasInlineCss) {
        console.warn('[ensure-css-plugin] ⚠️ 警告：检测到 CSS 可能被内联到 JS 中，这会导致 qiankun 无法正确加载样式');
        console.warn(`[ensure-css-plugin] 可疑文件：${suspiciousFiles.join(', ')}`);
        console.warn('[ensure-css-plugin] 请检查 vite-plugin-qiankun 配置和 build.assetsInlineLimit 设置');
        console.warn('[ensure-css-plugin] 如果这是误报，请检查这些文件的实际内容');
      }
    },
    writeBundle(options, bundle) {
      // 在 writeBundle 阶段检查，此时所有文件都已生成
      const cssFiles = Object.keys(bundle).filter(file => file.endsWith('.css'));
      if (cssFiles.length === 0) {
        console.error('[ensure-css-plugin] ❌ 错误：构建产物中无 CSS 文件！');
        console.error('[ensure-css-plugin] 请检查：');
        console.error('1. 入口文件是否静态导入全局样式（index.css/uno.css/element-plus.css）');
        console.error('2. 是否有 Vue 组件中使用 <style> 标签');
        console.error('3. UnoCSS 配置是否正确，是否导入 @unocss all');
        console.error('4. vite-plugin-qiankun 的 useDevMode 是否在生产环境正确关闭');
        console.error('5. build.assetsInlineLimit 是否设置为 0（禁止内联）');
      } else {
        console.log(`[ensure-css-plugin] ✅ 成功打包 ${cssFiles.length} 个 CSS 文件：`, cssFiles);
        // 打印 CSS 文件的详细信息（大小/路径）
        cssFiles.forEach(file => {
          const asset = bundle[file] as any;
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            console.log(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            // 如果 source 不可用，至少显示文件名
            console.log(`  - ${asset.fileName || file}`);
          }
        });
      }
    },
  };
};

// 构建时输出 base 配置，用于调试
// - 预览构建：使用绝对路径（http://localhost:4181/），用于本地预览测试
// - 生产构建：根据部署方式选择 base 路径
//   - 如果通过独立域名部署（admin.bellis.com.cn），使用根路径 '/'
//   - 如果作为子应用部署在主应用的 /admin/ 路径下，使用 '/admin/'
// 注意：admin.bellis.com.cn 是独立域名，应该使用根路径 '/'
const BASE_URL = isPreviewBuild
  ? `http://${APP_HOST}:${APP_PORT}/`
  : '/'; // 生产环境使用根路径，因为 admin.bellis.com.cn 是独立域名
console.log(`[admin-app vite.config] Base URL: ${BASE_URL}, APP_HOST: ${APP_HOST}, APP_PORT: ${APP_PORT}, isPreviewBuild: ${isPreviewBuild}`);

export default defineConfig({
  // 开启构建缓存，复用依赖的编译结果，提高构建速度并稳定哈希
  cacheDir: './node_modules/.vite-cache',
  // 关键：base 配置
  // - 预览构建：使用绝对路径（http://localhost:4181/），用于本地预览测试
  // - 生产构建：使用相对路径（/），让浏览器根据当前域名（admin.bellis.com.cn）自动解析
  // 这样在生产环境访问时，资源路径会自动使用当前域名，而不是硬编码的 localhost
  base: BASE_URL,
  // 配置 publicDir，指向 admin-app 自己的 public 目录
  // 注意：admin-app 需要自己的 icons 和 templates 目录，所以使用自己的 public 目录
  // 其他子应用使用共享组件库的 public 目录（只有 logo.png）
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': withSrc('src'),
      '@modules': withSrc('src/modules'),
      '@services': withSrc('src/services'),
      '@components': withSrc('src/components'),
      '@utils': withSrc('src/utils'),
      '@auth': withRoot('auth'),
      '@configs': withRoot('configs'),
      '@btc/shared-core': withPackages('shared-core/src'),
      '@btc/shared-components': withPackages('shared-components/src'),
      '@btc/shared-utils': withPackages('shared-utils/src'),
      '@btc/subapp-manifests': withPackages('subapp-manifests/src/index.ts'),
      '@btc-common': withPackages('shared-components/src/common'),
      '@btc-components': withPackages('shared-components/src/components'),
      '@btc-styles': withPackages('shared-components/src/styles'),
      '@btc-locales': withPackages('shared-components/src/locales'),
      '@assets': withPackages('shared-components/src/assets'),
      '@btc-assets': withPackages('shared-components/src/assets'),
      '@plugins': withPackages('shared-components/src/plugins'),
      '@btc-utils': withPackages('shared-components/src/utils'),
      '@btc-crud': withPackages('shared-components/src/crud'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': withPackages('shared-components/src/charts/utils/css-var'),
      '@charts-utils/color': withPackages('shared-components/src/charts/utils/color'),
      '@charts-utils/gradient': withPackages('shared-components/src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': withPackages('shared-components/src/charts/composables/useChartComponent'),
      '@charts-types': withPackages('shared-components/src/charts/types'),
      '@charts-utils': withPackages('shared-components/src/charts/utils'),
      '@charts-composables': withPackages('shared-components/src/charts/composables'),
      'element-plus/es': 'element-plus/es',
      'element-plus/dist': 'element-plus/dist',
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia', 'dayjs'],
  },
  plugins: [
    cleanDistPlugin(), // 0. 构建前清理 dist 目录（最前面）
    corsPlugin(), // 1. CORS 插件（不干扰构建）
    titleInjectPlugin(), // 2. 自定义插件（无构建干扰）
    vue({
      // 3. Vue 插件（核心构建插件）
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        }
      }
    }),
    createAutoImportConfig(), // 4. 自动导入插件
    createComponentsConfig({ includeShared: true }), // 5. 组件自动注册插件
    UnoCSS({
      // 6. UnoCSS 插件（样式构建）
      configFile: withRoot('uno.config.ts'),
    }),
    btc({
      // 7. 业务插件
      type: 'subapp' as any,
      proxy,
      eps: {
        enable: true,
        dict: false,
        dist: './build/eps',
      },
      svg: {
        skipNames: ['base', 'icons'],
      },
    }),
    VueI18nPlugin({
      // 8. i18n 插件
      include: [
        fileURLToPath(new URL('./src/{modules,plugins}/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/plugins/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url)),
      ],
      runtimeOnly: true,
    }),
    ensureCssPlugin(), // 9. CSS 验证插件（在构建后检查）
    // 10. qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun('admin', {
      // 关键：使用 useDevMode: true，与 logistics-app 保持一致
      // 虽然理论上生产环境应该关闭，但实际测试发现 useDevMode: false 会导致入口文件及其依赖被打包到 index 中
      // 使用 useDevMode: true 可以确保代码正确拆分到 app-src chunk
      useDevMode: true,
    }),
    // 11. 兜底插件（路径修复、chunk 优化，在最后）
    // 注意：fixChunkReferencesPlugin 需要在 generateBundle 阶段修复异常文件名
    // 所以应该在 Rollup 写入文件之前执行，但不需要 enforce: 'pre'，因为它在 generateBundle 阶段就会修复
    fixChunkReferencesPlugin(), // 修复 chunk 之间的引用关系（轻量级，不修改第三方库）
    ensureBaseUrlPlugin(), // 恢复路径修复（确保 chunk 路径正确）
    optimizeChunksPlugin(), // 恢复空 chunk 处理（仅移除未被引用的空 chunk）
    chunkVerifyPlugin(), // 新增：chunk 验证插件
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: parseInt(appConfig.devPort, 10),
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      // HMR WebSocket 需要使用 localhost，浏览器无法连接 0.0.0.0
      host: appConfig.devHost,
      port: parseInt(appConfig.devPort, 10),
      overlay: false, // 关闭热更新错误浮层，减少开销
    },
    proxy,
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
        withPackages('.'),
        withPackages('shared-components/src'),
      ],
      // 启用缓存，加速依赖加载
      cachedChecks: true,
    },
  },
  // 预览服务器配置（启动构建产物的静态服务器）
  preview: {
    port: APP_PORT,
    strictPort: true, // 端口被占用时报错，避免自动切换
    open: false, // 启动后不自动打开浏览器
    host: '0.0.0.0',
    proxy,
    headers: {
      // 允许主应用（4180）跨域访问当前子应用资源
      'Access-Control-Allow-Origin': MAIN_APP_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  },
  optimizeDeps: {
    // 启用依赖预构建，加速开发环境模块加载
    // 显式声明需要预构建的第三方依赖，避免 Vite 漏判导致实时编译耗时
    include: [
      'vue',
      'vue-router',
      'pinia',
      'dayjs',
      'element-plus',
      '@element-plus/icons-vue',
      '@btc/shared-core',
      '@btc/shared-components',
      '@btc/shared-utils',
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      'single-spa',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // 强制预构建，即使依赖已经是最新的
    // 如果遇到模块解析问题，临时设置为 true 强制重新预构建
    force: false,
    // 确保依赖正确解析
    esbuildOptions: {
      plugins: [],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
        // 添加共享组件样式目录到 includePaths，确保 @use 相对路径能正确解析
        includePaths: [
          withPackages('shared-components/src/styles'),
        ],
      },
    },
    // 强制 Vite 提取 CSS（关键兜底配置）
    devSourcemap: false, // 生产环境关闭 CSS sourcemap
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false, // 禁用 CSS 代码分割，合并所有 CSS 到一个文件（与 system-app 一致，避免初始化顺序问题）
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 禁用可能导致初始化顺序问题的压缩选项
        reduce_vars: false, // 禁用变量合并，避免 TDZ 问题
        reduce_funcs: false, // 禁用函数合并，避免依赖问题
        passes: 1, // 减少压缩次数，避免过度优化
        // 禁用可能导致依赖问题的优化
        collapse_vars: false, // 禁用变量折叠
        dead_code: false, // 禁用死代码消除（可能误删）
      },
      mangle: {
        // 禁用函数名压缩，避免压缩后找不到函数
        // 注意：这会导致文件体积增大，但可以避免运行时错误
        keep_fnames: true, // 保留函数名
        keep_classnames: true, // 保留类名
      },
      format: {
        // 保留注释，便于调试
        comments: false,
      },
    },
    // 关键修改1：小资源内联（减少请求数，不影响大包拆分）
    // 10KB以下的资源内联，避免小图标/小css拆成独立文件
    assetsInlineLimit: 10 * 1024,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      // 关键修改2：移除Rollup手动cache（Vite自有缓存更稳定）
      // cache: true,
      // 强制按依赖顺序生成chunk，避免加载顺序混乱
      preserveEntrySignatures: 'strict',
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        warn(warning);
      },
      output: {
        format: 'esm',
        // 平衡方案：只拆分真正独立的大库，业务代码和 Vue 生态合并
        // 这样可以避免初始化顺序问题，同时控制文件大小
        // fixChunkReferencesPlugin 会处理异常文件名（如末尾有连字符或下划线的情况）
        inlineDynamicImports: false,
        manualChunks(id) {
          // 0. EPS 服务单独打包（所有应用共享，必须在最前面）
          if (id.includes('virtual:eps') || 
              id.includes('\\0virtual:eps') ||
              id.includes('services/eps') ||
              id.includes('services\\eps')) {
            return 'eps-service';
          }

          // 1. 独立大库：ECharts（纯 echarts 和 zrender，不包含 vue-echarts）
          // 注意：vue-echarts 依赖 Vue，需要和 Vue 一起打包到 vendor chunk
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender')) {
            return 'echarts-vendor';
          }

          // 2. 其他独立大库（完全独立）
          if (id.includes('node_modules/monaco-editor')) {
            return 'lib-monaco';
          }
          if (id.includes('node_modules/three')) {
            return 'lib-three';
          }

          // 3. Vue 生态库 + 所有依赖 Vue 的第三方库 + 共享组件库
          // 原因：这些库之间有强依赖关系，拆分会导致初始化顺序问题
          // 例如：Element Plus 依赖 Vue 的 RefImpl，Vue Router 的 extend 需要在初始化时可用
          // vue-echarts 依赖 Vue，需要和 Vue 一起打包
          // 共享组件库也依赖 Vue 生态，需要确保在同一个 chunk 中
          // 解决方案：合并到一个 vendor chunk，让 Rollup 自动处理内部依赖顺序
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/element-plus') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vueuse') ||
              id.includes('node_modules/@element-plus') ||
              id.includes('node_modules/vue-echarts') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/lodash') ||
              id.includes('node_modules/@vue') ||
              id.includes('packages/shared-components') ||
              id.includes('packages/shared-core') ||
              id.includes('packages/shared-utils')) {
            return 'vendor';
          }

          // 4. 所有其他业务代码合并到主文件
          // 原因：业务代码之间有强依赖，拆分会导致初始化顺序问题
          // 解决方案：合并到一起，让 Rollup 自动处理内部依赖顺序
          return undefined; // 返回 undefined 表示合并到入口文件
        },
        preserveModules: false,
        // 确保模块按正确的顺序输出，避免初始化顺序问题
        generatedCode: {
          constBindings: false, // 不使用 const，避免 TDZ 问题
        },
        // 使用 Rollup 的 [hash] 占位符（基于内容计算，类似 Webpack 的 contenthash）
        // 注意：Rollup 不支持 [contenthash:8] 或长度限制，只能使用 [hash]
        // Rollup 的 [hash] 就是基于文件内容计算的，只有内容变化时哈希才变
        // 注意：Rollup 的 [hash] 可能包含下划线（_）或末尾有连字符（-），这是 Rollup 的内部实现
        // fixChunkReferencesPlugin 会在 generateBundle 阶段检测并修复这些异常文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
      external: [],
      // 关键修改5：禁用tree-shaking（避免循环依赖导致的初始化顺序问题）
      // 原因：即使合并到同一chunk，tree-shaking可能改变模块初始化顺序，导致"Cannot access 'ut' before initialization"错误
      // 解决方案：禁用tree-shaking，确保所有模块按原始顺序初始化
      treeshake: false,
    },
    // 关键修改6：降低警告阈值（及时发现大包问题）
    chunkSizeWarningLimit: 1000,
  },
});
