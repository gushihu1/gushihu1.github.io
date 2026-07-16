import { buildImportPreview } from "~~/scripts/knowledge-import-core.mjs";

export default defineEventHandler(async (event) => {
  assertLocalContentAccess(event);
  const body = await readBody(event);
  if (!body?.sourceText || !body?.sourceName) {
    throw createError({
      statusCode: 400,
      statusMessage: "请选择要导入的 Markdown 文件",
    });
  }
  const preview = await buildImportPreview(body);
  return {
    targetDir: preview.targetDir,
    sourceName: preview.sourceName,
    items: preview.items,
    summary: preview.summary,
    autoFolder: preview.autoFolder,
    folderLevel: preview.folderLevel,
    folderSummary: preview.folderSummary,
    fallbackCount: preview.fallbackCount,
    warningCount: preview.warningCount,
  };
});
