import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
  applyImport,
  buildImportPreview,
  documentsMatch,
  resolveTargetDirectory,
  sanitizeFolderName,
  sanitizeFilename,
} from "./knowledge-import-core.mjs";

async function withWorkspace(run) {
  const root = await mkdtemp(resolve(tmpdir(), "blog-import-"));
  const articlesRoot = resolve(root, "content/articles");
  await mkdir(resolve(articlesRoot, "generated"), { recursive: true });
  try {
    await run({
      root,
      articlesRoot,
      target: resolve(articlesRoot, "generated"),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function input(sourceText) {
  return {
    sourceText,
    sourceName: "知识库.md",
    sourceDate: "2026-07-16",
    targetDir: "generated",
    preset: "generic",
    level: 2,
    category: "Vue",
  };
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

test("标题文件名保留中文并清理非法字符", () => {
  assert.equal(
    sanitizeFilename("==Pinia：持久化/方案?=="),
    "Pinia：持久化-方案.md",
  );
  assert.equal(sanitizeFilename("CON"), "_CON.md");
  assert.ok(sanitizeFilename("很长".repeat(80)).length <= 103);
});

test("标题和正文中的高亮标记会保留给展示层解析", async () => {
  await withWorkspace(async ({ articlesRoot }) => {
    const sourceInput = {
      ...input("### Vue\n#### ==标题==\n\n正文包含 ==重点=="),
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.match(preview.items[0].incomingContent, /title: "==标题=="/);
    assert.match(preview.items[0].incomingContent, /正文包含 ==重点==/);
  });
});

test("比较忽略发布字段、旧来源字段和换行差异", () => {
  const left = `---\ntitle: "文章"\ndate: 2025-01-01\ncategory: "Vue"\ntags: [Vue, Pinia]\ndraft: true\nsourceLine: 12\n---\n\n正文\r\n`;
  const right = `---\ntitle: "文章"\ndate: 2026-07-16\ncategory: "Vue"\ntags: ["Vue", "Pinia"]\ndraft: false\n---\n\n正文\n`;
  assert.equal(documentsMatch(left, right), true);
});

test("预览区分新增、一致与冲突", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const source = "## Pinia 持久化\n\n新正文";
    let preview = await buildImportPreview(input(source), { articlesRoot });
    assert.equal(preview.summary.new, 1);
    await writeFile(
      resolve(target, preview.items[0].filename),
      preview.items[0].incomingContent,
      "utf8",
    );

    preview = await buildImportPreview(input(source), { articlesRoot });
    assert.equal(preview.summary.identical, 1);

    await writeFile(
      resolve(target, preview.items[0].filename),
      preview.items[0].incomingContent.replace("新正文", "本地正文"),
      "utf8",
    );
    preview = await buildImportPreview(input(source), { articlesRoot });
    assert.equal(preview.summary.conflict, 1);
  });
});

test("替换正文时保留现有发布字段", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const original = `---\ntitle: "文章"\ndescription: "人工摘要"\ndate: 2024-01-02\ncategory: "Vue"\ntags: ["Vue"]\nfeatured: true\ndraft: true\nreadingTime: "9 min"\n---\n\n本地正文\n`;
    await writeFile(resolve(target, "文章.md"), original, "utf8");
    const sourceInput = input("## 文章\n\n导入后的正文");
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    const conflict = preview.items[0];
    await applyImport(
      sourceInput,
      { [conflict.id]: "replace" },
      preview.items,
      { articlesRoot },
    );
    const result = await readFile(resolve(target, "文章.md"), "utf8");
    assert.match(result, /description: "人工摘要"/);
    assert.match(result, /date: 2024-01-02/);
    assert.match(result, /featured: true/);
    assert.match(result, /draft: true/);
    assert.match(result, /导入后的正文/);
    assert.doesNotMatch(result, /本地正文/);
  });
});

