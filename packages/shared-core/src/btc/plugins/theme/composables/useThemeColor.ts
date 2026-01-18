;
import { mixColor } from '../../../composables/useTheme';
import { logger } from '../../../../utils/logger/index';

/**
 * 将 RGB/RGBA 颜色转换为十六进制格式
 */
export function colorToHex(color: string): string {
  if (!color || typeof color !== 'string') {
    return '#409eff'; // 默认颜色
  }

  // 如果已经是十六进制格式，直接返回
  if (color.startsWith('#')) {
    // 确保是完整的 6 位十六进制格式
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      // 处理缩写格式 #RGB -> #RRGGBB
      return `#${hex.split('').map(c => c + c).join('')}`;
    }
    if (hex.length === 6) {
      return `#${hex}`;
    }
    return '#409eff'; // 无效格式，返回默认值
  }

  const rgbMatch = color.trim().match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/i);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    // 验证 RGB 值范围
    if (!isNaN(r) && !isNaN(g) && !isNaN(b) &&
        r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      const toHex = (n: number) => {
        const hex = n.toString(16).toLowerCase();
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  // 如果无法解析，返回默认颜色
  console.warn('[Theme] Unable to parse color format:', color);
  return '#409eff';
}

// 防止递归调用的标志
let isSettingThemeColor = false;

// 导出同步函数，供外部调用
export function syncThemeColorToSubApps(): void {
  const pre = '--el-color-primary';
  const el = document.documentElement;
  
  // 从 html 元素获取当前的主题色变量值
  const htmlColor = el.style.getPropertyValue(pre) || getComputedStyle(el).getPropertyValue(pre).trim();
  if (!htmlColor) return;

  const setThemeColorToContainer = (container: HTMLElement) => {
    container.style.setProperty(pre, htmlColor);
    // 同步所有 light 和 dark 变量
    for (let i = 1; i < 10; i += 1) {
      const lightVar = el.style.getPropertyValue(`${pre}-light-${i}`) || getComputedStyle(el).getPropertyValue(`${pre}-light-${i}`).trim();
      const darkVar = el.style.getPropertyValue(`${pre}-dark-${i}`) || getComputedStyle(el).getPropertyValue(`${pre}-dark-${i}`).trim();
      if (lightVar) container.style.setProperty(`${pre}-light-${i}`, lightVar);
      if (darkVar) container.style.setProperty(`${pre}-dark-${i}`, darkVar);
    }
  };

  // 设置到子应用容器
  const subappViewport = document.querySelector('#subapp-viewport') as HTMLElement;
  if (subappViewport) {
    setThemeColorToContainer(subappViewport);
  }

  // 设置到所有 [data-qiankun] 元素
  const qiankunContainers = document.querySelectorAll('[data-qiankun]') as NodeListOf<HTMLElement>;
  qiankunContainers.forEach(container => {
    setThemeColorToContainer(container);
  });

  // 设置到子应用内的 #app 元素（子应用的根元素）
  const subappRoots = document.querySelectorAll('#subapp-viewport #app, [data-qiankun] #app') as NodeListOf<HTMLElement>;
  subappRoots.forEach(root => {
    setThemeColorToContainer(root);
  });
}

/**
 * 设置主题颜色到 CSS 变量
 */
export function setThemeColor(color: string, dark: boolean, skipEvent = false): void {
  // 如果正在设置主题色，避免递归调用
  if (isSettingThemeColor) {
    return;
  }

  isSettingThemeColor = true;

  try {
    const el = document.documentElement;
    const pre = '--el-color-primary';
    const mixWhite = '#ffffff';
    const mixBlack = '#131313';

    // 检查当前颜色是否已经相同，避免不必要的更新
    // 注意：getPropertyValue 可能返回空字符串，所以需要检查
    const currentColor = el.style.getPropertyValue(pre);
    // 将颜色转换为十六进制格式进行比较
    const normalizedColor = colorToHex(color);
    const normalizedCurrentColor = currentColor ? colorToHex(currentColor) : null;
    
    if (normalizedCurrentColor && normalizedCurrentColor === normalizedColor) {
      // 颜色相同，但仍然需要检查暗黑模式是否相同
      // 如果都相同，直接返回
      const currentDark = document.documentElement.classList.contains('dark');
      if (currentDark === dark) {
        isSettingThemeColor = false;
        return;
      }
    }

    // 将颜色转换为十六进制格式（mixColor 函数需要十六进制格式）
    const hexColor = colorToHex(color);

    // 确保 hexColor 是有效的十六进制格式（必须是 #RRGGBB 格式，长度为 7）
    if (!hexColor.startsWith('#') || hexColor.length !== 7) {
      logger.error('[Theme] Invalid color format after conversion:', {
        original: color,
        converted: hexColor,
        expected: 'format like #RRGGBB'
      });
      // 如果转换失败，设置默认值并返回
      el.style.setProperty(pre, color);
      for (let i = 1; i < 10; i += 1) {
        el.style.setProperty(`${pre}-light-${i}`, '#ecf5ff');
        el.style.setProperty(`${pre}-dark-${i}`, '#ecf5ff');
      }
      isSettingThemeColor = false;
      return;
    }

    // CSS 变量可以接受任何格式的颜色，所以使用原始颜色值
    el.style.setProperty(pre, color);

    // 但 mixColor 函数需要十六进制格式来计算渐变色
    try {
      for (let i = 1; i < 10; i += 1) {
        const weight = i * 0.1;
        const lightColor = dark
          ? mixColor(hexColor, mixBlack, weight)
          : mixColor(hexColor, mixWhite, weight);
        const darkColor = dark
          ? mixColor(hexColor, mixWhite, weight)
          : mixColor(hexColor, mixBlack, weight);

        const lightVarName = `${pre}-light-${i}`;
        const darkVarName = `${pre}-dark-${i}`;

        el.style.setProperty(lightVarName, lightColor);
        el.style.setProperty(darkVarName, darkColor);
      }
    } catch (error) {
      logger.error('[Theme] Error setting theme color variables:', error);
      logger.error('[Theme] Details:', {
        originalColor: color,
        convertedHex: hexColor,
        hexColorLength: hexColor?.length,
        hexColorStartsWithHash: hexColor?.startsWith('#')
      });
      // 即使出错，也尝试设置一个默认值，避免变量未定义
      for (let i = 1; i < 10; i += 1) {
        el.style.setProperty(`${pre}-light-${i}`, '#ecf5ff');
        el.style.setProperty(`${pre}-dark-${i}`, '#ecf5ff');
      }
    }

    // ========== 关键：在微前端环境下，确保主题色变量也设置到子应用容器 ==========
    // 注意：已关闭 qiankun 的样式隔离（experimentalStyleIsolation: false），CSS 变量可以正常继承
    // 但为了确保子应用加载后能立即获取到主题色，仍然显式设置到容器上
    const setThemeColorToContainer = (container: HTMLElement) => {
      // 设置到容器本身
      container.style.setProperty(pre, color);
      try {
        for (let i = 1; i < 10; i += 1) {
          const weight = i * 0.1;
          const lightColor = dark
            ? mixColor(hexColor, mixBlack, weight)
            : mixColor(hexColor, mixWhite, weight);
          const darkColor = dark
            ? mixColor(hexColor, mixWhite, weight)
            : mixColor(hexColor, mixBlack, weight);

          const lightVarName = `${pre}-light-${i}`;
          const darkVarName = `${pre}-dark-${i}`;

          container.style.setProperty(lightVarName, lightColor);
          container.style.setProperty(darkVarName, darkColor);
        }
      } catch (error) {
        // 如果出错，至少设置主颜色
        console.warn('[Theme] Error setting theme color to container:', error);
      }
    };

    // 同步主题色到所有子应用容器的辅助函数
    const syncThemeToSubApps = () => {
      // 设置到子应用容器
      const subappViewport = document.querySelector('#subapp-viewport') as HTMLElement;
      if (subappViewport) {
        setThemeColorToContainer(subappViewport);
      }

      // 设置到所有 [data-qiankun] 元素
      const qiankunContainers = document.querySelectorAll('[data-qiankun]') as NodeListOf<HTMLElement>;
      qiankunContainers.forEach(container => {
        setThemeColorToContainer(container);
      });

      // 设置到子应用内的 #app 元素（子应用的根元素）
      const subappRoots = document.querySelectorAll('#subapp-viewport #app, [data-qiankun] #app') as NodeListOf<HTMLElement>;
      subappRoots.forEach(root => {
        setThemeColorToContainer(root);
      });
    };

    // 立即同步
    syncThemeToSubApps();

    // 使用 setTimeout 延迟再次同步，确保子应用加载完成后也能获取到主题色
    setTimeout(() => {
      syncThemeToSubApps();
    }, 100);

    // 只有在不跳过事件时才广播主题变化事件（用于跨应用通信）
    if (!skipEvent) {
      window.dispatchEvent(
        new CustomEvent('theme-change', {
          detail: { color, dark },
        })
      );
    }
  } finally {
    // 确保标志被重置
    isSettingThemeColor = false;
  }
}

