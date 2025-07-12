import baseConfig from '@reloop/eslint-config/base';
import reactConfig from '@reloop/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['dist/**'],
  },
  ...baseConfig,
  ...reactConfig,
];
