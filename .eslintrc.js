module.exports = {
  env: {
    browser: false,
    node: true,
    commonjs: true,
    es2021: true,
  },
  ignorePatterns: ['node_modules/'],
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
