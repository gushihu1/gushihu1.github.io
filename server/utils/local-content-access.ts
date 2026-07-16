import type { H3Event } from "h3";

export function assertLocalContentAccess(event: H3Event) {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: "页面不存在" });
  }

  const requestHost = String(event.node.req.headers.host || "")
    .replace(/^\[/, "")
    .replace(/\](?::\d+)?$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
  if (!["localhost", "127.0.0.1", "::1"].includes(requestHost)) {
    throw createError({
      statusCode: 403,
      statusMessage: "内容导入仅允许从本机 localhost 使用",
    });
  }
}
