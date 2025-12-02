import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  // Ignore patterns (must be first)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      ".vercel/**",
    ],
  },

  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Main configuration for src/
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],

      // Import ordering and organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "error",
      "import/newline-after-import": "error",

      // General rules
      "no-console": "off", // Console is fine for server logs
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-expressions": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },

  // Configuration for api/
  {
    files: ["api/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./api/tsconfig.json",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./api/tsconfig.json",
        },
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // Import ordering and organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "error",
      "import/newline-after-import": "error",

      // General rules
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-expressions": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },

  // Prettier config (must be last to override other configs)
  eslintConfigPrettier,
);
