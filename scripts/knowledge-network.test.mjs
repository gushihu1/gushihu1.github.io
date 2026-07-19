import assert from "node:assert/strict";
import {
  buildKnowledgeNetwork,
  getKnowledgeConnections,
} from "../app/utils/knowledge.ts";

const network = buildKnowledgeNetwork({
  articles: [
    {
      stem: "articles/大屏项目功能/大屏底图用的是什么",
      path: "/articles/",
      title: "大屏底图用的是什么",
      category: "大屏项目功能",
      body: {
        children: [
          {
            data: {
              hProperties: { dataKnowledgeTarget: "/projects/data-cockpit" },
            },
          },
          { props: { "data-knowledge-target": "/projects/data-cockpit" } },
          {
            props: {
              dataKnowledgeTarget: "/articles/大屏项目功能/大屏底图用的是什么",
            },
          },
          { props: { dataKnowledgeTarget: "/articles/missing" } },
          { props: { dataKnowledgeTarget: "/articles/draft" } },
        ],
      },
    },
    {
      stem: "articles/大屏项目功能/大屏如何适配不同尺寸的屏幕",
      path: "/articles/",
      title: "大屏如何适配不同尺寸的屏幕",
      category: "大屏项目功能",
      body: {
        value: [
          "a",
          {
            dataKnowledgeTarget: "/articles/大屏项目功能/大屏底图用的是什么",
          },
          "底图",
        ],
      },
    },
    {
      stem: "articles/draft",
      path: "/articles/draft",
      title: "草稿",
      draft: true,
    },
  ],
  projects: [
    {
      stem: "projects/data-cockpit",
      path: "/projects/data-cockpit",
      title: "数据驾驶舱",
    },
    {
      stem: "projects/data-cockpit-copy",
      path: "/projects/data-cockpit",
      title: "重复路径项目",
    },
  ],
  showcases: [
    {
      stem: "showcases/data-cockpit",
      title: "驾驶舱作品",
      body: {
        props: { dataKnowledgeTarget: "/projects/data-cockpit" },
      },
    },
  ],
});

assert.equal(network.nodes.length, 5, "应排除草稿并增加一个分类节点");
assert.equal(network.categoryLinks.length, 2, "应生成文章分类关系");
assert.equal(network.relations.length, 3, "应合并重复 Wiki Link 关系");
assert.ok(
  network.nodes.some(
    (node) => node.id === "/articles/大屏项目功能/大屏底图用的是什么",
  ),
  "文章节点应使用完整 stem 路径",
);
assert.ok(
  network.nodes.some(
    (node) => node.id === "/articles/大屏项目功能/大屏如何适配不同尺寸的屏幕",
  ),
  "相同 source.path 的文章应保留为独立节点",
);
assert.ok(network.warnings.some((item) => item.includes("自身关联")));
assert.ok(network.warnings.some((item) => item.includes("不存在")));
assert.ok(network.warnings.some((item) => item.includes("草稿")));
assert.ok(network.warnings.some((item) => item.includes("重复内容路径")));

const projectConnections = getKnowledgeConnections(
  network,
  "/projects/data-cockpit",
);
assert.deepEqual(
  projectConnections.incoming.map((node) => node.title),
  ["大屏底图用的是什么", "驾驶舱作品"],
  "项目应自动获得正文 Wiki Link 的反向引用",
);

const articleConnections = getKnowledgeConnections(
  network,
  "/articles/大屏项目功能/大屏底图用的是什么",
);
assert.deepEqual(
  articleConnections.incoming.map((node) => node.title),
  ["大屏如何适配不同尺寸的屏幕"],
  "完整文章路径应支持反向引用",
);

console.log("knowledge network tests passed");
