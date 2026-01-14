import { logger } from '@build-utils/logger';
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";

// 构建日志插件
const buildLogPlugin = () => {
	return {
		name: "build-log",
		buildStart() {
			logger.info("\n📦 开始构建 @btc/vite-plugin...");
			logger.info("   - 输入文件: src/index.ts");
			logger.info("   - 输出格式: CJS + ESM");
		},
		buildEnd(error) {
			if (error) {
				logger.error("\n❌ @btc/vite-plugin 构建失败:", error);
			} else {
				logger.success("\n✅ @btc/vite-plugin 构建成功！");
				logger.info("   - 输出文件: dist/index.js (CJS)");
				logger.info("   - 输出文件: dist/index.mjs (ESM)");
			}
		},
	};
};

export default defineConfig({
	input: "src/index.ts",

	external: ["vite", "rollup", "magic-string", "glob", "svgo", "axios", "prettier", "@btc/shared-core"],
	// 注意：lodash-es 不设为 external，让它被打包进插件，确保运行时可用

	output: [
		{
			file: "dist/index.js",
			format: "cjs",
			exports: "named"
		},
		{
			file: "dist/index.mjs",
			format: "esm"
		}
	],

	onwarn(warning, warn) {
		// 忽略所有警告，因为这是一个 Node.js 环境专用的插件
		return;
	},

	plugins: [
		buildLogPlugin(), // 添加构建日志插件
		nodeResolve({
			// 解析 node_modules 中的模块，确保 lodash-es 能被正确打包
			preferBuiltins: false,
		}),
		typescript({
			tsconfig: "./tsconfig.json",
			exclude: ["./node_modules/**", "./dist/**"],
		}),
	],
});

