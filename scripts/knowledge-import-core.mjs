import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

export const ARTICLES_ROOT = resolve("content/articles");
export const DEFAULT_TARGET_DIR = "generated";
export const FALLBACK_FOLDER = "其他";

const allowedProjectCategories = new Set([
  "后台项目功能",
  "移动端项目功能",
  "大屏项目功能",
  "项目搭建",
]);
const ignoredComparisonFields = new Set([
  "date",
  "featured",
  "draft",
  "description",
  "readingTime",
  "sourceId",
  "sourceFile",
  "sourceLine",
]);

const unique = (values) => [...new Set(values.filter(Boolean))];
const shortHash = (value) =>
  createHash("sha256").update(value).digest("hex").slice(0, 12);
const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
const toPosix = (value) => value.replace(/\\/g, "/");

function parseScalar(value) {
  const raw = value.trim();
  try {
    return JSON.parse(raw);
  } catch {
    if (raw.startsWith("[") && raw.endsWith("]")) {
      return raw
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw.replace(/^['"]|['"]$/g, "");
  }
}

export function parseMarkdownDocument(content) {
  const normalized = String(content).replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized);
  const fields = {};
  const lines = [];
  if (match) {
    for (const line of match[1].split("\n")) {
      lines.push(line);
      const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
      if (field) fields[field[1]] = parseScalar(field[2]);
    }
  }
  return {
    fields,
    frontmatterLines: lines,
    body: match ? normalized.slice(match[0].length) : normalized,
  };
}

function comparableDocument(content) {
  const document = parseMarkdownDocument(content);
  const fields = Object.fromEntries(
    Object.entries(document.fields)
      .filter(([key]) => !ignoredComparisonFields.has(key))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return JSON.stringify({ fields, body: normalizeText(document.body) });
}

export const documentsMatch = (left, right) =>
  comparableDocument(left) === comparableDocument(right);

function safeSourceId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function sanitizePathPart(value, fallback = "") {
  let result = String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/(^|\s)(==|\*\*|__|~~|`)+|(?:==|\*\*|__|~~|`)+(\s|$)/g, " ")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .trim()
    .replace(/[-. ]+$/g, "");
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result))
    result = `_${result}`;
  if (result.length > 100) result = result.slice(0, 88).replace(/[. ]+$/g, "");
  return result || fallback;
}

export function sanitizeFilename(title, fallback = "未命名文章") {
  return `${sanitizePathPart(title, fallback)}.md`;
}

export function sanitizeFolderName(title) {
  return sanitizePathPart(title, FALLBACK_FOLDER);
}

function withSuffix(filename, index) {
  if (index <= 1) return filename;
  const extension = extname(filename);
  return `${basename(filename, extension)}-${index}${extension}`;
}

