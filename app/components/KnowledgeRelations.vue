<script setup lang="ts">
import type { KnowledgeNetwork, KnowledgeNode } from "~/utils/knowledge";

const props = withDefaults(
  defineProps<{
    network?: KnowledgeNetwork | null;
    currentPath: string;
    compact?: boolean;
  }>(),
  {
    network: null,
    compact: false,
  },
);

const connections = computed(() =>
  props.network
    ? getKnowledgeConnections(props.network, props.currentPath)
    : { outgoing: [], incoming: [] },
);
const hasConnections = computed(
  () =>
    connections.value.outgoing.length > 0 ||
    connections.value.incoming.length > 0,
);
const kindLabels: Record<KnowledgeNode["kind"], string> = {
  article: "文章",
  project: "项目",
  showcase: "作品",
  category: "分类",
};
</script>

<template>
  <section
    v-if="hasConnections"
    class="knowledge-relations glass"
    :class="{ 'knowledge-relations--compact': compact }"
  >
    <div v-if="connections.outgoing.length" class="knowledge-relations__group">
      <header>
        <span class="eyebrow"><span /> RELATED CONTENT</span>
        <h2>关联内容</h2>
      </header>
      <div class="knowledge-relations__list">
        <NuxtLink
          v-for="node in connections.outgoing"
          :key="node.id"
          :to="node.path"
          class="knowledge-relations__item"
        >
          <span>
            <small>{{ kindLabels[node.kind] }}</small>
            <strong>{{ node.title }}</strong>
          </span>
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </div>
    </div>

    <div v-if="connections.incoming.length" class="knowledge-relations__group">
      <header>
        <span class="eyebrow"><span /> BACKLINKS</span>
        <h2>引用当前内容</h2>
      </header>
      <div class="knowledge-relations__list">
        <NuxtLink
          v-for="node in connections.incoming"
          :key="node.id"
          :to="node.path"
          class="knowledge-relations__item"
        >
          <span>
            <small>{{ kindLabels[node.kind] }}</small>
            <strong>{{ node.title }}</strong>
          </span>
          <UIcon name="i-lucide-corner-down-left" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
