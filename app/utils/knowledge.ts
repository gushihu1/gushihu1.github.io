export type KnowledgeNodeKind = "article" | "project" | "showcase" | "category";

export type KnowledgeRelationKind = "wiki";

export interface KnowledgeSource {
  path?: string;
  stem: string;
  title: string;
  description?: string;
  tags?: string[];
  draft?: boolean;
  body?: unknown;
  category?: string;
}

export interface KnowledgeNode {
  id: string;
  path: string;
  title: string;
  description: string;
  kind: KnowledgeNodeKind;
  tags: string[];
  category?: string;
  virtual?: boolean;
}

export interface KnowledgeRelation {
  source: string;
  target: string;
  kind: KnowledgeRelationKind;
}

export interface KnowledgeCategoryLink {
  source: string;
  target: string;
}

export interface KnowledgeNetwork {
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  categoryLinks: KnowledgeCategoryLink[];
  warnings: string[];
}

export interface KnowledgeConnections {
  outgoing: KnowledgeNode[];
  incoming: KnowledgeNode[];
}

interface KnowledgeNetworkInput {
  articles: KnowledgeSource[];
  projects: KnowledgeSource[];
  showcases: KnowledgeSource[];
}

const normalizeTitle = (title: string) =>
  title.replace(/==([^=\r\n]+)==/g, "$1").trim();

const decodePath = (value: string) => {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
};

export const normalizeKnowledgePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, "");
  const [pathWithQuery = "", hash = ""] = withoutOrigin.split("#", 2);
  const [rawPath = ""] = pathWithQuery.split("?", 1);
  let path = decodePath(rawPath.replace(/\\/g, "/"));
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");

  return hash ? `${path}#${decodePath(hash)}` : path;
};

const getStemSlug = (stem: string, collection: string) =>
  stem
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${collection}/`), "")
    .replace(/\\/g, "/");

export const getShowcaseAnchor = (stem: string) =>
  `showcase-${getStemSlug(stem, "showcases").replace(/\/+/g, "--")}`;

export const getShowcasePath = (stem: string) =>
  `/showcase#${getShowcaseAnchor(stem)}`;

const getSourcePath = (source: KnowledgeSource, kind: KnowledgeNodeKind) => {
  if (kind === "showcase") return getShowcasePath(source.stem);
  if (kind === "article") {
    return normalizeKnowledgePath(
      `/articles/${getStemSlug(source.stem, "articles")}`,
    );
  }
  if (source.path) return normalizeKnowledgePath(source.path);
  return normalizeKnowledgePath(
    `/projects/${getStemSlug(source.stem, "projects")}`,
  );
};

const toNode = (
  source: KnowledgeSource,
  kind: Exclude<KnowledgeNodeKind, "category">,
): KnowledgeNode => ({
  id: getSourcePath(source, kind),
  path: getSourcePath(source, kind),
  title: normalizeTitle(source.title),
  description: source.description || "",
  kind,
  tags: [...(source.tags || [])],
  category: source.category,
});

const categoryNodeId = (category: string) =>
  `category:${encodeURIComponent(category)}`;

const relationSort = (left: KnowledgeRelation, right: KnowledgeRelation) =>
  left.source.localeCompare(right.source, "zh-CN") ||
  left.target.localeCompare(right.target, "zh-CN");

const collectWikiTargets = (body: unknown) => {
  const targets = new Set<string>();
  const visited = new Set<object>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object" || visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    const record = value as Record<string, unknown>;
    const data = record.data as Record<string, unknown> | undefined;
    const properties = [
      record,
      record.props,
      record.attributes,
      data?.hProperties,
    ];
    for (const value of properties) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      const target =
        item.dataKnowledgeTarget ||
        item["data-knowledge-target"] ||
        item.data_knowledge_target;
      if (typeof target === "string" && target)
        targets.add(normalizeKnowledgePath(target));
    }
    for (const item of Object.values(record)) visit(item);
  };
  visit(body);
  return [...targets];
};

