module.exports = {
  // 配置 lint-staged 行为
  '*.{ts,tsx,vue}': (filenames) => {
    const files = filenames.join(' ');
    return [
      // 先运行 prettier 格式化
      `prettier --write ${files}`,
      // 然后运行 eslint 检查和修复，但不强制要求零警告
      `eslint --fix ${files}`,
      // 最后再次运行 prettier 确保格式一致
      `prettier --write ${files}`
    ];
  },
  '*.{json,md}': (filenames) => {
    const files = filenames.join(' ');
    return [`prettier --write ${files}`];
  }
};
