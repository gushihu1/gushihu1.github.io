import { resolve } from "node:path";
import { validateVault } from "../lib/wiki-links/core.mjs";

const { index, issues } = validateVault(resolve("content"));
if (!issues.length) {
  console.log(`Wiki Link 检查通过：${index.notes.length} 个内容文件`);
  process.exit(0);
}

console.error(`Wiki Link 检查失败：${issues.length} 个问题`);
for (const issue of issues) {
  console.error(
    `  ${issue.file}:${issue.line}:${issue.column} ${issue.raw} - ${issue.reason}`,
  );
}
process.exitCode = 1;
