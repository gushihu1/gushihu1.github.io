import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import process from "node:process";

const DEFAULT_SOURCE = String.raw`C:\Users\15252\Desktop\面试\面试2026.md`;
const OUTPUT_DIR = resolve("content/articles/generated");

const categoryAliases = {
  其他问题: "project",
  后台项目功能: "backend",
  移动端项目功能: "mobile",
  大屏项目功能: "screen",
  项目搭建: "engineering",
  HTML和CSS: "html-css",
  JS: "javascript",
  Vue: "vue",
  uniapp: "uniapp",
  Electron: "electron",
  Echarts: "echarts",
  其他: "web",
  代码题: "code",
  AI相关: "ai",
};

const allowedProjectCategories = new Set([
  "后台项目功能",
  "移动端项目功能",
  "大屏项目功能",
  "项目搭建",
]);

function printHelp() {
  console.log(`通用 Markdown 知识点导入器

用法：
  npm run knowledge:import -- [选项]
  npm run knowledge:check -- [选项]

选项：
  --source <path>       原始 Markdown 路径
  --id <name>           来源标识；不同资料必须使用不同标识
  --preset <name>       auto、interview 或 generic，默认 auto
  --level <2-6>         按几级标题拆分，默认 4
  --category <name>     为本次导入固定博客分类，例如 AI、后端
  --check               只检查，不写入文件
  --help                显示帮助

示例：
  npm run knowledge:import
  npm run knowledge:import -- -- --source "D:\\资料\\AI知识库.md" --id ai --category AI --level 3
  npm run knowledge:check -- -- --source "D:\\资料\\AI知识库.md" --id ai --category AI --level 3`);
}

function readValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} 缺少参数值`);
  return value;
}

function parseArgs(argv) {
  const options = {
    source: DEFAULT_SOURCE,
    sourceId: "",
    preset: "auto",
    level: 4,
    category: "",
    check: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check") options.check = true;
    else if (argument === "--help") options.help = true;
    else if (argument === "--source")
      options.source = readValue(argv, index++, "--source");
    else if (argument === "--id")
      options.sourceId = readValue(argv, index++, "--id");
    else if (argument === "--preset")
      options.preset = readValue(argv, index++, "--preset");
    else if (argument === "--level")
      options.level = Number(readValue(argv, index++, "--level"));
    else if (argument === "--category")
      options.category = readValue(argv, index++, "--category");
    else throw new Error(`无法识别的参数：${argument}，使用 --help 查看帮助`);
  }

  options.source = resolve(options.source);
  if (!["auto", "interview", "generic"].includes(options.preset)) {
    throw new Error("--preset 只支持 auto、interview 或 generic");
  }
  if (
    !Number.isInteger(options.level) ||
    options.level < 2 ||
    options.level > 6
  ) {
    throw new Error("--level 必须是 2 到 6 之间的整数");
  }
  return options;
}

function safeAscii(value) {
  return value
    .toLowerCase()
    .replace(/==/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function shortHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

function resolveImportOptions(options) {
  const isDefaultSource = options.source === resolve(DEFAULT_SOURCE);
  const preset =
    options.preset === "auto"
      ? isDefaultSource || basename(options.source) === "面试2026.md"
        ? "interview"
        : "generic"
      : options.preset;
  const fileStem = basename(options.source, extname(options.source));
  const derivedId =
    safeAscii(fileStem) ||
    safeAscii(options.category) ||
    `source-${shortHash(options.source)}`;
  const sourceId =
    safeAscii(options.sourceId) ||
    (preset === "interview" ? "frontend" : derivedId);

  if (!sourceId)
    throw new Error("无法生成来源标识，请通过 --id 指定一个英文标识");
  return { ...options, preset, sourceId };
}

function assertManagedOutput() {
  const articlesRoot = resolve("content/articles") + sep;
  if (!OUTPUT_DIR.startsWith(articlesRoot)) {
    throw new Error(`拒绝操作非知识文章目录：${OUTPUT_DIR}`);
  }
}

function isAllowedInterviewArticle(section, category, title) {
  if (section === "技术回答") return true;
  if (section !== "项目回答") return false;
  if (allowedProjectCategories.has(category)) return true;
  return category === "其他问题" && title === "==有没有什么具有挑战性的功能==";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractKnowledge(sourceText, sourceDate, options) {
  const eol = sourceText.includes("\r\n") ? "\r\n" : "\n";
  const lines = sourceText.split(/\r?\n/);
  const headings = Array(7).fill("");
  const articles = [];
  let current = null;

  const finish = (endLine) => {
    if (!current) return;
    const body = lines.slice(current.bodyStart, endLine).join(eol);
    const allowed =
      options.preset === "interview"
        ? isAllowedInterviewArticle(
            current.section,
            current.sourceCategory,
            current.title,
          )
        : true;
    if (body.trim() && allowed) articles.push({ ...current, body });
    current = null;
  };

  lines.forEach((line, index) => {
    const heading = /^(#{1,6})[\t ]+(.*)$/.exec(line);
    if (!heading) return;
    const level = heading[1].length;
    const title = heading[2].trim();

    if (level <= options.level) finish(index);

    headings[level] = title;
    for (let deeper = level + 1; deeper <= 6; deeper += 1)
      headings[deeper] = "";

    if (level !== options.level) return;

    const parents = headings.slice(1, level).filter(Boolean);
    const nearestParent = [...parents].reverse()[0];
    const category = options.category || nearestParent || title || "未分类";
    const tags =
      options.preset === "interview"
        ? unique([headings[3] || category])
        : unique([options.category, ...parents, category]);

    current = {
      title,
      category,
      tags,
      section: headings[2],
      sourceCategory: headings[3],
      sourceLine: index + 1,
      bodyStart: index + 1,
      sourceDate,
    };
  });

  finish(lines.length);
  return { articles, eol };
}

function renderArticle(article, index, eol, options) {
  const alias =
    categoryAliases[article.category] ||
    safeAscii(article.category) ||
    "knowledge";
  const titleSlug = safeAscii(article.title);
  const prefix = options.sourceId === "frontend" ? "" : `${options.sourceId}-`;
  const filename = `${prefix}${alias}-${String(index + 1).padStart(3, "0")}${titleSlug ? `-${titleSlug}` : ""}.md`;
  const wordCount = article.body.replace(/\s+/g, "").length;
  const minutes = Math.max(1, Math.ceil(wordCount / 500));
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `date: ${article.sourceDate}`,
    `category: ${JSON.stringify(article.category)}`,
    `tags: ${JSON.stringify(article.tags)}`,
    "featured: false",
    "draft: false",
    `readingTime: ${JSON.stringify(`${minutes} min`)}`,
    `sourceId: ${JSON.stringify(options.sourceId)}`,
    `sourceFile: ${JSON.stringify(basename(options.source))}`,
    `sourceLine: ${article.sourceLine}`,
    "---",
    "",
  ].join(eol);
  return { filename, content: frontmatter + article.body, body: article.body };
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function readSourceId(content) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content)?.[1] || "";
  const rawValue = /^sourceId:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
  if (!rawValue) return "";
  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function isLegacyFrontendFile(content) {
  return !readSourceId(content) && /^sourceLine:\s*\d+$/m.test(content);
}

async function listGeneratedFiles() {
  try {
    return (await readdir(OUTPUT_DIR))
      .filter((name) => name.endsWith(".md"))
      .sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function listManagedFiles(sourceId) {
  const files = await listGeneratedFiles();
  const managed = [];
  for (const filename of files) {
    const content = await readFile(resolve(OUTPUT_DIR, filename), "utf8");
    if (readSourceId(content) === sourceId) managed.push(filename);
  }
  return managed.sort();
}

async function checkGenerated(expected, options) {
  const actualFiles = await listManagedFiles(options.sourceId);
  const expectedFiles = expected.map((item) => item.filename).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(
      `来源 ${options.sourceId} 的生成文件与原始 Markdown 不一致，请使用相同参数重新执行 knowledge:import`,
    );
  }
  for (const item of expected) {
    const actual = await readFile(resolve(OUTPUT_DIR, item.filename), "utf8");
    if (stripFrontmatter(actual) !== item.body) {
      throw new Error(`原文比对失败：${item.filename}`);
    }
  }
}

async function removeManagedFiles(options) {
  const files = await listGeneratedFiles();
  for (const filename of files) {
    const file = resolve(OUTPUT_DIR, filename);
    const content = await readFile(file, "utf8");
    const isManaged =
      readSourceId(content) === options.sourceId ||
      (options.sourceId === "frontend" && isLegacyFrontendFile(content));
    if (isManaged) await rm(file, { force: true });
  }
}

async function main() {
  assertManagedOutput();
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    return;
  }

  const options = resolveImportOptions(parsed);
  const sourceText = await readFile(options.source, "utf8");
  const sourceStats = await stat(options.source);
  const sourceDate = sourceStats.mtime.toISOString().slice(0, 10);
  const { articles, eol } = extractKnowledge(sourceText, sourceDate, options);

  if (!articles.length) {
    throw new Error(
      `没有找到可导入的 ${options.level} 级标题正文，未修改任何生成文件`,
    );
  }

  const rendered = articles.map((article, index) =>
    renderArticle(article, index, eol, options),
  );

  if (options.check) {
    await checkGenerated(rendered, options);
    console.log(
      `原文比对通过：来源 ${options.sourceId}，${rendered.length} 个知识点`,
    );
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await removeManagedFiles(options);
  await Promise.all(
    rendered.map((item) =>
      writeFile(resolve(OUTPUT_DIR, item.filename), item.content, "utf8"),
    ),
  );
  await checkGenerated(rendered, options);
  console.log(
    `已导入：来源 ${options.sourceId}，分类 ${options.category || "按标题层级生成"}，${rendered.length} 个知识点`,
  );
  console.log(`正文逐字符比对通过；其他来源的生成文章未被修改`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
