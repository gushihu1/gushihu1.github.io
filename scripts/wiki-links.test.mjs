import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkBlogWikiLinks from "../lib/wiki-links/remark-wiki-links.ts";
import {
  createVaultIndex,
  resolveWikiTarget,
  scanWikiLinks,
  validateVault,
} from "../lib/wiki-links/core.mjs";

const root = await mkdtemp(resolve(tmpdir(), "blog-wiki-links-"));
const oldCwd = process.cwd();
try {
  await mkdir(resolve(root, "content/articles/JS"), { recursive: true });
  await mkdir(resolve(root, "content/articles/代码题"), { recursive: true });
  await mkdir(resolve(root, "content/projects"), { recursive: true });
  await writeFile(
    resolve(root, "content/articles/JS/promise.md"),
    "---\ntitle: promise\ndraft: false\n---\n",
  );
  await writeFile(
    resolve(root, "content/articles/代码题/promise.md"),
    "---\ntitle: promise\ndraft: false\n---\n",
  );
  await writeFile(
    resolve(root, "content/projects/demo.md"),
    "---\ntitle: Demo\ndraft: false\n---\n",
  );

  const contentRoot = resolve(root, "content");
  const index = createVaultIndex(contentRoot);
  assert.equal(resolveWikiTarget(index, "promise").status, "ambiguous");
  assert.equal(
    resolveWikiTarget(index, "JS/promise").note.route,
    "/articles/JS/promise",
  );
  assert.equal(
    scanWikiLinks("`[[Construct]]` [[projects/demo|Demo]]").length,
    1,
    "行内代码不应被识别为 Wiki Link",
  );

  process.chdir(root);
  const sourcePath = resolve(root, "content/articles/JS/source.md");
  await writeFile(sourcePath, "[[projects/demo|Demo]]\n");
  const processor = unified().use(remarkParse).use(remarkBlogWikiLinks);
  const tree = processor.parse("[[projects/demo|Demo]]");
  const transformed = await processor.run(tree, { path: sourcePath });
  const node = transformed.children[0].children[0];
  assert.equal(node.data.hProperties.href, "/projects/demo");
  assert.equal(node.data.hProperties.dataKnowledgeTarget, "/projects/demo");

  const validation = validateVault(contentRoot);
  assert.equal(validation.issues.length, 0);
} finally {
  process.chdir(oldCwd);
  await rm(root, { recursive: true, force: true });
}

console.log("wiki link tests passed");
