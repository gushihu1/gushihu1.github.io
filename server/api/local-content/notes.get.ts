import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { parseMarkdownDocument } from "~~/scripts/knowledge-import-core.mjs";

const NOTES_ROOT = resolve("content/private-notes");
const toPosix = (value: string) => value.replace(/\\/g, "/");

interface LocalNote {
  id: string;
  title: string;
  relativePath: string;
  content: string;
}

export default defineEventHandler(async (event) => {
  assertLocalContentAccess(event);
  const notes: LocalNote[] = [];

  const walk = async (directory: string) => {
    let entries = [];
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md"))
        continue;

      const source = await readFile(absolutePath, "utf8");
      const document = parseMarkdownDocument(source);
      const fields = document.fields as Record<string, unknown>;
      const relativePath = toPosix(relative(NOTES_ROOT, absolutePath));
      const fallbackTitle = entry.name.replace(/\.md$/i, "");
      const title = String(fields.title || fallbackTitle).replace(
        /^['"]|['"]$/g,
        "",
      );
      notes.push({
        id: relativePath,
        title,
        relativePath,
        content: document.body.trim(),
      });
    }
  };

  await walk(NOTES_ROOT);
  notes.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath, "zh-CN"),
  );
  return { notes };
});
