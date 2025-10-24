import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue';
import type { ContextMenuItem, ContextMenuOptions, MenuPosition, SubMenuPosition, MenuState } from '../types';

/**
 * 右键菜单组合式函数
 */
export function useContextMenu(): {
  // 状态
  state: MenuState;
  menuRef: any;
  subMenuRefs: any;

  // 计算属性
  hasSubMenus: any;

  // 方法
  open: (event: MouseEvent, options: ContextMenuOptions) => Promise<void>;
  close: () => void;
  handleItemClick: (item: ContextMenuItem) => void;
  handleSubMenuShow: (index: number) => void;
  handleSubMenuHide: () => void;
} {
  // 菜单状态
  const state = reactive<MenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    menuList: [],
    activeSubMenuIndex: null,
    subMenuPositions: []
  });

  // 菜单容器引用
  const menuRef = ref<HTMLElement>();
  const subMenuRefs = ref<HTMLElement[]>([]);

  // 计算属性
  const hasSubMenus = computed(() =>
    state.menuList.some(item => item.children && item.children.length > 0)
  );

  /**
   * 计算菜单位置
   */
  const calculatePosition = (event: MouseEvent, options: ContextMenuOptions): MenuPosition => {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;

    // 默认菜单尺寸
    const menuWidth = options.width || 200;
    const menuHeight = 300; // 估算高度

    const offset = options.offset || { x: 0, y: 0 };

    // 使用 clientX 和 clientY，这些是相对于视口的坐标
    // 在弹窗环境中，这些坐标已经是正确的
    let x = clientX + offset.x;
    let y = clientY + offset.y;
    let right = false;
    let bottom = false;

    // 水平位置调整
    if (x + menuWidth > innerWidth) {
      x = clientX - menuWidth + offset.x;
      right = true;
    }

    // 垂直位置调整
    if (y + menuHeight > innerHeight) {
      y = clientY - menuHeight + offset.y;
      bottom = true;
    }

    // 确保不超出视口边界
    x = Math.max(0, Math.min(x, innerWidth - menuWidth));
    y = Math.max(0, Math.min(y, innerHeight - menuHeight));

    return { x, y, right, bottom };
  };

  /**
   * 计算子菜单位置
   */
  const calculateSubMenuPosition = (parentIndex: number, parentRect: DOMRect): SubMenuPosition => {
    const subMenuWidth = 200; // 子菜单宽度
    const { innerWidth, innerHeight } = window;

    let x = parentRect.right;
    let y = parentRect.top;
    let right = false;
    let bottom = false;

    // 如果右侧空间不够，显示在左侧
    if (x + subMenuWidth > innerWidth) {
      x = parentRect.left - subMenuWidth;
      right = true;
    }

    // 如果底部空间不够，向上调整
    if (y + 200 > innerHeight) {
      y = innerHeight - 200;
      bottom = true;
    }

    return { x, y, right, bottom };
  };

  /**
   * 打开菜单
   */
  const open = async (event: MouseEvent, options: ContextMenuOptions) => {
    // 阻止默认右键菜单
    event.preventDefault();
    event.stopPropagation();

    // 计算位置
    const position = calculatePosition(event, options);

    // 更新状态
    state.visible = true;
    state.position = position;
    state.menuList = options.list;
    state.activeSubMenuIndex = null;
    state.subMenuPositions = [];

    // 等待 DOM 更新后计算子菜单位置
    await nextTick();
    if (hasSubMenus.value && menuRef.value) {
      const menuItems = menuRef.value.querySelectorAll('.btc-context-menu__item');
      const positions: SubMenuPosition[] = [];

      menuItems.forEach((item, index) => {
        const menuItem = state.menuList[index];
        if (menuItem?.children && menuItem.children.length > 0) {
          const rect = item.getBoundingClientRect();
          positions[index] = calculateSubMenuPosition(index, rect);
        }
      });

      state.subMenuPositions = positions;
    }
  };

  /**
   * 关闭菜单
   */
  const close = () => {
    state.visible = false;
    state.activeSubMenuIndex = null;
  };

  /**
   * 处理菜单项点击
   */
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.children) {
      return;
    }

    if (item.callback) {
      item.callback(() => {
        close();
      });
    } else {
      close();
    }
  };

  /**
   * 处理子菜单显示
   */
  const handleSubMenuShow = (index: number) => {
    state.activeSubMenuIndex = index;
  };

  /**
   * 处理子菜单隐藏
   */
  const handleSubMenuHide = () => {
    state.activeSubMenuIndex = null;
  };

  /**
   * 处理键盘事件
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  /**
   * 处理点击外部
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      close();
    }
  };

  // 初始化事件监听器
  const initEventListeners = () => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleClickOutside);
  };

  const removeEventListeners = () => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('click', handleClickOutside);
  };

  // 在打开菜单时初始化事件监听器
  const originalOpen = open;
  const openWithListeners = async (event: MouseEvent, options: ContextMenuOptions) => {
    initEventListeners();
    await originalOpen(event, options);
  };

  // 在关闭菜单时移除事件监听器
  const originalClose = close;
  const closeWithCleanup = () => {
    removeEventListeners();
    originalClose();
  };

  return {
    // 状态
    state,
    menuRef,
    subMenuRefs,

    // 计算属性
    hasSubMenus,

    // 方法
    open: openWithListeners,
    close: closeWithCleanup,
    handleItemClick,
    handleSubMenuShow,
    handleSubMenuHide
  };
}