export function resolveTargetDirectory(
  targetDir = DEFAULT_TARGET_DIR,
  articlesRoot = ARTICLES_ROOT,
) {
  const rawInput = String(targetDir ?? DEFAULT_TARGET_DIR).trim();
  if (
    isAbsolute(rawInput) ||
    /^[A-Za-z]:[\\/]/.test(rawInput) ||
    /^[/\\]{2}/.test(rawInput)
  ) {
    throw new Error("导入根目录不能使用绝对路径");
  }
  let input = rawInput.replace(/\\/g, "/");
  input = input.replace(/^content\/articles\/?/i, "").replace(/^\/+|\/+$/g, "");
  if (input === ".") return { absolute: resolve(articlesRoot), relative: "." };
  if (!input) input = DEFAULT_TARGET_DIR;
  if (input.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("导入根目录不能包含空目录、. 或 ..");
  }
  const absolute = resolve(articlesRoot, ...input.split("/"));
  const root = resolve(articlesRoot);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`))
    throw new Error("导入根目录必须位于 content/articles 内");
  return { absolute, relative: input };
}

function isAllowedInterviewArticle(section, category, title) {
  if (section === "技术回答") return true;
  if (section !== "项目回答") return false;
  if (allowedProjectCategories.has(category)) return true;
  return category === "其他问题" && title === "==有没有什么具有挑战性的功能==";
}

export function resolveImportOptions(input = {}) {
  const sourceName = input.sourceName || "知识库.md";
  const preset =
    input.preset && input.preset !== "auto"
      ? input.preset
      : sourceName === "面试2026.md"
        ? "interview"
        : "generic";
  const level = Number(input.level || 4);
  if (!Number.isInteger(level) || level < 2 || level > 6)
    throw new Error("拆分标题级别必须是 2 到 6 之间的整数");
  if (!["interview", "generic"].includes(preset))
    throw new Error("导入预设只支持 auto、interview 或 generic");
  const autoFolder = Boolean(input.autoFolder);
  const folderLevel = Number(input.folderLevel || Math.max(1, level - 1));
  if (
    autoFolder &&
    (!Number.isInteger(folderLevel) ||
      folderLevel < 1 ||
      folderLevel >= level ||
      folderLevel > 5)
  ) {
    throw new Error("目录标题级别必须是低于文章拆分级别的 1 到 5 级标题");
  }
  const fileStem = basename(sourceName, extname(sourceName));
  const sourceId =
    safeSourceId(input.sourceId) ||
    (preset === "interview"
      ? "frontend"
      : safeSourceId(fileStem) || `source-${shortHash(sourceName)}`);
  return {
    ...input,
    level,
    preset,
    autoFolder,
    folderLevel,
    sourceId,
    category: String(input.category || "").trim(),
    sourceName,
  };
}

export function extractKnowledge(sourceText, optionsInput = {}) {
  const options = resolveImportOptions(optionsInput);
  const lines = String(sourceText).replace(/\r\n?/g, "\n").split("\n");
  const headings = Array(7).fill("");
  const articles = [];
  let current = null;
  const finish = (endLine) => {
    if (!current) return;
    const body = lines.slice(current.bodyStart, endLine).join("\n").trim();
    const allowed =
      options.preset === "interview"
        ? isAllowedInterviewArticle(
            current.section,
            current.sourceCategory,
            current.title,
          )
        : true;
    if (body && allowed) articles.push({ ...current, body });
    current = null;
  };
  lines.forEach((line, index) => {
    const heading = /^(#{1,6})[\t ]+(.*)$/.exec(line);
    if (!heading) return;
    const headingLevel = heading[1].length;
    const title = heading[2].trim();
    if (headingLevel <= options.level) finish(index);
    headings[headingLevel] = title;
    for (let deeper = headingLevel + 1; deeper <= 6; deeper += 1)
      headings[deeper] = "";
    if (headingLevel !== options.level) return;
    const headingByLevel = [...headings];
    const parents = headingByLevel.slice(1, headingLevel).filter(Boolean);
    const nearestParent = [...parents].reverse()[0];
    const category = options.category || nearestParent || title || "未分类";
    const tags =
      options.preset === "interview"
        ? unique([headingByLevel[3] || category])
        : unique([options.category, ...parents, category]);
    current = {
      title,
      category,
      tags,
      headingByLevel,
      section: headingByLevel[2],
      sourceCategory: headingByLevel[3],
      sourceLine: index + 1,
      bodyStart: index + 1,
    };
  });
  finish(lines.length);
  return { articles, options };
}

const calculateReadingTime = (body) =>
  `${Math.max(1, Math.ceil(body.replace(/\s+/g, "").length / 500))} min`;

export function renderNewArticle(article, sourceDate) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `date: ${sourceDate}`,
    `category: ${JSON.stringify(article.category)}`,
    `tags: ${JSON.stringify(article.tags)}`,
    "featured: false",
    "draft: false",
    `readingTime: ${JSON.stringify(calculateReadingTime(article.body))}`,
    "---",
    "",
  ].join("\n");
  return `${frontmatter}${article.body.trim()}\n`;
}

function replaceFrontmatterFields(existingContent, article) {
  const existing = parseMarkdownDocument(existingContent);
  const replacements = {
    title: JSON.stringify(article.title),
    category: JSON.stringify(article.category),
    tags: JSON.stringify(article.tags),
    readingTime: JSON.stringify(calculateReadingTime(article.body)),
  };
  const seen = new Set();
  const lines = existing.frontmatterLines.map((line) => {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!match || !(match[1] in replacements)) return line;
    seen.add(match[1]);
    return `${match[1]}: ${replacements[match[1]]}`;
  });
  for (const [key, value] of Object.entries(replacements))
    if (!seen.has(key)) lines.push(`${key}: ${value}`);
  if (!lines.some((line) => /^date:/.test(line)))
    lines.splice(1, 0, `date: ${new Date().toISOString().slice(0, 10)}`);
  if (!lines.some((line) => /^featured:/.test(line)))
    lines.push("featured: false");
  if (!lines.some((line) => /^draft:/.test(line))) lines.push("draft: false");
  return `---\n${lines.join("\n")}\n---\n\n${article.body.trim()}\n`;
}

async function readMarkdownEntries(root) {
  const entries = [];
  async function walk(directory) {
    let children;
    try {
      children = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const child of children) {
      if (child.name.startsWith(".")) continue;
      const absolute = resolve(directory, child.name);
      if (child.isDirectory()) await walk(absolute);
      else if (child.isFile() && child.name.toLowerCase().endsWith(".md")) {
        const content = await readFile(absolute, "utf8");
        entries.push({
          absolute,
          filename: child.name,
          rootRelativePath: toPosix(relative(root, absolute)),
          content,
          hash: shortHash(content),
          document: parseMarkdownDocument(content),
        });
      }
    }
  }
  await walk(root);
  return entries.sort((a, b) =>
    a.rootRelativePath.localeCompare(b.rootRelativePath, "zh-CN"),
  );
}

function relativePathFromArticles(target, folder, filename) {
  return [target.relative === "." ? "" : target.relative, folder, filename]
    .filter(Boolean)
    .join("/");
}

function findRelocationMatch(article, incomingContent, entries, usedPaths) {
  const available = entries.filter(
    (entry) => !usedPaths.has(entry.rootRelativePath),
  );
  const exactLine = available.filter(
    (entry) =>
      Number(entry.document.fields.sourceLine) === article.sourceLine &&
      entry.document.fields.title === article.title,
  );
  if (exactLine.length === 1) return { entry: exactLine[0], warning: "" };
  if (exactLine.length > 1)
    return {
      entry: null,
      warning: `找到 ${exactLine.length} 个旧文件候选，无法唯一匹配，未自动移动`,
    };
  const sameTitle = available.filter(
    (entry) => entry.document.fields.title === article.title,
  );
  const sameContent = sameTitle.filter((entry) =>
    documentsMatch(entry.content, incomingContent),
  );
  if (sameContent.length === 1) return { entry: sameContent[0], warning: "" };
  if (sameContent.length > 1)
    return {
      entry: null,
      warning: `找到 ${sameContent.length} 个内容一致的旧文件，无法唯一匹配，未自动移动`,
    };
  const sameCategory = sameTitle.filter(
    (entry) => entry.document.fields.category === article.category,
  );
  if (sameCategory.length === 1) return { entry: sameCategory[0], warning: "" };
  if (sameTitle.length === 1) return { entry: sameTitle[0], warning: "" };
  if (sameTitle.length > 1)
    return {
      entry: null,
      warning: `找到 ${sameTitle.length} 个同标题旧文件，无法唯一匹配，未自动移动`,
    };
  return { entry: null, warning: "" };
}

function publicPreviewItem(item) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    folder: item.folder,
    filename: item.filename,
    relativePath: item.relativePath,
    existingFilename: item.existingFilename,
    existingRelativePath: item.existingRelativePath,
    existingHash: item.existingHash,
    existingContent: item.existingContent,
    incomingContent: item.incomingContent,
    warning: item.warning,
  };
}

export async function buildImportPreview(input, config = {}) {
  const articlesRoot = config.articlesRoot || ARTICLES_ROOT;
  const target = resolveTargetDirectory(input.targetDir, articlesRoot);
  const sourceDate = input.sourceDate || new Date().toISOString().slice(0, 10);
  const { articles, options } = extractKnowledge(input.sourceText, {
    ...input,
    sourceName: input.sourceName,
  });
  if (!articles.length)
    throw new Error(`没有找到可导入的 ${options.level} 级标题正文`);
  const existingEntries = await readMarkdownEntries(target.absolute);
  const byRootRelativePath = new Map(
    existingEntries.map((entry) => [entry.rootRelativePath, entry]),
  );
  const usedPaths = new Set();
  const titleCounts = new Map();
  const internalItems = [];

  for (const article of articles) {
    const folder = options.autoFolder
      ? sanitizeFolderName(article.headingByLevel[options.folderLevel])
      : "";
    const baseFilename = sanitizeFilename(article.title);
    const countKey = `${folder}\0${baseFilename}`;
    const count = (titleCounts.get(countKey) || 0) + 1;
    titleCounts.set(countKey, count);
    const filename = withSuffix(baseFilename, count);
    const rootRelativePath = [folder, filename].filter(Boolean).join("/");
    const relativePath = relativePathFromArticles(target, folder, filename);
    const incomingContent = renderNewArticle(article, sourceDate);
    let existing = byRootRelativePath.get(rootRelativePath) || null;
    let warning = "";
    let relocated = false;
    if (existing && usedPaths.has(existing.rootRelativePath)) existing = null;
    if (!existing) {
      const match = findRelocationMatch(
        article,
        incomingContent,
        existingEntries,
        usedPaths,
      );
      existing = match.entry;
      warning = match.warning;
      relocated = Boolean(existing);
    }
    if (existing) usedPaths.add(existing.rootRelativePath);
    let status = "new";
    if (existing) {
      const same = documentsMatch(existing.content, incomingContent);
      status = relocated
        ? same
          ? "rename"
          : "conflict"
        : same
          ? "identical"
          : "conflict";
    }
    const id = shortHash(
      `${relativePath}\0${article.sourceLine}\0${article.title}`,
    );
    internalItems.push({
      id,
      title: article.title,
      status,
      folder,
      filename,
      relativePath,
      rootRelativePath,
      targetAbsolute: resolve(target.absolute, ...rootRelativePath.split("/")),
      existingFilename: existing?.filename || null,
      existingRelativePath: existing
        ? relativePathFromArticles(target, "", existing.rootRelativePath)
        : null,
      existingAbsolute: existing?.absolute || null,
      existingHash: existing?.hash || null,
      existingContent: existing?.content || "",
      incomingContent,
      article,
      relocated,
      warning,
    });
  }

  const summary = internalItems.reduce(
    (result, item) => {
      result[item.status] += 1;
      return result;
    },
    { new: 0, identical: 0, conflict: 0, rename: 0 },
  );
  const folderCounts = new Map();
  for (const item of internalItems) {
    const key =
      item.folder || (target.relative === "." ? "." : target.relative);
    folderCounts.set(key, (folderCounts.get(key) || 0) + 1);
  }
  const folderSummary = [...folderCounts].map(([folder, count]) => ({
    folder,
    count,
    fallback: options.autoFolder && folder === FALLBACK_FOLDER,
  }));
  return {
    targetDir: target.relative,
    sourceName: options.sourceName,
    autoFolder: options.autoFolder,
    folderLevel: options.folderLevel,
    folderSummary,
    fallbackCount: internalItems.filter(
      (item) => item.folder === FALLBACK_FOLDER,
    ).length,
    warningCount: internalItems.filter((item) => item.warning).length,
    items: internalItems.map(publicPreviewItem),
    summary,
    _internalItems: internalItems,
  };
}

async function nextAvailablePath(item, reserved) {
  const extension = extname(item.filename);
  const stem = basename(item.filename, extension).replace(/-\d+$/, "");
  let index = 2;
  let filename = `${stem}-${index}${extension}`;
  let rootRelativePath = [item.folder, filename].filter(Boolean).join("/");
  while (reserved.has(rootRelativePath)) {
    index += 1;
    filename = `${stem}-${index}${extension}`;
    rootRelativePath = [item.folder, filename].filter(Boolean).join("/");
  }
  return { filename, rootRelativePath };
}

async function safeWriteAndVerify(file, content) {
  await mkdir(resolve(file, ".."), { recursive: true });
  const temporary = `${file}.importing-${process.pid}-${Date.now()}`;
  const backup = `${file}.backup-${process.pid}-${Date.now()}`;
  await writeFile(temporary, content, "utf8");
  if ((await readFile(temporary, "utf8")) !== content) {
    await rm(temporary, { force: true });
    throw new Error(`写入校验失败：${basename(file)}`);
  }
  const existed = await fileExists(file);
  if (existed) await rename(file, backup);
  try {
    await rename(temporary, file);
    if (existed) await rm(backup, { force: true });
  } catch (error) {
    await rm(temporary, { force: true });
    if (existed && !(await fileExists(file))) await rename(backup, file);
    throw error;
  }
}

function assertPreviewUnchanged(current, expectedItems = []) {
  const expected = new Map(expectedItems.map((item) => [item.id, item]));
  for (const item of current.items) {
    const old = expected.get(item.id);
    if (!old)
      throw new Error(`预览结果已变化，请重新预览：${item.relativePath}`);
    if (
      old.status !== item.status ||
      old.relativePath !== item.relativePath ||
      old.existingRelativePath !== item.existingRelativePath ||
      old.existingHash !== item.existingHash
    ) {
      throw new Error(
        `文件在预览后发生变化，请重新预览：${item.existingRelativePath || item.relativePath}`,
      );
    }
  }
}

export async function applyImport(
  input,
  decisions = {},
  expectedItems = [],
  config = {},
) {
  const articlesRoot = config.articlesRoot || ARTICLES_ROOT;
  const preview = await buildImportPreview(input, { articlesRoot });
  assertPreviewUnchanged(
    preview,
    expectedItems.length ? expectedItems : preview.items,
  );
  const target = resolveTargetDirectory(preview.targetDir, articlesRoot);
  const reserved = new Set(
    (await readMarkdownEntries(target.absolute)).map(
      (entry) => entry.rootRelativePath,
    ),
  );
  const result = {
    created: 0,
    replaced: 0,
    kept: 0,
    keptBoth: 0,
    identical: 0,
    renamed: 0,
  };

  for (const item of preview._internalItems) {
    if (item.status === "identical") {
      result.identical += 1;
      continue;
    }
    if (item.status === "new") {
      if (await fileExists(item.targetAbsolute))
        throw new Error(`目标文件已存在，请重新预览：${item.relativePath}`);
      await safeWriteAndVerify(item.targetAbsolute, item.incomingContent);
      reserved.add(item.rootRelativePath);
      result.created += 1;
      continue;
    }
    if (item.status === "rename") {
      if (!item.existingAbsolute || (await fileExists(item.targetAbsolute)))
        throw new Error(`无法安全移动/改名，请重新预览：${item.relativePath}`);
      await safeWriteAndVerify(item.targetAbsolute, item.existingContent);
      await rm(item.existingAbsolute, { force: true });
      reserved.delete(
        toPosix(relative(target.absolute, item.existingAbsolute)),
      );
      reserved.add(item.rootRelativePath);
      result.renamed += 1;
      continue;
    }
    const decision = decisions[item.id];
    if (!["keep", "replace", "keepBoth"].includes(decision))
      throw new Error(`请选择冲突处理方式：${item.title}`);
    if (decision === "keep") {
      result.kept += 1;
      continue;
    }
    if (decision === "keepBoth") {
      let destination = {
        filename: item.filename,
        rootRelativePath: item.rootRelativePath,
      };
      if (reserved.has(destination.rootRelativePath))
        destination = await nextAvailablePath(item, reserved);
      const absolute = resolve(
        target.absolute,
        ...destination.rootRelativePath.split("/"),
      );
      if (await fileExists(absolute))
        throw new Error(
          `同时保留的目标文件已存在，请重新预览：${destination.rootRelativePath}`,
        );
      await safeWriteAndVerify(absolute, item.incomingContent);
      reserved.add(destination.rootRelativePath);
      result.keptBoth += 1;
      continue;
    }
    const replacement = replaceFrontmatterFields(
      item.existingContent,
      item.article,
    );
    await safeWriteAndVerify(item.targetAbsolute, replacement);
    if (
      item.relocated &&
      item.existingAbsolute &&
      item.existingAbsolute !== item.targetAbsolute
    ) {
      await rm(item.existingAbsolute, { force: true });
      reserved.delete(
        toPosix(relative(target.absolute, item.existingAbsolute)),
      );
    }
    reserved.add(item.rootRelativePath);
    result.replaced += 1;
  }
  return { targetDir: target.relative, summary: result };
}

async function fileExists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export async function listArticleFolders(config = {}) {
  const articlesRoot = config.articlesRoot || ARTICLES_ROOT;
  const folders = ["."];
  async function walk(directory) {
    let entries = [];
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const child = resolve(directory, entry.name);
      folders.push(toPosix(relative(articlesRoot, child)));
      await walk(child);
    }
  }
  await walk(articlesRoot);
  return unique([".", DEFAULT_TARGET_DIR, ...folders]).sort((left, right) =>
    left.localeCompare(right, "zh-CN"),
  );
}
