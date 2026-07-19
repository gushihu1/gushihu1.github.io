import remarkWikiLink from "@flowershow/remark-wiki-link";
import { slug } from "github-slugger";
import { relative, resolve } from "node:path";
import type { Plugin } from "unified";
import {
  createVaultIndex,
  resolveWikiTarget,
  splitWikiTarget,
} from "./core.mjs";

interface WikiNode {
  type?: string;
  value?: string;
  children?: WikiNode[];
  data?: {
    alias?: string;
    existing?: boolean;
    path?: string;
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: unknown[];
  };
  position?: { start?: { line?: number; column?: number } };
}

const toPosix = (value: string) => value.replace(/\\/g, "/");

const remarkBlogWikiLinks: Plugin = function () {
  remarkWikiLink.call(this, {
    files: [],
    className: "wiki-link",
    newClassName: "wiki-link--invalid",
  });

  return (tree: WikiNode, file) => {
    const index = createVaultIndex(resolve("content"));
    const filePath = file.path ? resolve(String(file.path)) : "";
    const sourceRelativePath = filePath
      ? toPosix(relative(index.contentRoot, filePath))
      : "";

    const visit = (node: WikiNode) => {
      if (node.type === "wikiLink" || node.type === "embed") {
        const rawTarget = String(node.value || "");
        const result = resolveWikiTarget(index, rawTarget, sourceRelativePath);
        const alias = node.data?.alias;
        const invalidReason =
          node.type === "embed"
            ? "暂不支持 Obsidian 附件嵌入"
            : result.status === "ambiguous"
              ? `目标不唯一：${result.candidates.map((item: { lookupPath: string }) => item.lookupPath).join("、")}`
              : result.status === "draft"
                ? `目标是草稿：${result.note?.relativePath || rawTarget}`
                : result.status === "missing"
                  ? "目标不存在"
                  : "";

        node.data ||= {};
        if (invalidReason || !result.note) {
          node.data.existing = false;
          node.data.path = "#";
          node.data.hName = "a";
          node.data.hProperties = {
            href: "#",
            className: ["wiki-link", "wiki-link--invalid"],
            ariaInvalid: "true",
            title: invalidReason,
          };
          node.data.hChildren = [{ type: "text", value: alias || rawTarget }];
          const location = node.position?.start
            ? `（${node.position.start.line || 0}:${node.position.start.column || 0}）`
            : "";
          file.message(
            new Error(`[wiki-link] ${invalidReason}：${rawTarget}${location}`),
          );
        } else {
          const { heading } = splitWikiTarget(rawTarget);
          const href = heading
            ? `${result.note.route}#${slug(heading)}`
            : result.note.route;
          node.data.existing = true;
          node.data.path = href;
          node.data.hName = "a";
          node.data.hProperties = {
            href,
            className: ["wiki-link"],
            dataWikiLink: "true",
            dataKnowledgeTarget: result.note.route,
          };
          node.data.hChildren = [{ type: "text", value: alias || rawTarget }];
        }
      }
      for (const child of node.children || []) visit(child);
    };
    visit(tree);
  };
};

export default remarkBlogWikiLinks;
