const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'web-build/*', 'coverage/*', '.expo/*', 'expo-env.d.ts']),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9A-Fa-f]{3,8}$/u]',
          message:
            'Prohibido color hexadecimal fuera de src/theme: usa los tokens (docs/DESIGN_SYSTEM.md).',
        },
        {
          selector: 'Literal[value=/^rgba?\\(/u]',
          message:
            'Prohibido rgb()/rgba() fuera de src/theme: usa tokens como scrim o la función tint().',
        },
      ],
    },
    ignores: ['src/theme/**', '**/*.test.ts', '**/*.test.tsx'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/ui/AppIcon.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@expo/vector-icons', '@expo/vector-icons/*'],
              message: 'Prohibido importar Ionicons directamente: usa el componente AppIcon.',
            },
          ],
        },
      ],
    },
  },
]);
