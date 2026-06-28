import js from "@eslint/js";
import importAlias from "eslint-plugin-import-alias";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import svgJsx from "eslint-plugin-svg-jsx";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import-alias": importAlias,
      "svg-jsx": svgJsx,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/ban-ts-comment": "off",
      "import-alias/import-alias": [
        "warn",
        {
          relativeDepth: 0,
        },
      ],
      "svg-jsx/camel-case-dash": "error",
      "svg-jsx/camel-case-colon": "error",
      "svg-jsx/no-style-string": "error",
      "no-inline-comments": "error",
      "no-warning-comments": ["warn", { terms: ["TODO", "FIXME"], location: "start" }],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXAttribute[name.name='fontSize'][value.value=/\\d+px/]",
          message: "Use rem units for fontSize instead of px for better accessibility and scaling",
        },
        {
          selector: "Property[key.name='fontSize'][value.value=/\\d+px/]",
          message: "Use rem units for fontSize instead of px for better accessibility and scaling",
        },
        {
          selector: "JSXAttribute[name.name='fontSize'] > JSXExpressionContainer > Literal[value=/\\d+px/]",
          message: "Use rem units for fontSize instead of px for better accessibility and scaling",
        },
        {
          selector: "JSXAttribute[name.name='lineHeight'][value.value=/\\d+px/]",
          message: "Use rem units for lineHeight instead of px for better accessibility and scaling",
        },
      ],
    },
  },
);
