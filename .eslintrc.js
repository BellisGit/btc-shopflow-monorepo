module.exports = {
  root: true,
  ignorePatterns: [
    'dist/**',
    '**/dist/**',
    'node_modules/**',
    '**/node_modules/**',
    '*.d.ts',
    '**/*.d.ts',
    'coverage/**',
    '**/coverage/**',
    'build/**',
    '**/build/**',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    // 重构 import/no-restricted-paths 规则
    // 规则1：禁止 应用(apps) 导入 包(packages) 的源码
    // 规则2：禁止 包A 的源码 导入 包B 的源码（跨包源码导入）
    // 例外：允许导入样式文件和语言文件（.scss, .css, locales）
    // 注意：except 匹配的是导入路径（可能包含别名），需要匹配实际文件路径模式
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './apps/**',
            from: './packages/**/src/**',
            except: [
              './packages/**/src/**/*.scss',
              './packages/**/src/**/*.css',
              './packages/**/src/**/locales/**',
              './packages/**/src/**/styles/**',
              './packages/shared-core/src/**/locales/**',
              './packages/shared-components/src/locales/**',
              './packages/shared-components/src/styles/**',
            ],
          },
          {
            target: './packages/*/src/**',
            from: '../*/src/**',
          },
        ],
      },
    ],
    'import/no-cycle': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      // 补充：让 import 解析识别 monorepo 包路径（避免误判）
      node: {
        paths: ['./packages'],
        extensions: ['.ts', '.js', '.mjs'],
      },
    },
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    // 允许应用导入包的样式和语言文件（通过禁用规则实现）
    {
      files: [
        'apps/**/src/**/bootstrap/**/*.{ts,tsx}',
        'apps/**/src/**/i18n/**/*.{ts,tsx}',
        'apps/**/src/main.{ts,tsx}',
        'apps/**/src/**/bootstrap/**/ui.{ts,tsx}',
      ],
      rules: {
        'import/no-restricted-paths': 'off',
      },
    },
  ],
};
