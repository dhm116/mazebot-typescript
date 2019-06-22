module.exports = {
  root: true,
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
  },
};
