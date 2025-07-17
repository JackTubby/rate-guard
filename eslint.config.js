import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['dist', 'node_modules'],

    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      quotes: ['error', 'double', { avoidEscape: true }],
      indent: ['error', 'tab']
    },
    ignores: [
      "dist",
      "node_modules",
      "documentation"
    ]
  }
];
