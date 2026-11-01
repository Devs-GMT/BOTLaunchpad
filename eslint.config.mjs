import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Layer boundaries: see docs/ARCHITECTURE.md §2
const noDeepModuleImports = {
  regex: "^@/modules/[^/]+/.+",
  message: "Import a module through its barrel (@/modules/<name>), not its internals.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noDeepModuleImports] }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            noDeepModuleImports,
            {
              regex: "^@/(?!modules/[^/]+$|providers$|styles/|components/layout$|config/site$)",
              message: "app/ is routing only: import a page from @/modules/<name>.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(web3|templates|config|modules|providers|generated|components/(web3|layout|graphics))",
              message: "components/ui is app-agnostic: no web3, templates, config or feature imports.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "contracts/**"]),
]);

export default eslintConfig;
