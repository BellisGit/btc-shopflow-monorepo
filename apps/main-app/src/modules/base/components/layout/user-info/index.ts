import { ref, computed, watch } from 'vue';
import { useUser } from '@/composables/useUser';
import { service } from '@services/eps';

export function useUserInfo() {
  // 从个人信息服务获取的用户信息
  const profileUserInfo = ref<any>(null);

  // 打字机效果相关
  const displayedName = ref('');
  const isTyping = ref(false);
  const cursorPosition = ref(0);
  let typingTimer: number | null = null;

  // 用户相关
  const { userInfo: userInfoComputed, getUserInfo, setUserInfo } = useUser();

  // 用户信息（优先从个人信息服务获取，否则从 useUser 获取，提供默认值）
  const userInfo = computed(() => {
    // 优先使用从个人信息服务获取的数据
    if (profileUserInfo.value) {
      return {
        name: profileUserInfo.value.name || profileUserInfo.value.realName || '',
        position: profileUserInfo.value.position || '',
        avatar: profileUserInfo.value.avatar || '/logo.png',
      };
    }

    // 其次从 useUser 获取
    const info = userInfoComputed.value;
    if (info) {
      return {
        name: info.name || info.username || '',
        position: info.position || '',
        avatar: info.avatar || '/logo.png',
      };
    }

    // 如果没有用户信息，尝试从 localStorage 获取
    const stored = getUserInfo();
    if (stored) {
      return {
        name: stored.name || stored.username || '',
        position: stored.position || '',
        avatar: stored.avatar || '/logo.png',
      };
    }

    // 默认值
    return {
      name: '',
      position: '',
      avatar: '/logo.png',
    };
  });

  // 加载用户信息（从个人信息服务）
  const loadProfileInfo = async () => {
    try {
      const profileService = service.system?.base?.profile;
      if (!profileService) {
        return;
      }

      // 获取脱敏信息即可（用于显示头像和基本信息）
      const data = await profileService.info();
      if (data) {
        profileUserInfo.value = data;

        // 同时更新 useUser 中的信息，保持一致性
        const currentUser = getUserInfo();
        if (currentUser) {
          setUserInfo({
            ...currentUser,
            name: data.name || currentUser.name,
            position: data.position || currentUser.position,
            avatar: data.avatar || currentUser.avatar,
          });
        }

        // 初始化显示名称
        displayedName.value = data.name || data.realName || '';
      }
    } catch (error) {
      // 静默失败，不影响页面显示
      console.warn('加载用户信息失败:', error);
    }
  };

  // 打字机效果（悬浮时触发）
  const handleNameHover = () => {
    const fullName = userInfo.value.name;
    if (!fullName || isTyping.value) return;

    // 清除之前的定时器
    if (typingTimer) {
      clearInterval(typingTimer);
    }

    // 重置显示
    displayedName.value = '';
    isTyping.value = true;
    cursorPosition.value = 0;

    let index = 0;
    typingTimer = setInterval(() => {
      if (index < fullName.length) {
        displayedName.value = fullName.substring(0, index + 1);
        cursorPosition.value = index + 1;
        index++;
      } else {
        // 打字完成，移除光标
        isTyping.value = false;
        cursorPosition.value = 0;
        if (typingTimer) {
          clearInterval(typingTimer);
          typingTimer = null;
        }
      }
    }, 100);
  };

  // 鼠标离开时恢复完整显示
  const handleNameLeave = () => {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    isTyping.value = false;
    cursorPosition.value = 0;
    displayedName.value = userInfo.value.name;
  };

  // 监听用户信息变化，更新显示名称
  watch(() => userInfo.value.name, (newName) => {
    if (!isTyping.value) {
      displayedName.value = newName || '';
    }
  }, { immediate: true });

  return {
    profileUserInfo,
    displayedName,
    isTyping,
    cursorPosition,
    userInfo,
    loadProfileInfo,
    handleNameHover,
    handleNameLeave
  };
}

