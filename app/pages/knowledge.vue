<script setup lang="ts">
import type { KnowledgeNetwork } from "~/utils/knowledge";

definePageMeta({ scrollToTop: false });

useSeoMeta({
  title: "知识图谱",
  description: "浏览文章、项目、作品与分类之间的双向知识关联。",
  ogTitle: "知识图谱",
  ogDescription: "浏览文章、项目、作品与分类之间的双向知识关联。",
});

const { data } = await useKnowledgeNetwork();
const emptyNetwork: KnowledgeNetwork = {
  nodes: [],
  relations: [],
  categoryLinks: [],
  warnings: [],
};
const network = computed(() => data.value || emptyNetwork);
const contentNodeCount = computed(
  () => network.value.nodes.filter((node) => !node.virtual).length,
);
const categoryCount = computed(
  () => network.value.nodes.filter((node) => node.kind === "category").length,
);
const relationCount = computed(() => {
  const keys = new Set(
    network.value.relations.map((relation) =>
      [relation.source, relation.target].sort().join("\0"),
    ),
  );
  return keys.size;
});
</script>

<template>
  <div class="page-shell knowledge-page">
    <header class="page-hero knowledge-hero">
      <div>
        <span class="eyebrow"><span /> KNOWLEDGE GRAPH</span>
        <h1>知识图谱</h1>
        <p>从分类进入知识脉络，也可以沿着显式关联探索文章、项目与作品。</p>
      </div>
      <div class="knowledge-stats" aria-label="知识图谱统计">
        <span
          ><strong>{{ contentNodeCount }}</strong
          >项内容</span
        >
        <span
          ><strong>{{ categoryCount }}</strong
          >个分类</span
        >
        <span
          ><strong>{{ relationCount }}</strong
          >条内容关联</span
        >
      </div>
    </header>

    <ClientOnly>
      <KnowledgeGraph :network="network" />
      <template #fallback>
        <div class="knowledge-graph-loading glass">
          <UIcon name="i-lucide-loader-circle" />
          <span>正在构建知识图谱...</span>
        </div>
      </template>
    </ClientOnly>

    <section class="knowledge-guide glass">
      <div>
        <span class="knowledge-guide__line category" />
        <strong>分类关系</strong>
        <span>组织同一主题下的文章</span>
      </div>
      <div>
        <span class="knowledge-guide__line wiki" />
        <strong>内容关联</strong>
        <span>由正文 Wiki Link 自动建立</span>
      </div>
    </section>
  </div>
</template>
