import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useMessage } from './use-message';

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

let delayHintTimer: number | undefined;
let skeletonVisible = false;

/**
 * 显示骨架屏
 */
export function showSkeleton() {
  skeletonVisible = true;
  
  // 查找骨架屏的函数
  // 骨架屏现在在容器内部（使用绝对定位），先尝试从容器内查找，再全局查找
  const findAndShowSkeleton = () => {
    const container = document.querySelector('#subapp-viewport');
    const skeleton = container?.querySelector('#app-skeleton') as HTMLElement || document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.display = 'flex';
      // console.log('[loadingManager] showSkeleton: 骨架屏已显示');
      return true;
    }
    return false;
  };
  
  // 立即尝试查找
  if (!findAndShowSkeleton()) {
    // console.warn('[loadingManager] showSkeleton: 骨架屏元素未找到，容器:', document.querySelector('#subapp-viewport'));
    // 如果找不到，使用多次重试（给 Vue 一些时间渲染）
    let retryCount = 0;
    const maxRetries = 20; // 最多重试 20 次（约 1 秒）
    const retryInterval = 50; // 每次重试间隔 50ms
    
    const retryTimer = setInterval(() => {
      retryCount++;
      if (findAndShowSkeleton() || retryCount >= maxRetries) {
        clearInterval(retryTimer);
        // if (retryCount >= maxRetries) {
        //   console.warn('[loadingManager] showSkeleton: 重试失败，骨架屏元素仍未找到');
        //   // 作为最后的兜底，检查容器内部的所有元素
        //   const container = document.querySelector('#subapp-viewport');
        //   if (container) {
        //     console.warn('[loadingManager] showSkeleton: 容器内容:', container.innerHTML.substring(0, 200));
        //   }
        // }
      }
    }, retryInterval);
  }
}

/**
 * 隐藏骨架屏
 */
export function hideSkeleton() {
  skeletonVisible = false;
  // 骨架屏在容器外部（使用绝对定位覆盖），直接全局查找
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    // 强制隐藏，确保不会被其他样式覆盖
    skeleton.style.setProperty('display', 'none', 'important');
    // console.log('[loadingManager] hideSkeleton: 骨架屏已隐藏');
  } else {
    // 如果找不到，说明骨架屏可能已经被移除或未渲染，这是正常的
    // console.log('[loadingManager] hideSkeleton: 骨架屏元素未找到（可能已移除）');
  }
}

/**
 * 延迟显示加载提示
 * @param ms 延迟时间（毫秒）
 * @param appName 应用名称
 */
export function delayHint(ms: number, _appName: string) {
  clearDelayHint();
  delayHintTimer = window.setTimeout(() => {
    if (skeletonVisible) {
      // 保留骨架屏但不再额外弹出“正在加载”提示
    }
  }, ms);
}

/**
 * 清除延迟提示
 */
export function clearDelayHint() {
  if (delayHintTimer) {
    clearTimeout(delayHintTimer);
    delayHintTimer = undefined;
  }
}

/**
 * 开始加载应用
 */
export function startLoading(_appName: string) {
  // console.log('[loadingManager] startLoading 被调用，appName:', appName);
  // NProgress.start(); // 注释掉 loading
  // showSkeleton(); // 注释掉 loading
  // 如果超过 1200ms 还未加载完成，显示提示
  // delayHint(1200, appName); // 注释掉 loading
  // console.log('[loadingManager] startLoading 完成，skeletonVisible:', skeletonVisible);
}

/**
 * 加载完成
 */
export function finishLoading() {
  // console.log('[loadingManager] finishLoading 被调用');
  
  // 确保 NProgress 完全清除
  // try {
  //   NProgress.done(); // 注释掉 loading
  //   // 强制移除 NProgress 的 DOM 元素（如果存在）
  //   const nprogressBar = document.getElementById('nprogress');
  //   if (nprogressBar) {
  //     nprogressBar.remove();
  //   }
  // } catch (error) {
  //   console.warn('[loadingManager] finishLoading: NProgress.done() 失败:', error);
  // }
  
  // hideSkeleton(); // 注释掉 loading
  // clearDelayHint(); // 注释掉 loading
  // console.log('[loadingManager] finishLoading 完成，skeletonVisible:', skeletonVisible);
}

/**
 * 加载失败
 */
export function loadingError(appName: string, _error?: Error) {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();

  const message = useMessage();
  message.error(`加载「${appName}」失败，请刷新重试`);

  // console.error(`[应用加载失败] ${appName}:`, error);
}

