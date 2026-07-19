import { stat, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import {
  applyImport,
  buildImportPreview,
  DEFAULT_TARGET_DIR,
} from "./knowledge-import-core.mjs";

const DEFAULT_SOURCE = String.raw`C:\Users\15252\Desktop\面试\面试2026.md`;

function printHelp() {
  console.log(`安全 Markdown 知识点导入器

用法：
  npm run knowledge:import -- [选项]
  npm run knowledge:check -- [选项]

选项：
  --source <path>       原始 Markdown 路径
  --output <directory>  content/articles 下的目标目录，默认 generated
  --id <name>           来源标识（兼容旧命令，可选）
  --preset <name>       auto、interview 或 generic，默认 auto
  --level <2-6>         按几级标题拆分，默认 4
  --folder-level <1-5>  按指定父标题自动分目录；不传时保持平铺
  --category <name>     固定文章分类
  --conflict <mode>     ask、keep、replace、keepBoth 或 error，默认 ask
  --allow-link-changes  允许删除 Wiki Link 或移动被引用文件
  --check               只预览，不写入
  --help                显示帮助

冲突规则：
  keep      保留现有文件
  replace   使用导入内容，保留现有发布字段
  keepBoth  同时保留，新内容自动增加文件名序号

示例：
  npm run knowledge:import
  npm run knowledge:import -- --source "D:\\资料\\AI知识库.md" --output ai --category AI --level 3 --folder-level 2
  npm run knowledge:check -- --source "D:\\资料\\AI知识库.md" --output ai --level 3`);
}

function readValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} 缺少参数值`);
  return value;
}

function parseArgs(argv) {
  const options = {
    source: DEFAULT_SOURCE,
    targetDir: DEFAULT_TARGET_DIR,
    sourceId: "",
    preset: "auto",
    level: 4,
    folderLevel: null,
    category: "",
    conflict: "ask",
    check: false,
    help: false,
    allowLinkChanges: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--check") options.check = true;
    else if (argument === "--allow-link-changes")
      options.allowLinkChanges = true;
    else if (argument === "--help") options.help = true;
    else if (argument === "--source")
      options.source = readValue(argv, index++, "--source");
    else if (argument === "--output")
      options.targetDir = readValue(argv, index++, "--output");
    else if (argument === "--id")
      options.sourceId = readValue(argv, index++, "--id");
    else if (argument === "--preset")
      options.preset = readValue(argv, index++, "--preset");
    else if (argument === "--level")
      options.level = Number(readValue(argv, index++, "--level"));
    else if (argument === "--folder-level")
      options.folderLevel = Number(readValue(argv, index++, "--folder-level"));
    else if (argument === "--category")
      options.category = readValue(argv, index++, "--category");
    else if (argument === "--conflict")
      options.conflict = readValue(argv, index++, "--conflict");
    else throw new Error(`无法识别的参数：${argument}，使用 --help 查看帮助`);
  }

  if (
    !["ask", "keep", "replace", "keepBoth", "error"].includes(options.conflict)
  ) {
    throw new Error("--conflict 只支持 ask、keep、replace、keepBoth 或 error");
  }
  options.source = resolve(options.source);
  if (
    options.folderLevel !== null &&
    (!Number.isInteger(options.folderLevel) ||
      options.folderLevel < 1 ||
      options.folderLevel > 5 ||
      options.folderLevel >= options.level)
  ) {
    throw new Error("--folder-level 必须是低于 --level 的 1 到 5 级标题");
  }
  return options;
}

function printPreview(preview) {
  const { summary } = preview;
  console.log(
    `导入根目录：content/articles${preview.targetDir === "." ? "" : `/${preview.targetDir}`}`,
  );
  console.log(
    `预览结果：新增 ${summary.new}，一致 ${summary.identical}，冲突 ${summary.conflict}，移动/改名 ${summary.rename}`,
  );
  if (preview.autoFolder) {
    console.log(
      `目录分布：${preview.folderSummary.map((item) => `${item.folder} ${item.count} 篇`).join("，")}；其他 ${preview.fallbackCount} 篇`,
    );
  }
  if (preview.warningCount) console.log(`匹配警告：${preview.warningCount} 条`);
  for (const item of preview.items.filter((entry) => entry.warning)) {
    console.log(`  警告：${item.relativePath}：${item.warning}`);
  }
  for (const item of preview.items.filter(
    (entry) => entry.requiresLinkConfirmation,
  )) {
    if (item.linkChanges.removed.length)
      console.log(
        `  关系变化：${item.relativePath} 将删除 ${item.linkChanges.removed.join("、")}`,
      );
    if (item.inboundReferences.length)
      console.log(
        `  被引用文件移动：${item.existingRelativePath} 被 ${item.inboundReferences.map((entry) => `${entry.file}:${entry.line}`).join("、")} 引用`,
      );
  }
  for (const item of preview.items.filter(
    (entry) => entry.status === "conflict",
  )) {
    console.log(
      `  冲突：${item.existingRelativePath} -> ${item.relativePath}（${item.title}）`,
    );
  }
}

async function resolveDecisions(preview, mode) {
  const conflicts = preview.items.filter((item) => item.status === "conflict");
  if (!conflicts.length) return {};
  if (["keep", "replace", "keepBoth"].includes(mode)) {
    return Object.fromEntries(conflicts.map((item) => [item.id, mode]));
  }
  if (mode === "error" || !process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "存在内容冲突；请在本地导入页面处理，或使用 --conflict 指定策略",
    );
  }

  const reader = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const decisions = {};
  try {
    for (const item of conflicts) {
      let answer = "";
      while (!["k", "r", "b"].includes(answer)) {
        answer = (
          await reader.question(
            `\n${item.title}\n现有：${item.existingRelativePath}\n新文件：${item.relativePath}\n[k] 保留现有 / [r] 使用新内容 / [b] 同时保留：`,
          )
        )
          .trim()
          .toLowerCase();
      }
      decisions[item.id] = { k: "keep", r: "replace", b: "keepBoth" }[answer];
    }
  } finally {
    reader.close();
  }
  return decisions;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();

  const [sourceText, sourceStats] = await Promise.all([
    readFile(options.source, "utf8"),
    stat(options.source),
  ]);
  const input = {
    sourceText,
    sourceName: options.source.split(/[\\/]/).pop(),
    sourceDate: sourceStats.mtime.toISOString().slice(0, 10),
    targetDir: options.targetDir,
    sourceId: options.sourceId,
    preset: options.preset,
    level: options.level,
    category: options.category,
    autoFolder: options.folderLevel !== null,
    folderLevel: options.folderLevel || Math.max(1, options.level - 1),
  };
  const preview = await buildImportPreview(input);
  printPreview(preview);
  if (options.check) {
    if (preview.summary.conflict) process.exitCode = 2;
    return;
  }

  const decisions = await resolveDecisions(preview, options.conflict);
  const result = await applyImport(input, decisions, preview.items, {
    allowLinkChanges: options.allowLinkChanges,
  });
  const summary = result.summary;
  console.log(
    `导入完成：新增 ${summary.created}，替换 ${summary.replaced}，同时保留 ${summary.keptBoth}，保留 ${summary.kept}，改名 ${summary.renamed}，跳过 ${summary.identical}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
