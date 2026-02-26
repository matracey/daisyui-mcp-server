import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    settings: {
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
    },
  },
  {
    ignores: ['dist/', 'coverage/', 'src/data/generated/'],
  }
)
