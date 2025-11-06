/**
 * 个人信息表单相关逻辑
 */

import { computed, ref, h, markRaw } from 'vue';
import { ElMessage, ElButton, ElInput } from 'element-plus';
import { useBtcForm, useSmsCode } from '@btc/shared-core';
import { service } from '@services/eps';
import type { Ref } from 'vue';
import { appStorage } from '@/utils/app-storage';
import BtcSmsCodeInput from '@/pages/auth/shared/components/sms-code-input/index.vue';

/**
 * 个人信息表单 composable
 */
export function useProfileForm(
  userInfo: Ref<any>,
  showFullInfo: Ref<boolean>,
  loadUserInfo: (showFull: boolean) => Promise<void>,
  onRequestVerify?: (field: string) => void,
  onSetVerifyCallback?: (callback: () => void) => void
) {
  const { Form } = useBtcForm();

  // 在 setup 阶段创建 useSmsCode 实例，避免在渲染函数中调用导致生命周期钩子问题
  const sendSmsCodeWrapper = async (data: { phone: string; smsType?: string }) => {
    const profileService = service.system?.base?.profile;
    if (!profileService) {
      throw new Error('用户信息服务不可用');
    }
    // EPS 服务：POST /api/system/base/profile/bind/phone/send
    // 绑定流程使用 bindPhone 方法，smsType 为 'bind'
    await profileService.bindPhone({
      phone: data.phone,
      smsType: data.smsType || 'bind'
    });
  };

  const phoneUpdateSmsCodeState = useSmsCode({
    sendSmsCode: sendSmsCodeWrapper,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      ElMessage.success('验证码已发送');
    },
    onError: (error) => {
      ElMessage.error(error.message || '发送验证码失败');
    }
  });

  /**
   * 表单配置
   */
  const formItems = computed(() => [
    {
      prop: 'avatar',
      label: '头像',
      span: 24,
      component: {
        name: 'btc-upload',
        props: {
          type: 'image',
          uploadType: 'avatar',
          text: '选择头像',
          size: [100, 100],
          limitSize: 5
        }
      }
    },
    {
      prop: 'realName',
      label: '姓名',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入姓名'
        }
      }
    },
    {
      prop: 'name',
      label: '英文名',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入英文名'
        }
      }
    },
    {
      prop: 'employeeId',
      label: '工号',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '工号',
          disabled: true
        }
      }
    },
    {
      prop: 'position',
      label: '职位',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入职位'
        }
      }
    },
    {
      prop: 'email',
      label: '邮箱',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入邮箱'
        }
      },
      rules: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ]
    },
    {
      prop: 'phone',
      label: '手机号',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入手机号'
        }
      },
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    },
    {
      prop: 'initPass',
      label: '密码',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          type: 'password',
          placeholder: '请输入密码',
          showPassword: true
        }
      },
      rules: [
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ]
    }
  ]);

  /**
   * 打开编辑表单
   */
  const handleEdit = async () => {
    // 完整编辑表单不需要验证，直接打开
    openEditForm();
  };

  /**
   * 打开编辑表单（内部方法）
   */
  const openEditForm = () => {
    Form.value?.open({
      title: '编辑个人信息',
      width: '800px',
      form: {
        id: userInfo.value.id || '',
        realName: userInfo.value.realName || '',
        name: userInfo.value.name || '',
        employeeId: userInfo.value.employeeId || '',
        position: userInfo.value.position || '',
        email: userInfo.value.email || '',
        phone: userInfo.value.phone || '',
        avatar: userInfo.value.avatar || '',
        initPass: '' // 密码字段不显示已有值，让用户输入新密码
      },
      items: formItems.value,
      props: {
        labelWidth: '100px',
        labelPosition: 'top'
      },
      op: {
        buttons: ['save', 'close']
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const profileService = service.system?.base?.profile;
            if (!profileService) {
              ElMessage.warning('用户信息服务不可用');
              done();
              return;
            }

            // 分别处理需要特殊接口的字段
            const updateData: any = { ...data };

            // 验证手机号：如果原值存在，新值不能为空（只能换绑，不能删除）
            if (updateData.phone !== undefined) {
              const originalPhone = userInfo.value.phone;
              const hasOriginalPhone = originalPhone && originalPhone !== '-' && originalPhone.trim() !== '';
              const newPhone = updateData.phone || '';
              
              if (hasOriginalPhone && newPhone.trim() === '') {
                ElMessage.warning('手机号不能为空，只能换绑，不能删除');
                done();
                return;
              }

            // 如果修改了手机号，使用专门的接口
              if (newPhone !== originalPhone && newPhone.trim() !== '') {
              await profileService.phone({
                  phone: newPhone
              });
              }
              delete updateData.phone;
            }

            // 验证邮箱：如果原值存在，新值不能为空（只能换绑，不能删除）
            if (updateData.email !== undefined) {
              const originalEmail = userInfo.value.email;
              const hasOriginalEmail = originalEmail && originalEmail !== '-' && originalEmail.trim() !== '';
              const newEmail = updateData.email || '';
              
              if (hasOriginalEmail && newEmail.trim() === '') {
                ElMessage.warning('邮箱不能为空，只能换绑，不能删除');
                done();
                return;
            }

            // 如果修改了邮箱，使用专门的接口
              if (newEmail !== originalEmail && newEmail.trim() !== '') {
              await profileService.email({
                  email: newEmail
              });
              }
              delete updateData.email;
            }

            // 如果修改了密码，使用专门的接口
            if (updateData.initPass && updateData.initPass.trim() !== '') {
              await profileService.password({
                initPass: updateData.initPass
              });
              delete updateData.initPass;
            }

            // 如果还有其他字段需要更新，使用通用更新接口
            if (Object.keys(updateData).length > 1 || (Object.keys(updateData).length === 1 && !updateData.id)) {
              await profileService.update(updateData);
            }

            // 如果更新了头像，更新统一存储
            if (data.avatar) {
              appStorage.user.setAvatar(data.avatar);
            }
            // 如果更新了用户名，更新统一存储
            if (data.name) {
              appStorage.user.setName(data.name);
            }

            // 同时更新 useUser 中的信息
            const { useUser } = await import('@/composables/useUser');
            const { getUserInfo, setUserInfo } = useUser();
            const currentUser = getUserInfo();
            if (currentUser) {
              setUserInfo({
                ...currentUser,
                ...(data.avatar && { avatar: data.avatar }),
                ...(data.name && { name: data.name }),
                ...(data.position && { position: data.position }),
              });
            }

            // 触发自定义事件，通知顶栏更新
            window.dispatchEvent(new CustomEvent('userInfoUpdated', {
              detail: {
                avatar: data.avatar || userInfo.value.avatar,
                name: data.name || userInfo.value.name
              }
            }));

            ElMessage.success('保存成功');
            close();

            // 重新加载用户信息
            await loadUserInfo(showFullInfo.value);
          } catch (error: any) {
            console.error('保存用户信息失败:', error);
            ElMessage.error(error?.message || '保存失败');
            done();
          }
        }
      }
    });
  };

  /**
   * 编辑单个字段
   */
  const handleEditField = async (field: string) => {
    // 对于手机号和邮箱，检查当前值是否为空
    if (field === 'phone' || field === 'email') {
      const currentValue = userInfo.value[field];
      const isEmpty = !currentValue || currentValue === '-' || currentValue.trim() === '';
      
      // 如果为空，直接打开绑定弹窗（跳过身份验证）
      if (isEmpty) {
        handleBindField(field);
        return;
      }
    }

    // 定义需要验证的字段
    const fieldsRequiringVerify = ['phone', 'email', 'initPass'];

    // 只有编辑手机号、邮箱、密码时才需要验证
    if (fieldsRequiringVerify.includes(field) && onRequestVerify && onSetVerifyCallback) {
      onSetVerifyCallback(() => {
        // 验证成功后打开字段编辑表单
        openFieldEditForm(field);
      });
      // 传递当前编辑的字段信息
      onRequestVerify(field);
        return;
      }

    // 其他字段直接打开表单，不需要验证
    openFieldEditForm(field);
  };

  /**
   * 绑定字段（直接打开绑定弹窗，不需要身份验证）
   */
  const handleBindField = (field: string) => {
    // 绑定字段不需要通过 onRequestVerify，因为绑定流程由主页面直接处理
    // 这个函数保留是为了兼容性，实际绑定逻辑在主页面的 handleBindField 中
  };

  /**
   * 打开字段编辑表单（内部方法）
   */
  const openFieldEditForm = (field: string) => {
    // 根据字段获取对应的表单项配置
    const fieldConfig: Record<string, any> = {
      realName: {
        prop: 'realName',
        label: '姓名',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入姓名'
          }
        }
      },
      name: {
        prop: 'name',
        label: '英文名',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入英文名'
          }
        }
      },
      position: {
        prop: 'position',
        label: '职位',
        span: 24,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入职位'
          }
        }
      },
      email: {
        items: [
          {
            prop: 'email',
            label: '新邮箱',
            span: 24,
            required: true,
            component: {
              name: 'el-input',
              props: {
                placeholder: '请输入新邮箱'
              },
              slots: {
                suffix: ({ scope }: any) => {
                  // 邮箱验证码状态管理（手动实现，因为 useSmsCode 只支持手机号）
                  const emailCountdown = ref(0);
                  const emailSending = ref(false);
                  let emailTimer: ReturnType<typeof setInterval> | null = null;

                  const sendEmailCode = async () => {
                    if (emailCountdown.value > 0 || emailSending.value || !scope.email) {
                      return;
                    }

                    if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(scope.email)) {
                      ElMessage.warning('请输入正确的邮箱地址');
                      return;
                    }

                    emailSending.value = true;
                    try {
                      const profileService = service.system?.base?.profile;
                      if (!profileService) {
                        throw new Error('用户信息服务不可用');
                      }
                      // EPS 服务：GET /api/system/base/profile/email/send（无参数）
                      await profileService.sendEmail();
                      ElMessage.success('验证码已发送');

                      // 开始倒计时
                      emailCountdown.value = 60;
                      if (emailTimer) {
                        clearInterval(emailTimer);
                      }
                      emailTimer = setInterval(() => {
                        emailCountdown.value--;
                        if (emailCountdown.value <= 0) {
                          if (emailTimer) {
                            clearInterval(emailTimer);
                            emailTimer = null;
                          }
                        }
                      }, 1000);
                    } catch (error: any) {
                      ElMessage.error(error.message || '发送验证码失败');
                    } finally {
                      emailSending.value = false;
                    }
                  };

                  return h(ElButton, {
                    link: true,
                    size: 'small',
                    disabled: emailCountdown.value > 0 || emailSending.value || !scope.email,
                    loading: emailSending.value,
                    onClick: sendEmailCode
                  }, () => emailCountdown.value > 0 ? `${emailCountdown.value}s` : '获取验证码');
                }
              }
            },
            rules: [
              { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
            ]
          },
          {
            prop: 'emailCode',
            label: '验证码',
            span: 24,
            required: true,
            component: {
              vm: markRaw(BtcSmsCodeInput),
              props: {}
            },
            rules: [
              { required: true, message: '请输入验证码', trigger: 'blur' },
              { len: 6, message: '验证码长度为6位', trigger: 'blur' }
            ]
          }
        ]
      },
      phone: {
        items: [
          {
            prop: 'phone',
            label: '新手机号',
            span: 24,
            required: true,
            component: {
              name: 'el-input',
              props: {
                placeholder: '请输入新手机号'
              },
              slots: {
                suffix: ({ scope }: any) => {
                  // 使用在 setup 阶段创建的 useSmsCode 实例
                  return h(ElButton, {
                    link: true,
                    size: 'small',
                    disabled: !phoneUpdateSmsCodeState.canSend.value || !scope.phone,
                    loading: phoneUpdateSmsCodeState.sending.value,
                    onClick: async () => {
                      if (!scope.phone || !/^1[3-9]\d{9}$/.test(scope.phone)) {
                        ElMessage.warning('请输入正确的手机号');
                        return;
                      }
                      await phoneUpdateSmsCodeState.send(scope.phone, 'bind');
                    }
                  }, () => phoneUpdateSmsCodeState.countdown.value > 0 ? `${phoneUpdateSmsCodeState.countdown.value}s` : '获取验证码');
                }
              }
            },
            rules: [
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
            ]
          },
          {
            prop: 'smsCode',
            label: '验证码',
            span: 24,
            required: true,
            component: {
              vm: markRaw(BtcSmsCodeInput),
              props: {}
            },
            rules: [
              { required: true, message: '请输入验证码', trigger: 'blur' },
              { len: 6, message: '验证码长度为6位', trigger: 'blur' }
            ]
          }
        ]
      },
      initPass: {
        items: [
          {
            prop: 'initPass',
            label: '新密码',
            span: 24,
            required: true,
            component: {
              name: 'el-input',
              props: {
                type: 'password',
                placeholder: '请输入新密码',
                showPassword: true
              }
            },
            rules: [
              { required: true, message: '请输入新密码', trigger: 'blur' },
              { min: 6, message: '密码长度至少6位', trigger: 'blur' }
            ]
          },
          {
            prop: 'confirmPassword',
            label: '确认密码',
            span: 24,
            required: true,
            component: {
              name: 'el-input',
              props: {
                type: 'password',
                placeholder: '请再次输入新密码',
                showPassword: true
              }
            },
            rules: [
              { required: true, message: '请确认密码', trigger: 'blur' },
              {
                validator: (rule: any, value: any, callback: any) => {
                  // 通过闭包访问表单数据（需要在创建表单时动态设置）
                  // 这里先不验证，在提交时统一验证
                  callback();
                },
                trigger: 'blur'
              }
            ]
          }
        ]
      }
    };

    const config = fieldConfig[field];
    if (!config) {
      ElMessage.warning('该字段不支持编辑');
      return;
    }

    // 获取表单项（单个字段或多个字段）
    const items = config.items || [config];

    // 构建表单初始值
    const formData: any = {
      id: userInfo.value.id || ''
    };

    if (field === 'phone') {
      formData.phone = '';
      formData.smsCode = '';
    } else if (field === 'email') {
      formData.email = '';
      formData.emailCode = '';
    } else if (field === 'initPass') {
      formData.initPass = '';
      formData.confirmPassword = '';
    } else {
      formData[field] = userInfo.value[field] || '';
    }

    Form.value?.open({
      title: `编辑${config.label || items[0].label}`,
      width: '500px',
      form: formData,
      items: items,
      props: {
        labelWidth: '100px',
        labelPosition: 'top'
      },
      op: {
        buttons: ['save', 'close']
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const profileService = service.system?.base?.profile;
            if (!profileService) {
              ElMessage.warning('用户信息服务不可用');
              done();
              return;
            }

            // 根据字段类型调用不同的接口
            if (field === 'phone') {
              // 验证手机号不能为空（只能换绑，不能删除）
              const originalPhone = userInfo.value.phone;
              const hasOriginalPhone = originalPhone && originalPhone !== '-' && originalPhone.trim() !== '';
              const newPhone = data.phone || '';
              
              if (!newPhone || newPhone.trim() === '') {
                ElMessage.warning('手机号不能为空');
                done();
                return;
              }
              
              // 如果原值存在，确保新值不为空（只能换绑）
              if (hasOriginalPhone && newPhone.trim() === '') {
                ElMessage.warning('手机号不能为空，只能换绑，不能删除');
                done();
                return;
              }
              
              if (!data.smsCode || data.smsCode.length !== 6) {
                ElMessage.warning('请输入6位验证码');
                done();
                return;
              }
              await profileService.phone({
                phone: data.phone,
                smsCode: data.smsCode
              });
            } else if (field === 'email') {
              // 验证邮箱不能为空（只能换绑，不能删除）
              const originalEmail = userInfo.value.email;
              const hasOriginalEmail = originalEmail && originalEmail !== '-' && originalEmail.trim() !== '';
              const newEmail = data.email || '';
              
              if (!newEmail || newEmail.trim() === '') {
                ElMessage.warning('邮箱不能为空');
                done();
                return;
              }
              
              // 如果原值存在，确保新值不为空（只能换绑）
              if (hasOriginalEmail && newEmail.trim() === '') {
                ElMessage.warning('邮箱不能为空，只能换绑，不能删除');
                done();
                return;
              }
              
              if (!data.emailCode || data.emailCode.length !== 6) {
                ElMessage.warning('请输入6位验证码');
                done();
                return;
              }
              await profileService.email({
                email: data.email,
                emailCode: data.emailCode
              });
            } else if (field === 'initPass') {
              // 使用专门的密码更新接口
              if (!data.initPass || data.initPass.trim() === '') {
                ElMessage.warning('密码不能为空');
                done();
                return;
              }
              if (data.initPass !== data.confirmPassword) {
                ElMessage.warning('两次输入的密码不一致');
                done();
                return;
              }
              await profileService.password({
                initPass: data.initPass
              });
            } else {
              // 其他字段使用通用的更新接口
              const updatePayload: any = {
                id: userInfo.value.id
              };
              updatePayload[field] = data[field];
              await profileService.update(updatePayload);
            }

            // 如果更新的是 name（用户名），更新统一存储
            if (field === 'name' && data.name) {
              appStorage.user.setName(data.name);
              // 同时更新 useUser 中的信息
              const { useUser } = await import('@/composables/useUser');
              const { getUserInfo, setUserInfo } = useUser();
              const currentUser = getUserInfo();
              if (currentUser) {
                setUserInfo({
                  ...currentUser,
                  name: data.name
                });
              }

              // 触发自定义事件，通知顶栏更新
              window.dispatchEvent(new CustomEvent('userInfoUpdated', {
                detail: {
                  name: data.name,
                  avatar: userInfo.value.avatar
                }
              }));
            }

            ElMessage.success('保存成功');
            close();

            // 重新加载用户信息
            await loadUserInfo(showFullInfo.value);
          } catch (error: any) {
            console.error('保存用户信息失败:', error);
            ElMessage.error(error?.message || '保存失败');
            done();
          }
        }
      }
    });
  };

  /**
   * 编辑头像
   */
  const handleEditAvatar = async () => {
    // 编辑头像不需要验证，直接打开表单
    openAvatarEditForm();
  };

  /**
   * 打开头像编辑表单（内部方法）
   */
  const openAvatarEditForm = () => {
    Form.value?.open({
      title: '编辑头像',
      width: '500px',
      form: {
        id: userInfo.value.id || '',
        avatar: userInfo.value.avatar || ''
      },
      items: [
        {
          prop: 'avatar',
          label: '头像',
          span: 24,
          component: {
            name: 'btc-upload',
            props: {
              type: 'image',
              uploadType: 'avatar',
              text: '选择头像',
              size: [100, 100],
              limitSize: 5
            }
          }
        }
      ],
      props: {
        labelWidth: '100px',
        labelPosition: 'top'
      },
      op: {
        buttons: ['save', 'close']
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const profileService = service.system?.base?.profile;
            if (!profileService) {
              ElMessage.warning('用户信息服务不可用');
              done();
              return;
            }

            // 调用更新接口
            await profileService.update({
              id: userInfo.value.id,
              avatar: data.avatar
            });

            ElMessage.success('保存成功');
            close();

            // 重新加载用户信息
            await loadUserInfo(showFullInfo.value);
          } catch (error: any) {
            console.error('保存用户信息失败:', error);
            ElMessage.error(error?.message || '保存失败');
            done();
          }
        }
      }
    });
  };

  return {
    Form,
    formItems,
    handleEdit,
    handleEditField,
    handleBindField,
    handleEditAvatar
  };
}

