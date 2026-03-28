const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...expoConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
];
