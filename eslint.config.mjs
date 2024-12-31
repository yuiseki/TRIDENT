import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import js from "@eslint/js";
// import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const config = [
  {
    files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
  },
  {
    ignores: [
      "**/next-env.d.ts",
      "**/build/",
      "**/bin/",
      "**/obj/",
      "**/out/",
      "**/.next/",
      "**/public/",
    ],
  },
  {
    name: "eslint/recommended",
    rules: js.configs.recommended.rules,
  },
  // ...tseslint.configs.recommended,
  {
    name: "react/jsx-runtime",
    plugins: {
      react: reactPlugin,
    },
    rules: reactPlugin.configs["jsx-runtime"].rules,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    name: "react-hooks/recommended",
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
  {
    name: "next/core-web-vitals",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    name: "prettier/config",
    ...eslintConfigPrettier,
  },
];

export default config;
