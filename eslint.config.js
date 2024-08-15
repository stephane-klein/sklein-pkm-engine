import globals from "globals";
import js from "@eslint/js";
import eslintPluginSvelte from "eslint-plugin-svelte";
import svelteConfig from "./svelte.config.js";

export default [
    {
        ignores: [
            ".DS_Store",
            "node_modules/*",
            "/build/*",
            "/.svelte-kit/*",
            "/package/*",
            ".env",
            ".env.*",
            "pnpm-lock.yaml",
            "package-lock.json",
            "yarn.lock",
            "/volumes/*"
        ]
    },
    js.configs.recommended,
    ...eslintPluginSvelte.configs["flat/recommended"],
    {
        files: [
            "src/**/*.svelte",
            "*.svelte"
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                svelteConfig
            }
        },
        plugins: {
        },
        rules: {
            semi: "error",
            "array-callback-return": ["error"],
            "no-useless-concat": ["error"],
            "space-before-function-paren": ["error", "never"],
            "no-duplicate-imports": ["error"],
            "no-irregular-whitespace": "off",
            "svelte/a11y-no-static-element-interactions": "off",
            "svelte/no-at-html-tags": "off",
            "svelte/a11y-missing-attribute": "off"
        }
    },
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            semi: "error",
            "array-callback-return": ["error"],
            "no-useless-concat": ["error"],
            "space-before-function-paren": ["error", "never"],
            "no-duplicate-imports": ["error"],
            "no-irregular-whitespace": "off"
        }
    }
];
