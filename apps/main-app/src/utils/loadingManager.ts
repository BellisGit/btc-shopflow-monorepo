import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ElMessage } from 'element-plus';

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
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.display = 'flex';
  }
}

/**
 * 隐藏骨架屏
 */
export function hideSkeleton() {
  skeletonVisible = false;
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.display = 'none';
  }
}

/**
 * 延迟显示加载提示
 * @param ms 延迟时间（毫秒）
 * @param appName 应用名称
 */
export function delayHint(ms: number, appName: string) {
  clearDelayHint();
  delayHintTimer = window.setTimeout(() => {
    if (skeletonVisible) {
      ElMessage.info({
        message: `正在加载「${appName}」...`,
        duration: 2000,
        showClose: true,
      });
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
export function startLoading(appName: string) {
  NProgress.start();
  showSkeleton();
  // 如果超过 1200ms 还未加载完成，显示提示
  delayHint(1200, appName);
}

/**
 * 加载完成
 */
export function finishLoading() {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();
}

/**
 * 加载失败
 */
export function loadingError(appName: string, error?: Error) {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();

  ElMessage.error({
    message: `加载「${appName}」失败，请刷新重试`,
    duration: 3000,
    showClose: true,
  });

  console.error(`[应用加载失败] ${appName}:`, error);
}

