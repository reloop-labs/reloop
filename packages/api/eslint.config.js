import baseConfig from '@reloop/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['dist/**'],
  },
  ...baseConfig,
];
