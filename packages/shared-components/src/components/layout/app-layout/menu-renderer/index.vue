<template>
  <template v-for="item in menuItems" :key="item.index">
    <!-- 有子菜单的情况 -->
    <!-- 关键：Element Plus 的 el-sub-menu 要求必须有 index 属性 -->
    <!-- 虽然分组节点在 manifest 中没有实际路由路径，但我们需要提供 index 用于菜单状态管理 -->
    <!-- 在 handleMenuSelect 中会过滤掉分组节点的导航 -->
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.index"
      v-show="isMenuVisible(item)"
    >
      <template #title>
        <el-icon>
          <component
            v-if="!isSvgIcon(item.icon)"
            :is="getIconComponent(item.icon)"
          />
          <BtcSvg v-else :name="getSvgName(item.icon)" :size="18" />
        </el-icon>
        <span>{{ getMenuTitle(item) }}</span>
      </template>
      <!-- 递归渲染子菜单 -->
      <MenuRenderer
        :menu-items="item.children"
        v-bind="{
          ...(searchKeyword !== undefined ? { 'search-keyword': searchKeyword } : {}),
          ...(isCollapse !== undefined ? { 'is-collapse': isCollapse } : {})
        }"
      />
    </el-sub-menu>

    <!-- 没有子菜单的情况 -->
    <el-menu-item
      v-else
      :index="item.index"
      v-show="isMenuVisible(item)"
    >
      <el-icon>
        <component
          v-if="!isSvgIcon(item.icon)"
          :is="getIconComponent(item.icon)"
        />
        <BtcSvg v-else :name="getSvgName(item.icon)" :size="18" />
      </el-icon>
      <span>{{ getMenuTitle(item) }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
// defineComponent 未使用，已移除导入
import type { MenuItem } from '../../../../store/menuRegistry';
import { BtcSvg } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import {
  Lock,
  Location,
  Connection,
  Files,
  User,
  OfficeBuilding,
  Menu,
  TrendCharts,
  UserFilled,
  FolderOpened,
  Postcard,
  Coin,
  School,
  Key,
  List,
  Monitor,
  DocumentCopy,
  Histogram,
  Odometer,
  Document,
  Tickets,
  House,
  Grid,
  View,
  Operation,
  Opportunity,
  CollectionTag,
  DeleteFilled,
  Collection,
  Setting,
  Edit,
  DataAnalysis,
  ShoppingCart,
  Box,
  MapLocation,
  Folder,
  Delete,
  Check,
  Warning,
  Money,
  CreditCard,
  Clock,
  ShoppingBag,
  Goods,
  Van,
  Ship,
  Tools,
  Cpu,
  Printer,
  Camera,
  Picture,
  VideoCamera,
  Microphone,
  Headset,
  Phone,
  Message,
  ChatDotRound,
  ChatLineRound,
  Bell,
  Notification,
  Promotion,
  Discount,
  Star,
  StarFilled,
  Share,
  Download,
  Upload,
  Link,
  Search,
  Filter,
  Sort,
  Refresh,
  Loading,
  Plus,
  Minus,
  Close,
  CircleCheck,
  CircleClose,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CirclePlus,
  Remove,
  CircleCheckFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue';

defineOptions({
  name: 'MenuRenderer',
});

interface Props {
  menuItems: MenuItem[];
  searchKeyword?: string;
  isCollapse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchKeyword: '',
  isCollapse: false,
});

const { t, te } = useI18n();

// 使用主应用 i18n 实例进行翻译（与 tabbar 保持一致）
function getMainAppI18n() {
  if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
    return (window as any).__MAIN_APP_I18N__;
  }
  return null;
}

// 使用主应用 i18n 实例进行翻译（与 tabbar 的 translateWithMainI18n 保持一致）
function translateWithMainI18n(key: string): string | null {
  const mainAppI18n = getMainAppI18n();
  if (mainAppI18n && mainAppI18n.global) {
    const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
    const messages = mainAppI18n.global.getLocaleMessage(currentLocale);

    // 直接访问消息对象，确保能访问到已合并的语言包
    // vue-i18n 的 te 和 t 函数支持点号分隔的嵌套 key，所以这里先尝试扁平化访问
    if (key in messages) {
      const value = messages[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      } else if (typeof value === 'function') {
        try {
          const result = value({ normalize: (arr: any[]) => arr[0] });
          if (typeof result === 'string' && result.trim() !== '') {
            return result;
          }
        } catch {
          // 如果函数调用失败，继续使用其他方法
        }
      }
    }

    // 如果直接访问失败，使用 te 和 t（vue-i18n 支持点号分隔的嵌套 key）
    if (mainAppI18n.global.te(key, currentLocale)) {
      const translated = mainAppI18n.global.t(key, currentLocale);
      if (translated && typeof translated === 'string' && translated !== key && translated.trim() !== '') {
        return translated;
      }
    }
  }
  return null;
}

