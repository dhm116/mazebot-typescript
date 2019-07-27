module.exports = {
  root: true,
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: ['plugin:@typescript-eslint/recommended', 'airbnb', 'prettier', 'prettier/@typescript-eslint'],
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
  },
};