test("同时保留连续分配数字后缀且不覆盖现有文件", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    await writeFile(
      resolve(target, "文章.md"),
      `---\ntitle: "文章"\ndate: 2024-01-01\ncategory: "Vue"\ntags: ["Vue"]\nfeatured: false\ndraft: false\n---\n\n旧正文\n`,
      "utf8",
    );
    await writeFile(resolve(target, "文章-2.md"), "不要覆盖", "utf8");
    const sourceInput = input("## 文章\n\n新正文");
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    await applyImport(
      sourceInput,
      { [preview.items[0].id]: "keepBoth" },
      preview.items,
      { articlesRoot },
    );
    assert.equal(
      await readFile(resolve(target, "文章-2.md"), "utf8"),
      "不要覆盖",
    );
    assert.match(
      await readFile(resolve(target, "文章-3.md"), "utf8"),
      /新正文/,
    );
    assert.match(await readFile(resolve(target, "文章.md"), "utf8"), /旧正文/);
  });
});

test("旧编号文章可以安全改成标题文件名", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const legacy = `---\ntitle: "文章"\ndate: 2026-07-16\ncategory: "Vue"\ntags: ["Vue"]\nfeatured: false\ndraft: false\nreadingTime: "1 min"\nsourceId: "frontend"\nsourceFile: "知识库.md"\nsourceLine: 1\n---\n\n正文\n`;
    await writeFile(resolve(target, "vue-001-old.md"), legacy, "utf8");
    const sourceInput = input("## 文章\n\n正文");
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.equal(preview.items[0].status, "rename");
    await applyImport(sourceInput, {}, preview.items, { articlesRoot });
    assert.equal(await exists(resolve(target, "vue-001-old.md")), false);
    assert.equal(await exists(resolve(target, "文章.md")), true);
  });
});

test("未出现在来源中的旧文章不会被删除", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    await writeFile(resolve(target, "历史文章.md"), "历史内容", "utf8");
    const sourceInput = input("## 新文章\n\n新内容");
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    await applyImport(sourceInput, {}, preview.items, { articlesRoot });
    assert.equal(
      await readFile(resolve(target, "历史文章.md"), "utf8"),
      "历史内容",
    );
  });
});

test("拒绝目标目录路径穿越", () => {
  assert.throws(
    () => resolveTargetDirectory("../outside", resolve("content/articles")),
    /根目录/,
  );
  assert.throws(
    () => resolveTargetDirectory("C:\\outside", resolve("content/articles")),
    /绝对路径/,
  );
});

test("content/articles 根目录使用点号且目录名安全清理", () => {
  const root = resolve("content/articles");
  assert.deepEqual(resolveTargetDirectory(".", root), {
    absolute: root,
    relative: ".",
  });
  assert.equal(sanitizeFolderName("**Vue/生态?**."), "Vue-生态");
  assert.equal(sanitizeFolderName("<>:?*"), "其他");
});

