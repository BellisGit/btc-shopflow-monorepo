import { logger } from '@btc/shared-core';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { glob } from 'glob';

// 加载 schema
async function loadSchema() {
  const schemaPath = path.join(process.cwd(), '.vitepress/schemas/frontmatter.schema.json');
  return await fs.readJSON(schemaPath);
}

// 创建验证器
function createValidator(schema: any) {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

// 验证单个文档
async function validateDocument(filePath: string, validate: any): Promise<{
  valid: boolean;
  errors?: any[];
}> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);

    // 如果没有 frontmatter，返回错误
    if (!data || Object.keys(data).length === 0) {
      return {
        valid: false,
        errors: [{ message: 'No frontmatter found' }]
      };
    }

    // 验证
    const valid = validate(data);

    return {
      valid,
      errors: valid ? undefined : validate.errors
    };
  } catch (error: any) {
    return {
      valid: false,
      errors: [{ message: error.message }]
    };
  }
}

// 主函数
async function main() {
  logger.info('=== Frontmatter 验证 ===\n');

  // 加载 schema
  const schema = await loadSchema();
  const validate = createValidator(schema);
  logger.info('✅ Schema 加载完成\n');

  // 查找所有已迁移的文档
  const docsDir = path.join(process.cwd(), '_ingested');

  if (!await fs.pathExists(docsDir)) {
    logger.info('⚠️  _ingested 目录不存在，请先运行 ingest');
    process.exit(1);
  }

  const files = await glob(path.join(docsDir, '**/*.md').replace(/\\/g, '/'));
  logger.info(`找到 ${files.length} 个文档\n`);

  let validCount = 0;
  let invalidCount = 0;
  const errors: Array<{ file: string; errors: any[] }> = [];

  // 验证每个文档
  for (const file of files) {
    const result = await validateDocument(file, validate);

    if (result.valid) {
      validCount++;
      logger.info(`  ✅ ${path.relative(docsDir, file)}`);
    } else {
      invalidCount++;
      logger.info(`  ❌ ${path.relative(docsDir, file)}`);
      errors.push({
        file: path.relative(docsDir, file),
        errors: result.errors || []
      });
    }
  }

  logger.info('\n=== 验证结果 ===');
  logger.info(`✅ 有效: ${validCount}`);
  logger.info(`❌ 无效: ${invalidCount}`);

  if (errors.length > 0) {
    logger.info('\n=== 错误详情 ===\n');
    errors.forEach(({ file, errors }) => {
      logger.info(`📄 ${file}:`);
      errors.forEach(err => {
        if (err.instancePath) {
          logger.info(`  - ${err.instancePath}: ${err.message}`);
        } else {
          logger.info(`  - ${err.message}`);
        }
      });
      logger.info('');
    });

    process.exit(1);
  }

  logger.info('\n✅ 所有文档验证通过！');
}

main().catch(error => {
  logger.error('验证过程出错:', error);
  process.exit(1);
});

