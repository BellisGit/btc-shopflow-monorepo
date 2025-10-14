import type { App, Plugin } from 'vue';

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

let githubPluginInstance: GitHubPlugin | null = null;

/**
 * 创建GitHub插件
 */
export function createGitHubPlugin(): Plugin & { github: GitHubPlugin } {
  const github: GitHubPlugin = {
    openRepository(url = 'https://github.com/BellisGit/btc-shopflow.git') {
      window.open(url, '_blank');
    }
  };

  // 保存单例
  githubPluginInstance = github;

  const plugin: Plugin & { github: GitHubPlugin } = {
    install(app: App) {
      // 将GitHub实例挂载到全局属性
      app.config.globalProperties.$github = github;

      // 提供给 composition API 使用
      app.provide('github', github);
    },
    github,
  };

  return plugin;
}

/**
 * 组合式 API：使用GitHub插件
 */
export function useGitHubPlugin(): GitHubPlugin {
  if (!githubPluginInstance) {
    throw new Error('GitHub plugin not installed. Please call createGitHubPlugin() first.');
  }
  return githubPluginInstance;
}


