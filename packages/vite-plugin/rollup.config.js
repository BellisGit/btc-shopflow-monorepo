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
			tsconfig: false,
			compilerOptions: {
				target: "ES2020",
				module: "ESNext",
				lib: ["ES2020", "DOM", "DOM.Iterable"],
				moduleResolution: "bundler",
				resolveJsonModule: true,
				allowJs: true,
				strict: true,
				noUnusedLocals: false,
				noUnusedParameters: false,
				noFallthroughCasesInSwitch: true,
				esModuleInterop: true,
				skipLibCheck: true,
				allowSyntheticDefaultImports: true,
				forceConsistentCasingInFileNames: true,
				isolatedModules: true,
				declaration: true,
				outDir: "./dist",
				rootDir: "./src"
			},
			exclude: ["./node_modules/**", "./dist/**"],
		}),
	],
});

