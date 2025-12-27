module.exports = {
  root: true,
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
    '@typescript-eslint/no-unused-vars': 'off', // 完全关闭未使用变量检查
    'no-unused-vars': 'off', // 关闭JavaScript未使用变量检查
    // 强化边界规则
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './apps/**',
            from: './packages/**/src/**',
            message: '应用不能直接导入包的源码，请使用 dist 或 exports',
          },
          {
            target: './packages/**',
            from: './packages/**/src/**',
            except: ['./packages/**/dist'],
            message: '包之间不能直接导入源码',
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
  ],
};
// UTF-8 encoding fix