export const buildKnowledgeNetwork = ({
  articles,
  projects,
  showcases,
}: KnowledgeNetworkInput): KnowledgeNetwork => {
  const warnings: string[] = [];
  const sources = [
    ...articles.map((source) => ({ source, kind: "article" as const })),
    ...projects.map((source) => ({ source, kind: "project" as const })),
    ...showcases.map((source) => ({ source, kind: "showcase" as const })),
  ];
  const allContentNodes = sources.map(({ source, kind }) => ({
    node: toNode(source, kind),
    source,
  }));
  const publicContentNodes: typeof allContentNodes = [];
  const publicPathSet = new Set<string>();
  for (const item of allContentNodes) {
    if (item.source.draft) continue;
    if (publicPathSet.has(item.node.id)) {
      warnings.push(`忽略重复内容路径：${item.node.id}`);
      continue;
    }
    publicPathSet.add(item.node.id);
    publicContentNodes.push(item);
  }
  const publicNodeMap = new Map(
    publicContentNodes.map(({ node }) => [node.id, node]),
  );
  const draftPaths = new Set(
    allContentNodes
      .filter(({ source }) => source.draft)
      .map(({ node }) => node.id),
  );

  const categories = [
    ...new Set(
      publicContentNodes
        .map(({ node }) => node.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ].sort((left, right) => left.localeCompare(right, "zh-CN"));
  const categoryNodes: KnowledgeNode[] = categories.map((category) => ({
    id: categoryNodeId(category),
    path: `/articles?category=${encodeURIComponent(category)}`,
    title: category,
    description: `${category} 分类下的文章`,
    kind: "category",
    tags: [],
    category,
    virtual: true,
  }));
  const categoryLinks: KnowledgeCategoryLink[] = publicContentNodes
    .filter(({ node }) => node.kind === "article" && node.category)
    .map(({ node }) => ({
      source: categoryNodeId(node.category as string),
      target: node.id,
    }));

  const relations: KnowledgeRelation[] = [];
  const relationKeys = new Set<string>();
  const addRelation = (
    source: string,
    rawTarget: string,
    kind: KnowledgeRelationKind,
  ) => {
    const target = normalizeKnowledgePath(rawTarget);
    if (!target) return;
    if (source === target) {
      warnings.push(`忽略自身关联：${source}`);
      return;
    }
    if (!publicNodeMap.has(target)) {
      warnings.push(
        draftPaths.has(target)
          ? `忽略指向草稿的关联：${source} -> ${target}`
          : `忽略不存在的关联：${source} -> ${target}`,
      );
      return;
    }

    const key = `${source}\0${target}`;
    if (relationKeys.has(key)) return;
    relationKeys.add(key);
    relations.push({ source, target, kind });
  };

  for (const { node, source } of publicContentNodes) {
    for (const target of collectWikiTargets(source.body)) {
      addRelation(node.id, target, "wiki");
    }
  }

  return {
    nodes: [...categoryNodes, ...publicContentNodes.map(({ node }) => node)],
    relations: relations.sort(relationSort),
    categoryLinks,
    warnings: [...new Set(warnings)],
  };
};

const nodeSort = (left: KnowledgeNode, right: KnowledgeNode) =>
  left.title.localeCompare(right.title, "zh-CN");

export const getKnowledgeConnections = (
  network: KnowledgeNetwork,
  rawCurrentPath: string,
): KnowledgeConnections => {
  const currentPath = normalizeKnowledgePath(rawCurrentPath);
  const nodeMap = new Map(network.nodes.map((node) => [node.id, node]));
  const outgoingIds = new Set(
    network.relations
      .filter((relation) => relation.source === currentPath)
      .map((relation) => relation.target),
  );
  const incomingIds = new Set(
    network.relations
      .filter((relation) => relation.target === currentPath)
      .map((relation) => relation.source),
  );

  return {
    outgoing: [...outgoingIds]
      .map((id) => nodeMap.get(id))
      .filter((node): node is KnowledgeNode => Boolean(node))
      .sort(nodeSort),
    incoming: [...incomingIds]
      .map((id) => nodeMap.get(id))
      .filter((node): node is KnowledgeNode => Boolean(node))
      .sort(nodeSort),
  };
};
