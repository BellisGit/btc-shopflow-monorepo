import type { Plugin } from 'vite';
/**
 * 处理 Vue 组件的 name 标签
 */
export declare function createTag(code: string, id: string): {
    code: string;
    map: any;
} | null;
/**
 * 名称标签插件
 * 自动给 Vue 组件添加 name 属性（支持 <script setup name="ComponentName"> 语法）
 */
export declare function tagPlugin(): Plugin;
