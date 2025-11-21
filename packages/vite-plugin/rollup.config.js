import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
	input: "src/index.ts",

	external: ["lodash", "vite", "rollup", "magic-string", "glob", "svgo", "axios", "prettier"],

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
		typescript({
			module: "esnext",
			exclude: ["./node_modules/**"],
		}),
	],
});

