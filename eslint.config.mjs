import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Project-generated / non-source artifacts:
    "consultant-app/dist/**",
    "consultant-app/public/qa_captures/**",
    "output_assets/**",
    "scratch/**",
    "학원용앱/**",
    "recovered_thread_*.jsonl",
    "recovered_thread_*_messages.txt",
  ]),
]);

export default eslintConfig;
