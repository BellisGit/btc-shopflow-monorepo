import { formHook } from '@btc/shared-utils';

/**
 * 表单项动态控制方法（对齐 cool-admin form/helper/action.ts）
 */
export function useFormItemActions(formSetup: any) {
  const { config, form } = formSetup;

  /**
   * 查找表单项
   */
  function findItemByProp(prop: string): any {
    let result: any;

    function deep(items: any[]) {
      items.forEach(e => {
        if (e.prop === prop) {
          result = e;
        } else if (e.children) {
          deep(e.children);
        }
      });
    }

    deep(config.items);
    return result;
  }

  /**
   * 设置配置（通用）
   */
  function set(
    { prop, key, path }: {
      prop?: string;
      key?: 'options' | 'props' | 'hidden' | 'hidden-toggle';
      path?: string
    },
    data?: any
  ) {
    // 通过路径设置
    if (path) {
      const keys = path.split('.');
      let target: any = config;

      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]];
      }

      target[keys[keys.length - 1]] = data;
      return;
    }

    // 通过 prop 设置
    if (prop) {
      const item = findItemByProp(prop);

      if (!item) {
        console.error(`[set] ${prop} is not found`);
        return;
      }

      switch (key) {
        case 'options':
          if (item.component) {
            item.component.options = data;
          }
          break;

        case 'props':
          if (item.component) {
            if (!item.component.props) {
              item.component.props = {};
            }
            Object.assign(item.component.props, data);
          }
          break;

        case 'hidden':
          item.hidden = data;
          break;

        case 'hidden-toggle':
          item.hidden = data === undefined ? !item.hidden : !data;
          break;

        default:
          Object.assign(item, data);
          break;
      }
    }
  }

  /**
   * 获取表单值
   */
  function getForm(prop?: string) {
    return prop ? form[prop] : form;
  }

  /**
   * 设置表单值
   */
  function setForm(prop: string, value: any) {
    form[prop] = value;
  }

  /**
   * 设置配置
   */
  function setConfig(path: string, value: any) {
    set({ path }, value);
  }

  /**
   * 设置表单项数据
   */
  function setData(prop: string, value: any) {
    set({ prop }, value);
  }

  /**
   * 设置表单项的下拉选项
   */
  function setOptions(prop: string, value: any[]) {
    set({ prop, key: 'options' }, value);
  }

  /**
   * 设置表单项的组件属性
   */
  function setProps(prop: string, value: any) {
    set({ prop, key: 'props' }, value);
  }

  /**
   * 切换表单项显示/隐藏
   */
  function toggleItem(prop: string, value?: boolean) {
    set({ prop, key: 'hidden-toggle' }, value);
  }

  /**
   * 隐藏表单项
   */
  function hideItem(...props: string[]) {
    props.forEach((prop) => {
      set({ prop, key: 'hidden' }, true);
    });
  }

  /**
   * 显示表单项
   */
  function showItem(...props: string[]) {
    props.forEach((prop) => {
      set({ prop, key: 'hidden' }, false);
    });
  }

  /**
   * 设置标题
   */
  function setTitle(value: string) {
    config.title = value;
  }

  /**
   * 绑定表单数据（手动绑定）
   */
  function bindForm(data: any) {
    config.items.forEach((e: any) => {
      function deep(e: any) {
        if (e.prop) {
          formHook.bind({
            ...e,
            value: e.prop ? data[e.prop] : undefined,
            form: data
          });
        }

        if (e.children) {
          e.children.forEach(deep);
        }
      }

      deep(e);
    });

    Object.assign(form, data);
  }

  return {
    // 查找
    findItemByProp,

    // 表单值操作
    getForm,
    setForm,

    // 表单项控制
    setData,
    setConfig,
    setOptions,
    setProps,
    toggleItem,
    hideItem,
    showItem,
    setTitle,
    bindForm,
  };
}

