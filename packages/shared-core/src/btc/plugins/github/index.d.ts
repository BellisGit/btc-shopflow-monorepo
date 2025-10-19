import type { Plugin } from 'vue';
/**
 * GitHub插件API接口
 */
export interface GitHubPlugin {
    /**
     * 打开GitHub仓库
     * @param url GitHub仓库地址
     */
    openRepository: (url?: string) => void;
}
/**
 * 创建GitHub插件
 */
export declare function createGitHubPlugin(): Plugin & {
    github: GitHubPlugin;
};
/**
 * 组合式 API：使用GitHub插件
 */
export declare function useGitHubPlugin(): GitHubPlugin;
