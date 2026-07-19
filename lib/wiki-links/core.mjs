import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

const toPosix = (value) => value.replace(/\\/g, "/");
const stripExtension = (value) => value.replace(/\.mdx?$/i, "");

const readDraft = (content) => {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(
    String(content).replace(/\r\n?/g, "\n"),
  );
  return Boolean(match && /^draft:\s*true\s*$/im.test(match[1]));
};

const routeForNote = (relativePath) => {
  const stem = stripExtension(toPosix(relativePath));
  if (stem.startsWith("articles/")) return `/${stem}`;
  if (stem.startsWith("projects/")) return `/${stem}`;
  if (stem.startsWith("showcases/")) {
    return `/showcase#showcase-${stem.slice("showcases/".length).replace(/\/+/g, "--")}`;
  }
  return "";
};

export function createVaultIndex(contentRoot = resolve("content")) {
  const notes = [];
  const walk = (directory) => {
    let entries = [];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(absolutePath);
      else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
        const relativePath = toPosix(relative(contentRoot, absolutePath));
        const route = routeForNote(relativePath);
        if (!route) continue;
        const content = readFileSync(absolutePath, "utf8");
        notes.push({
          absolutePath,
          relativePath,
          lookupPath: stripExtension(relativePath),
          route,
          draft: readDraft(content),
          content,
        });
      }
    }
  };
  walk(contentRoot);
  notes.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath, "zh-CN"),
  );
  return { contentRoot, notes };
}

export function splitWikiTarget(value) {
  const [path = "", ...headingParts] = String(value || "").split("#");
  return {
    path: stripExtension(path.trim().replace(/^\/+/, "").replace(/\\/g, "/")),
    heading: headingParts.join("#").trim(),
  };
}

export function resolveWikiTarget(index, rawTarget, sourceRelativePath = "") {
  const { path, heading } = splitWikiTarget(rawTarget);
  const source = index.notes.find(
    (note) =>
      note.relativePath.toLocaleLowerCase() ===
      toPosix(sourceRelativePath).toLocaleLowerCase(),
  );
  if (!path && heading && source) {
    return { status: "resolved", note: source, heading };
  }
  if (!path) return { status: "missing", candidates: [], heading };

  const normalized = path.toLocaleLowerCase();
  const candidates = index.notes.filter((note) => {
    const lookup = note.lookupPath.toLocaleLowerCase();
    return lookup === normalized || lookup.endsWith(`/${normalized}`);
  });
  if (!candidates.length) return { status: "missing", candidates: [], heading };
  if (candidates.length > 1)
    return { status: "ambiguous", candidates, heading };
  if (candidates[0].draft)
    return { status: "draft", candidates, note: candidates[0], heading };
  return { status: "resolved", candidates, note: candidates[0], heading };
}

const maskInlineCode = (line) => {
  const chars = [...line];
  const expression = /(`+)([\s\S]*?)\1/g;
  for (const match of line.matchAll(expression)) {
    const start = match.index || 0;
    for (let index = start; index < start + match[0].length; index += 1)
      chars[index] = " ";
  }
  return chars.join("");
};

export function scanWikiLinks(content, file = "") {
  const normalized = String(content).replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const links = [];
  let inFrontmatter = lines[0]?.trim() === "---";
  let inFence = false;
  let fenceMarker = "";

  lines.forEach((line, lineIndex) => {
    if (inFrontmatter) {
      if (lineIndex > 0 && line.trim() === "---") inFrontmatter = false;
      return;
    }
    const fence = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      return;
    }
    if (inFence) return;

    const masked = maskInlineCode(line);
    const expression = /(!?)\[\[([^\]\n]+)\]\]/g;
    for (const match of masked.matchAll(expression)) {
      const start = match.index || 0;
      let slashCount = 0;
      for (
        let index = start - 1;
        index >= 0 && line[index] === "\\";
        index -= 1
      )
        slashCount += 1;
      if (slashCount % 2 === 1) continue;
      const raw = line.slice(start, start + match[0].length);
      const inner = raw.replace(/^!?\[\[|\]\]$/g, "");
      const divider = inner.indexOf("|");
      const target = (divider >= 0 ? inner.slice(0, divider) : inner).trim();
      const alias = divider >= 0 ? inner.slice(divider + 1).trim() : "";
      links.push({
        file,
        line: lineIndex + 1,
        column: start + 1,
        raw,
        target,
        alias,
        embed: Boolean(match[1]),
      });
    }
  });
  return links;
}

export function validateVault(contentRoot = resolve("content")) {
  const index = createVaultIndex(contentRoot);
  const issues = [];
  for (const note of index.notes) {
    for (const link of scanWikiLinks(note.content, note.relativePath)) {
      if (link.embed) {
        issues.push({ ...link, reason: "暂不支持 Obsidian 附件嵌入" });
        continue;
      }
      const result = resolveWikiTarget(index, link.target, note.relativePath);
      if (result.status === "resolved") continue;
      const detail =
        result.status === "ambiguous"
          ? `目标不唯一：${result.candidates.map((item) => item.lookupPath).join("、")}`
          : result.status === "draft"
            ? `目标是草稿：${result.note.relativePath}`
            : "目标不存在";
      issues.push({ ...link, reason: detail });
    }
  }
  return { index, issues };
}

export const wikiLinkTargetSet = (content) =>
  new Set(
    scanWikiLinks(content)
      .filter((link) => !link.embed)
      .map((link) => link.target)
      .filter(Boolean),
  );
