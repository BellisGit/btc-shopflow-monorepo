<template>
  <div class="context-menu-demo">
    <div class="demo-section">
      <h2>右键菜单组件示例</h2>

      <!-- 基础用法 -->
      <div class="demo-item">
        <h3>基础用法</h3>
        <div class="demo-content">
          <el-button @contextmenu="onBasicContextMenu">
            右键点击我
          </el-button>
        </div>
      </div>

      <!-- 带图标的菜单 -->
      <div class="demo-item">
        <h3>带图标的菜单</h3>
        <div class="demo-content">
          <el-button @contextmenu="onIconContextMenu">
            带图标的右键菜单
          </el-button>
        </div>
      </div>

      <!-- 多层级菜单 -->
      <div class="demo-item">
        <h3>多层级菜单</h3>
        <div class="demo-content">
          <el-button @contextmenu="onNestedContextMenu">
            多层级右键菜单
          </el-button>
        </div>
      </div>

      <!-- 动态菜单项 -->
      <div class="demo-item">
        <h3>动态菜单项</h3>
        <div class="demo-content">
          <el-button @contextmenu="onDynamicContextMenu">
            动态菜单项
          </el-button>
        </div>
      </div>

      <!-- 在表格中使用 -->
      <div class="demo-item">
        <h3>在表格中使用</h3>
        <div class="demo-content">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="age" label="年龄" />
            <el-table-column prop="address" label="地址" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  size="small"
                  @contextmenu="(e) => onTableContextMenu(e, scope.row)"
                  @click.stop
                >
                  右键
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue';
import { ContextMenu } from '@btc/shared-components';
import { ElMessage } from 'element-plus';
import { Edit, Delete, View, Plus, Download, Upload } from '@element-plus/icons-vue';

// 表格数据
const tableData = ref([
  { name: '张三', age: 25, address: '北京市朝阳区' },
  { name: '李四', age: 30, address: '上海市浦东新区' },
  { name: '王五', age: 28, address: '广州市天河区' }
]);

// 基础右键菜单
const onBasicContextMenu = (e: MouseEvent) => {
  ContextMenu.open(e, {
    list: [
      {
        label: '新增',
        callback: (done) => {
          ElMessage.success('新增操作');
          done();
        }
      },
      {
        label: '编辑',
        callback: (done) => {
          ElMessage.success('编辑操作');
          done();
        }
      },
      {
        label: '删除',
        callback: (done) => {
          ElMessage.success('删除操作');
          done();
        }
      }
    ]
  });
};

// 带图标的右键菜单
const onIconContextMenu = (e: MouseEvent) => {
  ContextMenu.open(e, {
    list: [
      {
        label: '新增',
        prefixIcon: markRaw(Plus),
        callback: (done) => {
          ElMessage.success('新增操作');
          done();
        }
      },
      {
        label: '编辑',
        prefixIcon: markRaw(Edit),
        callback: (done) => {
          ElMessage.success('编辑操作');
          done();
        }
      },
      {
        label: '查看',
        prefixIcon: markRaw(View),
        callback: (done) => {
          ElMessage.success('查看操作');
          done();
        }
      },
      {
        label: '删除',
        prefixIcon: markRaw(Delete),
        callback: (done) => {
          ElMessage.success('删除操作');
          done();
        }
      }
    ]
  });
};

// 多层级右键菜单
const onNestedContextMenu = (e: MouseEvent) => {
  ContextMenu.open(e, {
    list: [
      {
        label: '文件操作',
        prefixIcon: markRaw(Plus),
        children: [
          {
            label: '新建文件',
            callback: (done) => {
              ElMessage.success('新建文件');
              done();
            }
          },
          {
            label: '新建文件夹',
            callback: (done) => {
              ElMessage.success('新建文件夹');
              done();
            }
          }
        ]
      },
      {
        label: '编辑操作',
        prefixIcon: markRaw(Edit),
        children: [
          {
            label: '复制',
            callback: (done) => {
              ElMessage.success('复制操作');
              done();
            }
          },
          {
            label: '粘贴',
            callback: (done) => {
              ElMessage.success('粘贴操作');
              done();
            }
          },
          {
            label: '剪切',
            callback: (done) => {
              ElMessage.success('剪切操作');
              done();
            }
          }
        ]
      },
      {
        label: '导入导出',
        prefixIcon: markRaw(Download),
        children: [
          {
            label: '导入',
            prefixIcon: markRaw(Upload),
            callback: (done) => {
              ElMessage.success('导入操作');
              done();
            }
          },
          {
            label: '导出',
            prefixIcon: markRaw(Download),
            callback: (done) => {
              ElMessage.success('导出操作');
              done();
            }
          }
        ]
      }
    ]
  });
};

// 动态菜单项
const onDynamicContextMenu = (e: MouseEvent) => {
  const isAdmin = Math.random() > 0.5; // 模拟权限判断

  ContextMenu.open(e, {
    list: [
      {
        label: '基础操作',
        callback: (done) => {
          ElMessage.success('基础操作');
          done();
        }
      },
      {
        label: '高级操作',
        disabled: !isAdmin,
        callback: (done) => {
          ElMessage.success('高级操作');
          done();
        }
      },
      {
        label: '管理员操作',
        hidden: !isAdmin,
        callback: (done) => {
          ElMessage.success('管理员操作');
          done();
        }
      }
    ]
  });
};

// 表格中的右键菜单
const onTableContextMenu = (e: MouseEvent, row: any) => {
  ContextMenu.open(e, {
    list: [
      {
        label: '查看详情',
        prefixIcon: markRaw(View),
        callback: (done) => {
          ElMessage.success(`查看 ${row.name} 的详情`);
          done();
        }
      },
      {
        label: '编辑用户',
        prefixIcon: markRaw(Edit),
        callback: (done) => {
          ElMessage.success(`编辑 ${row.name}`);
          done();
        }
      },
      {
        label: '删除用户',
        prefixIcon: markRaw(Delete),
        callback: (done) => {
          ElMessage.success(`删除 ${row.name}`);
          done();
        }
      }
    ]
  });
};
</script>

<style scoped>
.context-menu-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section h2 {
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
}

.demo-item {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.demo-item h3 {
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
  font-size: 16px;
}

.demo-content {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.demo-content .el-button {
  margin-right: 10px;
}
</style>
