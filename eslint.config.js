// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Jest test globals (+ __dirname, used to locate files from tests).
const jestGlobals = Object.fromEntries(
  [
    'jest',
    'describe',
    'it',
    'test',
    'expect',
    'beforeAll',
    'afterAll',
    'beforeEach',
    'afterEach',
    '__dirname',
  ].map((name) => [name, 'readonly']),
);

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Tests and Jest setup files run under Jest.
    files: ['__tests__/**/*.{js,jsx}', 'jest/**/*.js'],
    languageOptions: { globals: jestGlobals },
  },
]);
