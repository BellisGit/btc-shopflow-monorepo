import { ref } from 'vue';
import type { UpsertPlugin, UpsertProps } from '../types';

/**
 * 插件系统管理
 */
export function usePlugins(props: UpsertProps) {
  // 插件管理
  const registeredPlugins = ref<UpsertPlugin[]>([]);

  /**
   * 注册插件
   */
  const registerPlugins = () => {
    if (props.plugins && props.enablePlugin !== false) {
      registeredPlugins.value = props.plugins;
      // 触发插件 created
      props.plugins.forEach((p) => {
        if (p.created) {
          p.created(p.value);
        }
      });
    }
  };

  /**
   * 触发插件 onOpen
   */
  const triggerPluginOnOpen = async () => {
    if (props.enablePlugin !== false) {
      for (const p of registeredPlugins.value) {
        if (p.onOpen) {
          await p.onOpen();
        }
      }
    }
  };

  /**
   * 触发插件 onSubmit
   */
  const triggerPluginOnSubmit = async (submitData: any): Promise<any> => {
    let data = submitData;

    if (props.enablePlugin !== false) {
      for (const p of registeredPlugins.value) {
        if (p.onSubmit) {
          data = (await p.onSubmit(data)) || data;
        }
      }
    }

    return data;
  };

  /**
   * 触发插件 onClose
   */
  const triggerPluginOnClose = (done: () => void) => {
    if (props.enablePlugin !== false && registeredPlugins.value.length > 0) {
      let index = 0;

      const next = () => {
        if (index < registeredPlugins.value.length) {
          const p = registeredPlugins.value[index];
          index++;
          if (p.onClose) {
            p.onClose(next);
          } else {
            next();
          }
        } else {
          done();
        }
      };

      next();
    } else {
      done();
    }
  };

  /**
   * 清空插件
   */
  const clearPlugins = () => {
    registeredPlugins.value = [];
  };

  return {
    registeredPlugins,
    registerPlugins,
    triggerPluginOnOpen,
    triggerPluginOnSubmit,
    triggerPluginOnClose,
    clearPlugins,
  };
}
