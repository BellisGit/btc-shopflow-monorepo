/**
 * 个人信息表单相关逻辑
 */

import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useBtcForm } from '@btc/shared-core';
import { service } from '@services/eps';
import type { Ref } from 'vue';

/**
 * 个人信息表单 composable
 */
export function useProfileForm(
  userInfo: Ref<any>,
  showFullInfo: Ref<boolean>,
  loadUserInfo: (showFull: boolean) => Promise<void>
) {
  const { Form } = useBtcForm();

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
    }
  ]);

  /**
   * 打开编辑表单
   */
  const handleEdit = async () => {
    // 需要先加载完整信息才能编辑
    if (!showFullInfo.value) {
      try {
        await loadUserInfo(true);
        showFullInfo.value = true;
      } catch (error) {
        ElMessage.error('无法加载完整信息，请稍后重试');
        return;
      }
    }

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
        avatar: userInfo.value.avatar || ''
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

            // 调用更新接口
            await profileService.update(data);

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
    // 需要先加载完整信息才能编辑
    if (!showFullInfo.value) {
      try {
        await loadUserInfo(true);
        showFullInfo.value = true;
      } catch (error) {
        ElMessage.error('无法加载完整信息，请稍后重试');
        return;
      }
    }

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
        prop: 'email',
        label: '邮箱',
        span: 24,
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
      phone: {
        prop: 'phone',
        label: '手机号',
        span: 24,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入手机号'
          }
        },
        rules: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    };

    const item = fieldConfig[field];
    if (!item) {
      ElMessage.warning('该字段不支持编辑');
      return;
    }

    Form.value?.open({
      title: `编辑${item.label}`,
      width: '500px',
      form: {
        id: userInfo.value.id || '',
        [field]: userInfo.value[field] || ''
      },
      items: [item],
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

            // 调用更新接口（只更新该字段）
            await profileService.update({
              id: userInfo.value.id,
              [field]: data[field]
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

  /**
   * 编辑头像
   */
  const handleEditAvatar = async () => {
    // 需要先加载完整信息才能编辑
    if (!showFullInfo.value) {
      try {
        await loadUserInfo(true);
        showFullInfo.value = true;
      } catch (error) {
        ElMessage.error('无法加载完整信息，请稍后重试');
        return;
      }
    }

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
    handleEditAvatar
  };
}

