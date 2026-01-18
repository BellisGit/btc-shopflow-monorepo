<template>
  <div class="page">
    <!-- 空白页，授权页会覆盖显示 -->
  </div>
</template>

<script setup lang="ts">
import { showToast, showLoadingToast, closeToast } from 'vant';
import { getPhoneNumberServer, getAuthTokens, getPhoneWithToken } from '@/utils/phone-auth';
import logoUrl from '@/assets/images/logo.png';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcMobilePhoneAuthor',
});

const router = useRouter();

// 获取 logo 的完整 URL
const getLogoUrl = (): string => {
  // 如果 logoUrl 已经是完整 URL，直接返回
  if (
    logoUrl.startsWith('http://') ||
    logoUrl.startsWith('https://') ||
    logoUrl.startsWith('data:')
  ) {
    return logoUrl;
  }

  // 如果是相对路径，构建完整 URL
  // 开发环境: logoUrl 可能是 '/src/assets/logo.png' 或 '/logo-xxx.png'
  // 生产环境: logoUrl 可能是 '/assets/logo-xxx.png'
  if (logoUrl.startsWith('/')) {
    // 已经是绝对路径，直接使用
    return logoUrl;
  }

  // 否则使用当前域名 + 路径
  return `${window.location.origin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
};

onMounted(async () => {
  console.info('PhoneAuthor 页面加载，开始调用 checkLoginAvailable');

  try {
    // 显示加载提示
    showLoadingToast({
      message: '正在验证...',
      forbidClick: true,
      duration: 0,
    });

    // 1. 获取 accessToken 和 jwtToken
    console.info('步骤1: 获取 accessToken 和 jwtToken');
    const { accessToken, jwtToken } = await getAuthTokens();
    console.info('获取Token成功:', {
      accessToken: accessToken?.substring(0, 20) + '...',
      jwtToken: jwtToken?.substring(0, 20) + '...',
    });

    // 2. 获取 phoneNumberServer 实例
    console.info('步骤2: 获取 phoneNumberServer 实例');
    const phoneNumberServer = await getPhoneNumberServer();

    // 3. 调用 checkLoginAvailable 方法进行身份鉴权
    console.info('步骤3: 调用 checkLoginAvailable 进行身份鉴权');
    phoneNumberServer.checkLoginAvailable({
      accessToken,
      jwtToken,
      success: async (res: any) => {
        console.info('鉴权结果:', res);
        console.info('鉴权结果详细数据:', JSON.stringify(res, null, 2));

        // 判断鉴权是否成功：code === 600000 或 code === 'OK' 或 success === true
        const isSuccess = res.code === 600000 || res.code === 'OK' || res.success === true;

        if (isSuccess) {
          console.info('鉴权成功，开始调用 getLoginToken 显示授权页');
          // 关闭加载提示，让授权页显示
          closeToast();

          // 根据官方文档，在鉴权成功的回调中必须调用 getLoginToken 才能显示授权页
          // 参考文档：https://help.aliyun.com/zh/pnvs/developer-reference/h5-client-access
          phoneNumberServer.getLoginToken({
            /**
             * authPageOption (object, 必填)
             * 授权页配置选项，用于配置授权页的样式、行为等
             * 详细配置请参考 authPageOption 字段说明
             * 可以配置：标题、logo、按钮样式、协议链接等
             */
            authPageOption: {
              // 不隐藏授权页，让授权页正常显示
              // 确保授权页的 z-index 足够高，能够覆盖页面
              style: {
                zIndex: 9999,
              },
              // 配置 logo 图片，使用本地 logo.png 替换阿里云默认 logo
              // logo 参数需要传入图片的完整 URL 或可访问的路径
              logoImg: getLogoUrl(),
              // 可以在这里配置更多授权页选项，例如：
              // - title: 授权页标题
              // - loginBtnText: 登录按钮文字
              // - protocolList: 协议列表
              // 等等，具体参考 authPageOption 字段说明
            },

            /**
             * timeout (number, 可选)
             * 超时时间，单位：秒
             * 建议不低于2秒，默认为3秒
             * 如果授权页在指定时间内没有响应，会触发 error 回调
             */
            // timeout: 5, // 可选，设置5秒超时

            /**
             * success (function, 必填)
             * 成功回调函数
             * 当用户完成授权并点击登录/注册按钮后，SDK会返回 spToken（或 pToken）
             * 入参 res 包含：
             *   - spToken: 一键登录Token（H5场景返回spToken）
             *   - pToken: 一键登录Token（部分场景可能返回pToken）
             * 需要将 spToken/pToken 传给后端，后端调用 GetPhoneWithToken 接口获取完整手机号
             */
            success: async (tokenRes: any) => {
              console.info('获取Token成功:', tokenRes);

              // 根据阿里云文档，H5场景通常返回 spToken
              const spToken = tokenRes.spToken;

              if (!spToken) {
                logger.error('未获取到spToken');
                showToast({
                  message: '未获取到登录Token',
                  type: 'fail',
                  duration: 3000,
                });
                // 跳转到登录页面
                setTimeout(() => {
                  router.push({ name: 'Login' });
                }, 2000);
                return;
              }

              console.info('获取到spToken:', spToken.substring(0, 20) + '...');

              try {
                // 显示加载提示
                showLoadingToast({
                  message: '正在登录...',
                  forbidClick: true,
                  duration: 0,
                });

                // 调用后端接口，携带 spToken 参数
                // 使用 phone-auth.ts 中的 getPhoneWithToken，它返回的格式是 { code, msg, data }
                const response = await getPhoneWithToken(spToken);

                // 关闭加载提示
                closeToast();

                // 判断是否登录成功（返回 200）
                if (response.code === 200) {
                  console.info('登录成功:', response.data);

                  showToast({
                    message: '登录成功',
                    type: 'success',
                    duration: 2000,
                  });

                  // 登录成功，后端已经设置了 httpOnly cookie
                  // 直接跳转，不需要更新 authStore，后端会通过 cookie 验证
                  const redirect = (router.currentRoute.value.query.oauth_callback as string);
                  if (redirect) {
                    // 如果有 oauth_callback 参数，使用它
                    const redirectPath = redirect.split('?')[0];
                    window.location.href = redirectPath;
                  } else {
                    // 默认跳转到查询页面
                    window.location.href = '/query';
                  }
                } else {
                  // 登录失败
                  logger.error('登录失败:', response.msg);
                  showToast({
                    message: response.msg || '登录失败',
                    type: 'fail',
                    duration: 3000,
                  });
                  // 跳转到登录页面
                  setTimeout(() => {
                    router.push({ name: 'Login' });
                  }, 3000);
                }
              } catch (error: any) {
                // 关闭加载提示
                closeToast();

                logger.error('调用登录接口失败:', error);

                // 根据错误类型显示不同的提示信息
                let errorMessage = '登录失败，请稍后重试';
                if (error?.response?.data?.msg) {
                  errorMessage = error.response.data.msg;
                } else if (error?.message) {
                  errorMessage = error.message;
                }

                showToast({
                  message: errorMessage,
                  type: 'fail',
                  duration: 3000,
                });

                // 跳转到登录页面
                setTimeout(() => {
                  router.push({ name: 'Login' });
                }, 3000);
              }
            },

            /**
             * error (function, 必填)
             * 失败回调函数
             * 当获取Token失败时触发，可能的原因：
             * - 用户取消授权
             * - 网络错误
             * - 超时
             * - 其他错误
             * 入参 res 包含错误信息：message 或 msg
             */
            error: (tokenRes: any) => {
              logger.error('获取Token失败:', tokenRes);
              closeToast();
              const errorMsg = tokenRes.message || tokenRes.msg || '获取登录Token失败';
              showToast({
                message: errorMsg,
                type: 'fail',
                duration: 3000,
              });
              // 跳转到登录页面
              setTimeout(() => {
                router.push({ name: 'Login' });
              }, 3000);
            },

            /**
             * watch (function, 可选)
             * 授权页状态监听函数
             * 用于监听授权页的状态变化，例如：显示、隐藏、准备就绪等
             * 入参：
             *   - status: 状态字符串，可能的值：'show'、'display'、'ready'、'hide' 等
             *   - data: 状态相关的数据，可能包含手机号掩码等信息
             */
            watch: (status: any, data: any) => {
              // 用户取消授权（status === 2）
              if (status === 2) {
                phoneNumberServer.closeLoginPage(); // 调用此方法手动关闭授权页
                closeToast();
                // 跳转到登录页面
                router.push({ name: 'Login' });
              }
            },

            /**
             * protocolPageWatch (function, 可选)
             * 预授权页状态监听函数
             * 当 authPageOption 中 isPrePageType 参数为 true 时，需要填入此函数
             * 用于监听预授权页的状态变化
             * 入参格式与 watch 相同：status 和 data
             */
            // protocolPageWatch: (status: string, data: any) => {
            //   console.info('预授权页状态:', status, data)
            // },

            /**
             * previewPrivacyWatch (function, 可选)
             * 协议预览弹窗状态监听函数
             * 用于监听协议预览弹窗的状态变化
             * 当用户点击协议链接查看协议详情时触发
             * 入参格式与 watch 相同：status 和 data
             */
            // previewPrivacyWatch: (status: string, data: any) => {
            //   console.info('协议预览弹窗状态:', status, data)
            // },

            /**
             * privacyAlertWatch (function, 可选)
             * 二次弹窗页面状态监听函数
             * 用于监听二次弹窗（隐私协议弹窗）的状态变化
             * 入参格式与 watch 相同：status 和 data
             */
            // privacyAlertWatch: (status: string, data: any) => {
            //   console.info('二次弹窗状态:', status, data)
            // },
          });
        } else {
          closeToast();
          logger.error('鉴权失败，code:', res.code, 'message:', res.message || res.msg);
          showToast({
            message: res.message || res.msg || '鉴权失败',
            type: 'fail',
            duration: 3000,
          });
          // 跳转到登录页面
          setTimeout(() => {
            router.push({ name: 'Login' });
          }, 3000);
        }
      },
      error: (res: any) => {
        closeToast();
        logger.error('鉴权失败:', res);

        // 鉴权失败，可能是网络环境问题（需要移动数据网络）
        const errorMsg =
          res.message || res.msg || '鉴权失败，请关闭WiFi或使用其他登录方式';
        showToast({
          message: errorMsg,
          type: 'fail',
          duration: 3000,
        });
        // 跳转到登录页面
        setTimeout(() => {
          router.push({ name: 'Login' });
        }, 3000);
      },
    });
  } catch (error: any) {
    closeToast();
    logger.error('调用 checkLoginAvailable 失败:', error);

    // 根据错误类型显示不同的提示信息
    let errorMessage = '一键登录失败，请使用其他方式登录';

    if (error?.message) {
      if (
        error.message.includes('WiFi') ||
        error.message.includes('Wi-Fi') ||
        error.message.includes('网络')
      ) {
        errorMessage = '请关闭WiFi并开启移动数据网络后重试，或使用其他登录方式';
      } else {
        errorMessage = error.message;
      }
    }

    showToast({
      message: errorMessage,
      type: 'fail',
      duration: 3000,
    });
    // 跳转到登录页面
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  }
});
</script>

<style scoped lang="scss">

</style>

<style>
/* 确保阿里云授权页能够正确覆盖页面 */
[id*="aliyun"],
[class*="aliyun"],
[id*="numberAuth"],
[class*="numberAuth"],
[class*="auth-page"],
[id*="auth-page"],
.dialog-type-container {
  z-index: 9999 !important;
  position: fixed !important;
}
.page-type-container .submit-btn {
  background: rgb(22, 93, 224);
}
</style>