test("四级文章按三级父标题分目录，缺失父标题进入其他", async () => {
  await withWorkspace(async ({ articlesRoot }) => {
    const sourceInput = {
      ...input(`## 技术回答
### Vue
#### 生命周期

正文一

## 独立章节
#### 无父标题文章

正文二`),
      targetDir: ".",
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.deepEqual(
      preview.items.map((item) => item.relativePath),
      ["Vue/生命周期.md", "其他/无父标题文章.md"],
    );
    assert.equal(preview.fallbackCount, 1);
    assert.deepEqual(
      preview.folderSummary.map(({ folder, count }) => [folder, count]),
      [
        ["Vue", 1],
        ["其他", 1],
      ],
    );
  });
});

test("同标题在不同目录不加后缀，同一目录连续编号", async () => {
  await withWorkspace(async ({ articlesRoot }) => {
    const sourceInput = {
      ...input(`### Vue
#### 基础

A
#### 基础

B
### React
#### 基础

C`),
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.deepEqual(
      preview.items.map((item) => item.relativePath),
      [
        "generated/Vue/基础.md",
        "generated/Vue/基础-2.md",
        "generated/React/基础.md",
      ],
    );
  });
});

test("关闭自动分类时继续平铺导入", async () => {
  await withWorkspace(async ({ articlesRoot }) => {
    const sourceInput = {
      ...input("### Vue\n#### 生命周期\n\n正文"),
      level: 4,
      autoFolder: false,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.equal(preview.items[0].relativePath, "generated/生命周期.md");
  });
});

test("新导入根目录会按需创建分类子目录", async () => {
  await withWorkspace(async ({ articlesRoot }) => {
    const sourceInput = {
      ...input("### 工程化\n#### 构建流程\n\n正文"),
      targetDir: "新知识库",
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.equal(preview.items[0].relativePath, "新知识库/工程化/构建流程.md");
    await applyImport(sourceInput, {}, preview.items, { articlesRoot });
    assert.equal(
      await exists(resolve(articlesRoot, "新知识库/工程化/构建流程.md")),
      true,
    );
  });
});

test("唯一旧平铺文章可安全移动到自动分类目录", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const sourceInput = {
      ...input("### Vue\n#### 生命周期\n\n正文"),
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const first = await buildImportPreview(sourceInput, { articlesRoot });
    await writeFile(
      resolve(target, "生命周期.md"),
      first.items[0].incomingContent,
      "utf8",
    );
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.equal(preview.items[0].status, "rename");
    assert.equal(
      preview.items[0].existingRelativePath,
      "generated/生命周期.md",
    );
    assert.equal(preview.items[0].relativePath, "generated/Vue/生命周期.md");
    await applyImport(sourceInput, {}, preview.items, { articlesRoot });
    assert.equal(await exists(resolve(target, "生命周期.md")), false);
    assert.equal(await exists(resolve(target, "Vue/生命周期.md")), true);
  });
});

test("跨目录冲突替换后删除旧文件，同时保留则保留旧文件", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const base = {
      ...input("### Vue\n#### 生命周期\n\n新正文"),
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const old = `---\ntitle: "生命周期"\ndate: 2024-01-01\ncategory: "Vue"\ntags: ["Vue"]\nfeatured: true\ndraft: false\n---\n\n旧正文\n`;
    await writeFile(resolve(target, "生命周期.md"), old, "utf8");
    let preview = await buildImportPreview(base, { articlesRoot });
    await applyImport(
      base,
      { [preview.items[0].id]: "keepBoth" },
      preview.items,
      { articlesRoot },
    );
    assert.equal(await exists(resolve(target, "生命周期.md")), true);
    assert.equal(await exists(resolve(target, "Vue/生命周期.md")), true);

    await rm(resolve(target, "Vue/生命周期.md"));
    preview = await buildImportPreview(base, { articlesRoot });
    await applyImport(
      base,
      { [preview.items[0].id]: "replace" },
      preview.items,
      { articlesRoot },
    );
    assert.equal(await exists(resolve(target, "生命周期.md")), false);
    const replaced = await readFile(resolve(target, "Vue/生命周期.md"), "utf8");
    assert.match(replaced, /date: 2024-01-01/);
    assert.match(replaced, /featured: true/);
    assert.match(replaced, /新正文/);
  });
});

test("多个旧文章候选只警告，不移动或删除", async () => {
  await withWorkspace(async ({ articlesRoot, target }) => {
    const old = (body) =>
      `---\ntitle: "文章"\ncategory: "Vue"\ntags: ["Vue"]\n---\n\n${body}\n`;
    await mkdir(resolve(target, "旧一"), { recursive: true });
    await mkdir(resolve(target, "旧二"), { recursive: true });
    await writeFile(resolve(target, "旧一/文章.md"), old("A"), "utf8");
    await writeFile(resolve(target, "旧二/文章.md"), old("B"), "utf8");
    const sourceInput = {
      ...input("### Vue\n#### 文章\n\n新正文"),
      level: 4,
      autoFolder: true,
      folderLevel: 3,
    };
    const preview = await buildImportPreview(sourceInput, { articlesRoot });
    assert.equal(preview.items[0].status, "new");
    assert.match(preview.items[0].warning, /无法唯一匹配/);
    await applyImport(sourceInput, {}, preview.items, { articlesRoot });
    assert.equal(await exists(resolve(target, "旧一/文章.md")), true);
    assert.equal(await exists(resolve(target, "旧二/文章.md")), true);
    assert.equal(await exists(resolve(target, "Vue/文章.md")), true);
  });
});
