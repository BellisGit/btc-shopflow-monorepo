<template>
  <el-button :disabled="disabled" :type="type" @click="triggerFileSelect">
    <BtcSvg name="import" :size="16" />
    {{ t('common.button.import') }}
  </el-button>

  <!-- 隐藏的文件输入元素 -->
  <input
    ref="fileInputRef"
    type="file"
    :accept="accept"
    style="display: none"
    @change="handleFileSelect"
  />

  <BtcForm ref="formRef">
    <template #slot-upload>
      <div v-if="!upload.filename" class="upload">
        <div class="tips" v-if="template">
          <span>{{ tips }}</span>
          <el-button type="primary" text bg @click="download">
            {{ t('common.button.download_template') }}
          </el-button>
        </div>

        <div class="inner">
          <el-upload
            drag
            :limit-size="limitSize"
            :accept="accept"
            :disabled="disabled"
            :auto-upload="false"
            :before-upload="onUpload"
            :style="{ width: '100%' }"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              {{ t('common.upload.drag_tip') }}
            </div>
            <template #tip>
              <div class="el-upload__tip">
                {{ t('common.upload.tip') }}
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </template>

    <template #slot-list>
      <div v-if="list.length" class="data-table">
        <div class="head">
          <el-button type="success" @click="clear">{{ t('common.button.reupload') }}</el-button>
          <el-button
            type="danger"
            :disabled="table.selection.length == 0"
            @click="table.del()"
          >
            {{ t('common.button.batch_delete') }}
          </el-button>
        </div>

        <div class="btc-table">
          <el-table
            border
            :data="list"
            max-height="600px"
            @selection-change="table.onSelectionChange"
            @row-click="
              (row: any) => {
                row._edit = true;
              }
            "
          >
            <el-table-column
              type="selection"
              width="60px"
              align="center"
              fixed="left"
            />

            <el-table-column
              :label="t('common.table.index')"
              type="index"
              width="80px"
              align="center"
              fixed="left"
              :index="table.onIndex"
            />

            <el-table-column
              v-for="item in table.header"
              :key="item"
              :prop="item"
              :label="item"
              min-width="160px"
              align="center"
            >
              <template #default="scope">
                <span v-if="!scope.row._edit">{{ scope.row[item] }}</span>

                <template v-else>
                  <el-input
                    v-model="scope.row[item]"
                    type="textarea"
                    clearable
                    :placeholder="item"
                  />
                </template>
              </template>
            </el-table-column>

            <el-table-column
              :label="t('common.table.operation')"
              width="100px"
              align="center"
              fixed="right"
            >
              <template #default="scope">
                <el-button
                  text
                  bg
                  type="danger"
                  @click.stop="table.del(scope.$index)"
                >
                  {{ t('common.button.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            background
            layout="total, prev, pager, next"
            :total="upload.list.length"
            :page-size="pagination.size"
            @current-change="pagination.onCurrentChange"
          />
        </div>
      </div>
    </template>
  </BtcForm>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type PropType } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import BtcForm from '@btc-common/form/index.vue';
import BtcSvg from '@btc-common/svg/index.vue';
import * as XLSX from 'xlsx';
import chardet from 'chardet';
import type { TableColumn } from '@btc-crud/table/types';
import type { UseCrudReturn } from '@btc/shared-core';

const { t } = useI18n();

// 从 CRUD 上下文获取数据
const crud = inject<UseCrudReturn<any>>('btc-crud');
const tableRefContext = inject<any>('btc-table-ref');

const props = defineProps({
  /** 表格列配置（可选，如果不提供则从 CRUD 上下文获取） */
  columns: {
    type: Array as PropType<TableColumn[]>,
    default: () => []
  },
  /** 验证规则（可选，如果不提供则从列配置自动生成） */
  validationRules: {
    type: Object,
    default: () => ({})
  },
  onConfig: Function,
  onSubmit: Function,
  template: {
    type: String,
    default: ''
  },
  tips: String,
  limitSize: {
    type: Number,
    default: 10
  },
  type: {
    type: String as PropType<
      'default' | 'success' | 'warning' | 'info' | 'text' | 'primary' | 'danger'
    >,
    default: 'success'
  },
  icon: String,
  disabled: Boolean,
  accept: {
    type: String,
    default:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,text/csv'
  }
});

const emit = defineEmits(['change']);

const formRef = ref();
const fileInputRef = ref();

// 获取列配置（优先使用 props，否则从 CRUD 上下文获取）
const columns = computed(() => {
  if (props.columns && props.columns.length > 0) {
    return props.columns;
  }

  // 从 CRUD 上下文获取列配置
  if (tableRefContext?.value?.columns) {
    return tableRefContext.value.columns;
  }

  return [];
});

// 过滤可导入的列（排除操作列、选择列等）
const importableColumns = computed(() => {
  return columns.value.filter((col: any) =>
    col.prop &&
    !['selection', 'index', 'expand', 'op'].includes(col.type || '') &&
    !col.hidden &&
    !col.filterImport &&
    !(col as any)['filter-import']
  );
});

// 动态生成验证规则
const dynamicValidationRules = computed(() => {
  const rules: any = {};

  importableColumns.value.forEach((col: any) => {
    if (col.prop) {
      rules[col.prop] = {
        required: col.required || false,
        label: col.label || col.prop,
        type: col.type || 'string'
      };
    }
  });

  // 合并用户自定义验证规则
  return { ...rules, ...props.validationRules };
});

// 生成列名映射（支持中英文列名）
const columnMapping = computed(() => {
  const mapping: any = {};

  importableColumns.value.forEach((col: any) => {
    if (col.prop) {
      // 支持多种列名格式
      const possibleNames = [
        col.prop,
        col.label,
        col.prop.charAt(0).toUpperCase() + col.prop.slice(1), // 首字母大写
        col.prop.toUpperCase(), // 全大写
        col.prop.toLowerCase(), // 全小写
      ];

      // 如果有中文标签，也加入映射
      if (col.label && col.label !== col.prop) {
        possibleNames.push(col.label);
      }

      mapping[col.prop] = possibleNames;
    }
  });

  return mapping;
});

// 分析文件名和CRUD实体的匹配度
const analyzeFileNameMatch = (filename: string) => {
  if (!filename || !crud) {
    return null;
  }

  // 获取当前CRUD实体的名称（从service或配置中推断）
  const entityName = getEntityName();
  if (!entityName) {
    return null;
  }

  // 提取文件名（去掉扩展名）
  const fileName = filename.replace(/\.[^/.]+$/, '').toLowerCase();
  const entityNameLower = entityName.toLowerCase();

  // 计算匹配度
  const suggestions: string[] = [];
  let matchScore = 0;

  // 1. 完全匹配
  if (fileName === entityNameLower) {
    matchScore = 100;
  }
  // 2. 包含实体名
  else if (fileName.includes(entityNameLower)) {
    matchScore = 80;
  }
  // 3. 实体名包含文件名
  else if (entityNameLower.includes(fileName)) {
    matchScore = 60;
  }
  // 4. 部分匹配
  else {
    const commonWords = findCommonWords(fileName, entityNameLower);
    if (commonWords.length > 0) {
      matchScore = 40;
    } else {
      matchScore = 0;
    }
  }

  // 生成建议
  if (matchScore < 60) {
    suggestions.push(`建议文件名包含"${entityName}"，如：${entityName}_导入数据.xlsx`);

    // 根据实体类型给出更具体的建议
    if (entityName.includes('user') || entityName.includes('用户')) {
      suggestions.push('用户数据导入建议使用：用户列表.xlsx、用户信息.xlsx');
    } else if (entityName.includes('product') || entityName.includes('产品')) {
      suggestions.push('产品数据导入建议使用：产品列表.xlsx、产品信息.xlsx');
    } else if (entityName.includes('order') || entityName.includes('订单')) {
      suggestions.push('订单数据导入建议使用：订单列表.xlsx、订单信息.xlsx');
    }
  }

  return {
    matchScore,
    suggestions,
    entityName,
    fileName
  };
};

// 获取实体名称
const getEntityName = () => {
  if (!crud?.service) {
    return null;
  }

  // 尝试从service的URL路径推断实体名
  const serviceUrl = crud.service.baseURL || '';
  const pathMatch = serviceUrl.match(/\/([^/]+)(?:\/|$)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // 尝试从service的方法名推断
  if (crud.service.page && crud.service.page.toString().includes('user')) {
    return 'user';
  }
  if (crud.service.page && crud.service.page.toString().includes('product')) {
    return 'product';
  }

  // 默认返回通用名称
  return 'data';
};

// 查找共同词汇
const findCommonWords = (str1: string, str2: string) => {
  const words1 = str1.split(/[_\-\s]+/);
  const words2 = str2.split(/[_\-\s]+/);

  return words1.filter(word =>
    word.length > 2 && words2.some(w => w.includes(word) || word.includes(w))
  );
};

// 动态验证导入数据
const validateImportData = (data: any[]) => {
  if (!data || data.length === 0) {
    return [];
  }

  const validatedData: any[] = [];
  const validationRules = dynamicValidationRules.value;
  const columnMap = columnMapping.value;

  data.forEach((item, index) => {
    const validatedItem: any = {};
    let isValid = true;

    // 遍历每个列配置
    importableColumns.value.forEach((col: any) => {
      if (!col.prop) return;

      const rule = validationRules[col.prop];
      if (!rule) return;

      // 尝试从多个可能的列名中获取值
      let value = null;
      const possibleNames = columnMap[col.prop] || [col.prop];

      for (const name of possibleNames) {
        if (item[name] !== undefined && item[name] !== null && item[name] !== '') {
          value = item[name];
          break;
        }
      }

      // 验证必填字段
      if (rule.required && (!value || value.toString().trim() === '')) {
        isValid = false;
        return;
      }

      // 数据类型转换
      if (value !== null && value !== undefined) {
        const stringValue = String(value).trim();

        // 跳过无效值
        if (stringValue === 'undefined' || stringValue === 'null' || stringValue === '') {
          if (rule.required) {
            isValid = false;
            return;
          }
          validatedItem[col.prop] = '';
        } else {
          switch (rule.type) {
            case 'number':
              validatedItem[col.prop] = Number(value) || 0;
              break;
            case 'boolean':
              validatedItem[col.prop] = Boolean(value);
              break;
            case 'date':
              validatedItem[col.prop] = new Date(value).toISOString();
              break;
            default:
              validatedItem[col.prop] = stringValue;
          }
        }
      } else if (rule.required) {
        validatedItem[col.prop] = '';
      }
    });

    if (isValid) {
      validatedData.push(validatedItem);
    }
  });

  return validatedData;
};

// 提示信息
const tips = computed(() => {
  return props.tips || t('common.import.template_tip');
});

// 上传信息
const upload = reactive({
  filename: '',
  file: null as File | null,
  list: [] as any[]
});

// 分页信息
const pagination = reactive({
  size: 20,
  page: 1,
  onCurrentChange(page: number) {
    pagination.page = page;
  }
});

// 数据表格
const table = reactive({
  // 表头
  header: [] as string[],

  // 选中列表
  selection: [] as any[],

  // 删除行
  del(index?: number) {
    if (index !== undefined) {
      upload.list.splice(index, 1);
    } else {
      upload.list = upload.list.filter(a => {
        return !table.selection.includes(a._index);
      });
    }
  },

  // 序号
  onIndex(index: number) {
    return index + 1 + (pagination.page - 1) * pagination.size;
  },

  // 选中
  onSelectionChange(arr: any[]) {
    table.selection = arr.map(e => e._index);
  }
});

// 数据列表
const list = computed(() => {
  return upload.list.filter((_, i) => {
    return (
      i >= (pagination.page - 1) * pagination.size && i < pagination.page * pagination.size
    );
  });
});

// 清空
function clear() {
  upload.filename = '';
  upload.file = null;
  upload.list = [];
  table.header = [];
  table.selection = [];
}

// 触发文件选择
function triggerFileSelect() {
  fileInputRef.value?.click();
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // 直接处理文件，不显示弹窗
    onUpload(file, null, {
      next: () => {
        // 在文件处理完成后调用onSubmit回调
        if (props.onSubmit) {
          props.onSubmit({
            list: upload.list,
            file: upload.file,
            filename: upload.filename
          }, {
            done: () => {},
            close: () => {}
          });
        }
      }
    });
  }

  // 清空文件输入，允许重复选择同一文件
  target.value = '';
}

// 打开（保留原有功能，用于需要弹窗预览的场景）
function open() {
  clear();

  formRef.value?.open({
    title: t('common.button.import'),
    width: computed(() => (upload.filename ? '80%' : '800px')),
    dialog: {
      'close-on-press-escape': false
    },
    items: [
      ...(props.onConfig ? props.onConfig(formRef.value) : []),
      {
        prop: 'file',
        component: {
          name: 'slot-upload'
        }
      },
      {
        component: {
          name: 'slot-list'
        }
      }
    ],
    op: {
      saveButtonText: t('common.button.submit')
    },
    on: {
      submit(_: any, { done, close }: { done: () => void; close: () => void }) {
        if (!upload.filename) {
          done();
          return ElMessage.error(t('common.import.select_file'));
        }

        if (props.onSubmit) {
          props.onSubmit({
            ...upload,
            ..._
          }, { done, close });
        } else {
          ElMessage.error(t('common.import.onSubmit_required'));
          done();
        }
      }
    }
  });
}

// 上传
function onUpload(raw: File, _: any, { next }: any) {
  const reader = new FileReader();
  const ext = raw.name.split('.').pop()?.toLowerCase();

  reader.onload = (event: any) => {
    let data = '';

    if (ext === 'csv') {
      const detected: any = chardet.detect(new Uint8Array(event.target.result));
      const decoder = new TextDecoder(detected);
      data = decoder.decode(event.target.result);
    } else {
      data = event.target.result;
    }

    const workbook = XLSX.read(data, { type: 'binary', raw: ext === 'csv' });

    let json: any[] = [];
    for (const sheet in workbook.Sheets) {
      if (workbook.Sheets.hasOwnProperty(sheet)) {
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: ''
        });

        json = json.concat(sheetData);
      }
    }

    // 动态验证数据
    const validatedData = validateImportData(json);

    upload.list = validatedData.map((e, i) => {
      return {
        ...e,
        _index: i
      };
    });
    upload.filename = raw.name;
    upload.file = raw;

    // 动态生成表头
    table.header = importableColumns.value.map((col: any) => col.label || col.prop);

    // 分析文件名匹配度并给出建议
    const fileNameAnalysis = analyzeFileNameMatch(raw.name);
    if (fileNameAnalysis && fileNameAnalysis.matchScore < 60) {
      // 显示文件名建议
      setTimeout(() => {
        ElMessage.warning({
          message: `文件名"${fileNameAnalysis.fileName}"与当前实体"${fileNameAnalysis.entityName}"匹配度较低。\n${fileNameAnalysis.suggestions.join('\n')}`,
          duration: 6000,
          showClose: true
        });
      }, 1000);
    }

    emit('change', validatedData);

    // 在文件处理完成后调用next回调
    if (next) {
      next();
    }
  };

  if (ext === 'csv') {
    reader.readAsArrayBuffer(raw);
  } else {
    reader.readAsBinaryString(raw);
  }

  return false;
}

// 下载模版
function download() {
  const link = document.createElement('a');
  link.setAttribute('href', props.template);
  link.setAttribute('download', '');
  link.click();
}

defineExpose({
  open,
  clear,
  formRef,
  triggerFileSelect,
  handleFileSelect
});
</script>

<style lang="scss" scoped>
.upload {
  display: flex;
  flex-direction: column;

  .inner {
    width: 100%;

    :deep(.el-upload) {
      width: 100% !important;
    }
  }
}

.tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  & > span {
    color: var(--el-color-warning);
  }
}

.data-table {
  .head {
    margin-bottom: 10px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
