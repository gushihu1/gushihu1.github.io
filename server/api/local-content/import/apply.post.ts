import { applyImport } from "~~/scripts/knowledge-import-core.mjs";

export default defineEventHandler(async (event) => {
  assertLocalContentAccess(event);
  const body = await readBody(event);
  if (!body?.input?.sourceText || !Array.isArray(body?.expectedItems)) {
    throw createError({
      statusCode: 400,
      statusMessage: "导入预览信息不完整，请重新预览",
    });
  }
  return await applyImport(
    body.input,
    body.decisions || {},
    body.expectedItems,
  );
});