// 获取菜单标题
// 优先使用 labelKey 进行翻译，如果没有 labelKey 或翻译失败，则使用 title
const getMenuTitle = (item: MenuItem): string => {
  // 如果有 labelKey，尝试翻译
  if (item.labelKey) {
    // 优先使用主应用的 i18n 实例进行翻译（与 tabbar 保持一致）
    const mainTranslated = translateWithMainI18n(item.labelKey);
    if (mainTranslated) {
      return mainTranslated;
    }
    
    // 如果主应用翻译失败，尝试使用子应用的 t() 函数
    if (te(item.labelKey)) {
      const translated = t(item.labelKey);
      if (translated && typeof translated === 'string' && translated !== item.labelKey && translated.trim() !== '') {
        return translated;
      }
    }
  }
  
  // 如果没有 labelKey 或翻译失败，使用 title（可能是已翻译的文本或原始 key）
  // 但如果 title 看起来像 key（包含点号），不直接返回，而是尝试翻译
  if (item.title && item.title.includes('.')) {
    // title 可能是 key，尝试翻译
    const mainTranslated = translateWithMainI18n(item.title);
    if (mainTranslated) {
      return mainTranslated;
    }
    if (te(item.title)) {
      const translated = t(item.title);
      if (translated && typeof translated === 'string' && translated !== item.title && translated.trim() !== '') {
        return translated;
      }
    }
  }
  
  return item.title || '';
};

// 图标映射表
const iconMap: Record<string, any> = {
  Lock,
  Location,
  Connection,
  Files,
  User,
  OfficeBuilding,
  Menu,
  TrendCharts,
  UserFilled,
  FolderOpened,
  Postcard,
  Coin,
  School,
  Key,
  List,
  Monitor,
  DocumentCopy,
  Histogram,
  Odometer,
  Document,
  Tickets,
  House,
  Grid,
  View,
  Operation,
  Opportunity,
  CollectionTag,
  DeleteFilled,
  Collection,
  Setting,
  Edit,
  DataAnalysis,
  ShoppingCart,
  Box,
  MapLocation,
  Folder,
  Delete,
  Check,
  Warning,
  Money,
  CreditCard,
  Clock,
  ShoppingBag,
  Goods,
  Van,
  Ship,
  Tools,
  Cpu,
  Printer,
  Camera,
  Picture,
  VideoCamera,
  Microphone,
  Headset,
  Phone,
  Message,
  ChatDotRound,
  ChatLineRound,
  Bell,
  Notification,
  Promotion,
  Discount,
  Star,
  StarFilled,
  Share,
  Download,
  Upload,
  Link,
  Search,
  Filter,
  Sort,
  Refresh,
  Loading,
  Plus,
  Minus,
  Close,
  CircleCheck,
  CircleClose,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CirclePlus,
  Remove,
  CircleCheckFilled,
  CircleCloseFilled,
};

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return Coin;
  return iconMap[iconName] || Coin; // 默认图标
};

const isSvgIcon = (iconName?: string) => iconName?.startsWith('svg:') ?? false;

const getSvgName = (iconName?: string) => iconName?.replace(/^svg:/, '') || '';

// 判断菜单项是否可见（支持搜索过滤）
const isMenuVisible = (item: MenuItem): boolean => {
  if (!props.searchKeyword) return true;

  const keyword = props.searchKeyword.toLowerCase().trim();
  if (!keyword) return true;

  // 检查当前菜单项是否匹配
  const currentMatch = getMenuTitle(item).toLowerCase().includes(keyword);

  // 如果有子菜单，检查子菜单是否有匹配项
  if (item.children && item.children.length > 0) {
    const hasMatchingChildren = item.children.some(child => isMenuVisible(child));
    return currentMatch || hasMatchingChildren;
  }

  return currentMatch;
};
</script>
