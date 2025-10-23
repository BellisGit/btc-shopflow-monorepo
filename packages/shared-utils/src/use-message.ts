/**
 * 娑堟伅绠＄悊缁勫悎寮忓嚱鏁? * 鎻愪緵缁熶竴鐨勬秷鎭彂閫佹帴鍙? */

// messageManager 鐜板湪浠庡叏灞€鑾峰彇锛屼笉鍐嶄粠鏈湴瀵煎叆

/**
 * 浣跨敤娑堟伅绠＄悊鍣? * @returns 娑堟伅鍙戦€佹柟娉? */
export function useMessage() {
  const messageManager = (window as any).messageManager;

  if (!messageManager) {
    console.warn('MessageManager not available');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }

  return {
    /**
     * 鏄剧ず鎴愬姛娑堟伅
     */
    success: (message: string) => {
      messageManager.enqueue('success', message);
    },

    /**
     * 鏄剧ず閿欒娑堟伅
     */
    error: (message: string) => {
      messageManager.enqueue('error', message);
    },

    /**
     * 鏄剧ず璀﹀憡娑堟伅
     */
    warning: (message: string) => {
      messageManager.enqueue('warning', message);
    },

    /**
     * 鏄剧ず淇℃伅娑堟伅
     */
    info: (message: string) => {
      messageManager.enqueue('info', message);
    }
  };
}

/**
 * 鐩存帴浣跨敤娑堟伅绠＄悊鍣ㄧ殑鏂规硶锛堢敤浜庨潪缁勪欢鐜锛? */
export const message = {
  success: (message: string) => {
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('success', message);
    }
  },
  error: (message: string) => {
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('error', message);
    }
  },
  warning: (message: string) => {
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('warning', message);
    }
  },
  info: (message: string) => {
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('info', message);
    }
  }
};




