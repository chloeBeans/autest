module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  globals: {
    $t: 'readonly',
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/no-template-shadow': 'error',
    'vue/multi-word-component-names': 'off',
    'no-console': 'warn',
  },
};
