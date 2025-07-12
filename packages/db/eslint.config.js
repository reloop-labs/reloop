import baseConfig, { restrictEnvAccess } from '@reloop/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['dist/**'],
  },
  ...baseConfig,
  ...restrictEnvAccess,
  {
    files: ['drizzle.config.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
];
