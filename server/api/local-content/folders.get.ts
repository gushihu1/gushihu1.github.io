import { listArticleFolders } from "~~/scripts/knowledge-import-core.mjs";

export default defineEventHandler(async (event) => {
  assertLocalContentAccess(event);
  return { folders: await listArticleFolders() };
});
