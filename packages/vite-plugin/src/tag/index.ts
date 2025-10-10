/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import { parse, compileScript } from '@vue/compiler-sfc';
import MagicString from 'magic-string';
import { config } from '../config';

/**
 * 处理 Vue 组件的 name 标签
 */
export function createTag(code: string, id: string): { code: string; map: any } | null {
  if (/\.vue$/.test(id)) {
    let s: MagicString | undefined;
    const str = () => s || (s = new MagicString(code));
    const { descriptor } = parse(code);

    if (!descriptor.script && descriptor.scriptSetup) {
      const res = compileScript(descriptor, { id });
      const { name, lang }: any = res.attrs;

      if (name) {
        str().appendLeft(
          0,
          `<script lang="${lang || 'ts'}">
import { defineComponent } from 'vue'
export default defineComponent({
	name: "${name}"
})
</script>\n`
        );

        return {
          map: str().generateMap(),
          code: str().toString(),
        };
      }
    }
  }

  return null;
}

/**
 * 名称标签插件
 * 自动给 Vue 组件添加 name 属性（支持 <script setup name="ComponentName"> 语法）
 */
export function tagPlugin(): Plugin {
  return {
    name: 'btc:tag',

    enforce: 'pre',

    transform(code: string, id: string) {
      // 只有开启了 nameTag 配置才处理
      if (!config.nameTag) {
        return null;
      }

      const result = createTag(code, id);

      if (result) {
        return result;
      }

      return null;
    },
  };
}
