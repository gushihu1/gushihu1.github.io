<script setup lang="ts">
import { GraphChart, type GraphSeriesOption } from "echarts/charts";
import {
  AriaComponent,
  TooltipComponent,
  type TooltipComponentOption,
} from "echarts/components";
import { type ComposeOption, type ECElementEvent, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import type {
  KnowledgeNetwork,
  KnowledgeNode,
  KnowledgeNodeKind,
} from "~/utils/knowledge";

use([CanvasRenderer, GraphChart, TooltipComponent, AriaComponent]);

type KnowledgeChartOption = ComposeOption<
  GraphSeriesOption | TooltipComponentOption
>;

const props = defineProps<{ network: KnowledgeNetwork }>();
const search = ref("");
const selectedCategory = ref("全部");
const enabledKinds = ref<KnowledgeNodeKind[]>([
  "article",
  "project",
  "showcase",
  "category",
]);
const reducedMotion = usePreferredReducedMotion();
const { active } = useEffects();

const kindOptions: Array<{
  value: KnowledgeNodeKind;
  label: string;
  color: string;
}> = [
  { value: "article", label: "文章", color: "#7c5cff" },
  { value: "project", label: "项目", color: "#00e5ff" },
  { value: "showcase", label: "作品", color: "#ff9f43" },
  { value: "category", label: "分类", color: "#45e6a6" },
];
const kindIndex = new Map(
  kindOptions.map((option, index) => [option.value, index]),
);
const kindColor = new Map(
  kindOptions.map((option) => [option.value, option.color]),
);
const categories = computed(() => [
  "全部",
  ...new Set(
    props.network.nodes
      .filter((node) => node.kind === "article" && node.category)
      .map((node) => node.category as string),
  ),
]);

const relationPairs = computed(() => [
  ...props.network.relations.map((relation) => ({
    source: relation.source,
    target: relation.target,
    kind: relation.kind,
  })),
  ...props.network.categoryLinks.map((relation) => ({
    source: relation.source,
    target: relation.target,
    kind: "category" as const,
  })),
]);

const toggleKind = (kind: KnowledgeNodeKind) => {
  enabledKinds.value = enabledKinds.value.includes(kind)
    ? enabledKinds.value.filter((item) => item !== kind)
    : [...enabledKinds.value, kind];
};

const filteredNodes = computed(() => {
  const byKind = props.network.nodes.filter((node) =>
    enabledKinds.value.includes(node.kind),
  );
  let allowedIds = new Set(byKind.map((node) => node.id));

  if (selectedCategory.value !== "全部") {
    const seeds = new Set(
      byKind
        .filter(
          (node) =>
            node.category === selectedCategory.value &&
            (node.kind === "article" || node.kind === "category"),
        )
        .map((node) => node.id),
    );
    for (const relation of relationPairs.value) {
      if (seeds.has(relation.source)) seeds.add(relation.target);
      if (seeds.has(relation.target)) seeds.add(relation.source);
    }
    allowedIds = new Set([...seeds].filter((id) => allowedIds.has(id)));
  }

  const keyword = search.value.trim().toLocaleLowerCase("zh-CN");
  if (keyword) {
    const matches = new Set(
      byKind
        .filter((node) => {
          const searchable = [
            node.title,
            node.description,
            node.category || "",
            ...node.tags,
          ]
            .join(" ")
            .toLocaleLowerCase("zh-CN");
          return allowedIds.has(node.id) && searchable.includes(keyword);
        })
        .map((node) => node.id),
    );
    const withNeighbors = new Set(matches);
    for (const relation of relationPairs.value) {
      if (matches.has(relation.source)) withNeighbors.add(relation.target);
      if (matches.has(relation.target)) withNeighbors.add(relation.source);
    }
    allowedIds = new Set([...withNeighbors].filter((id) => allowedIds.has(id)));
  }

  return byKind.filter((node) => allowedIds.has(node.id));
});

const visibleNodeIds = computed(
  () => new Set(filteredNodes.value.map((node) => node.id)),
);
const filteredRelations = computed(() => {
  const seen = new Set<string>();
  return relationPairs.value.filter((relation) => {
    if (
      !visibleNodeIds.value.has(relation.source) ||
      !visibleNodeIds.value.has(relation.target)
    ) {
      return false;
    }
    const key = [relation.source, relation.target].sort().join("\0");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

const degrees = computed(() => {
  const result = new Map<string, number>();
  for (const relation of filteredRelations.value) {
    result.set(relation.source, (result.get(relation.source) || 0) + 1);
    result.set(relation.target, (result.get(relation.target) || 0) + 1);
  }
  return result;
});

const chartOption = computed<KnowledgeChartOption>(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    formatter: "{c}",
    backgroundColor: "rgba(7, 9, 18, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.14)",
    textStyle: { color: "#f4f6ff" },
  },
  aria: {
    enabled: true,
    description: "文章、项目、作品与分类之间的知识关系图谱",
  },
  animation: active.value && reducedMotion.value !== "reduce",
  series: [
    {
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      data: filteredNodes.value.map((node) => {
        const degree = degrees.value.get(node.id) || 0;
        return {
          id: node.id,
          name: node.id,
          value: node.title,
          path: node.path,
          kind: node.kind,
          category: kindIndex.get(node.kind) || 0,
          symbolSize:
            node.kind === "category"
              ? Math.min(52, 34 + degree)
              : Math.min(42, 16 + Math.sqrt(degree) * 7),
          itemStyle: {
            color: kindColor.get(node.kind),
            borderColor: "rgba(255, 255, 255, 0.72)",
            borderWidth: node.kind === "category" ? 2 : 1,
            shadowBlur: 14,
            shadowColor: `${kindColor.get(node.kind)}66`,
          },
          label: {
            show: node.kind === "category",
            formatter: "{c}",
            color: "#f4f6ff",
            fontSize: 11,
          },
        };
      }),
      links: filteredRelations.value.map((relation) => ({
        source: relation.source,
        target: relation.target,
        lineStyle: {
          color:
            relation.kind === "category"
              ? "rgba(69, 230, 166, 0.25)"
              : "rgba(124, 92, 255, 0.6)",
          type: relation.kind === "category" ? "dashed" : "solid",
          width: relation.kind === "category" ? 1 : 1.8,
          curveness: 0.08,
        },
      })),
      categories: kindOptions.map((option) => ({ name: option.label })),
      force: {
        repulsion: filteredNodes.value.length > 80 ? 210 : 150,
        edgeLength: [70, 150],
        gravity: 0.08,
        layoutAnimation: active.value && reducedMotion.value !== "reduce",
      },
      emphasis: {
        focus: "adjacency",
        label: { show: true, color: "#fff", fontWeight: "bold" },
        lineStyle: { width: 3, opacity: 1 },
      },
      labelLayout: { hideOverlap: true },
      lineStyle: { opacity: 0.68 },
    },
  ],
}));

const handleNodeClick = (event: ECElementEvent) => {
  if (event.dataType !== "node" || typeof event.data !== "object") return;
  const path = (event.data as { path?: string }).path;
  if (path) navigateTo(path);
};
</script>

<template>
  <div class="knowledge-graph-panel glass">
    <div class="knowledge-graph-controls">
      <label class="knowledge-graph-search">
        <UIcon name="i-lucide-search" />
        <input v-model="search" placeholder="搜索标题、分类或标签..." />
      </label>
      <label class="knowledge-graph-category">
        <span>文章分类</span>
        <select v-model="selectedCategory">
          <option v-for="category in categories" :key="category">
            {{ category }}
          </option>
        </select>
      </label>
      <div class="knowledge-graph-kinds" aria-label="内容类型筛选">
        <button
          v-for="option in kindOptions"
          :key="option.value"
          type="button"
          :class="{ active: enabledKinds.includes(option.value) }"
          :aria-pressed="enabledKinds.includes(option.value)"
          @click="toggleKind(option.value)"
        >
          <span :style="{ backgroundColor: option.color }" />
          {{ option.label }}
        </button>
      </div>
      <span class="knowledge-graph-result">
        {{ filteredNodes.length }} 个节点 ·
        {{ filteredRelations.length }} 条连线
      </span>
    </div>

    <VChart
      v-if="filteredNodes.length"
      class="knowledge-graph-chart"
      :option="chartOption"
      autoresize
      @click="handleNodeClick"
    />
    <div v-else class="knowledge-graph-empty">
      <UIcon name="i-lucide-network" />
      <strong>没有匹配的知识节点</strong>
      <span>尝试清空搜索或重新开启内容类型。</span>
    </div>
  </div>
</template>
