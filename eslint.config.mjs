import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next, but globbed so NESTED build
    // output (e.g. .claude/worktrees/*/.next) is ignored too — the
    // root-anchored ".next/**" let ESLint lint hundreds of minified chunks
    // inside git worktrees, drowning the real source findings.
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "next-env.d.ts",
    // Agent scratch space — worktrees, workflows, generated artifacts.
    ".claude/**",
  ]),
]);

export default eslintConfig;
