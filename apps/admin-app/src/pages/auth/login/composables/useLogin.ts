import { ref, reactive, nextTick } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { requestAdapter } from '@/utils/requestAdapter';
import { useUser } from '@/composables/useUser';
import { appStorage } from '@/utils/app-storage';

export function useLogin() {
  const router = useRouter();
  const { setUserInfo } = useUser();
  const { t } = useI18n();

  // 表单数据
  // 从统一存储中获取用户名
  const getStoredUsername = (): string => {
    return appStorage.user.getUsername() || '';
  };

  const form = reactive({
    username: getStoredUsername(),
    password: ''
  });

  // 加载状态
  const loading = ref(false);

  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('请输入密码'), trigger: 'blur' }
    ]
  };

  // 提交登录
  const submit = async () => {
    // 基础验证
    if (!form.username) {
      BtcMessage.error(t('用户名不能为空'));
      return;
    }

    if (!form.password) {
      BtcMessage.error(t('密码不能为空'));
      return;
    }

    try {
      loading.value = true;

      // 调用登录接口
      const response = await requestAdapter.post<{
        token: string;
        expiresIn?: number;
        user?: any;
      }>(
        '/base/open/login',
        {
          username: form.username,
          password: form.password
        },
        { notifySuccess: false }
      );

      if (response) {
        BtcMessage.success(t('登录成功'));

        // 保存 token（如果响应中包含）
        if (response.token) {
          appStorage.auth.setToken(response.token);
        }

        // 保存用户信息
        if (response.user) {
          setUserInfo(response.user);
        }

        // 保存用户名到统一存储（记住用户名）
        appStorage.user.setUsername(form.username);

        // 使用 nextTick 确保状态更新后再跳转
        await nextTick();
        router.push('/');
      } else {
        BtcMessage.error(t('登录失败'));
      }
    } catch (error: any) {
      // 安全地记录错误信息
      const errorInfo = {
        message: error.message || 'Unknown error',
        response: error.response
      };
      console.error('登录错误:', errorInfo);
      BtcMessage.error(error.message || t('登录失败'));
      
      // 返回错误，让调用方刷新验证码
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    rules,
    submit
  };
}

