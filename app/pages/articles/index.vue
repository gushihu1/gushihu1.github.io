<script setup lang="ts">
definePageMeta({ scrollToTop: false });
useMainPagePersistence("articles");

useSeoMeta({
  title: "技术文章",
  description: "按原始技术整理拆分的独立知识点。",
});

const search = useState("articles-search", () => "");
const selectedCategory = useState("articles-category", () => "全部");
const { data: articles } = await useAsyncData("all-articles", () =>
  queryCollection("articles")
    .where("draft", "=", false)
    .order("path", "ASC")
    .all(),
);

const categories = computed(() => [
  "全部",
  ...new Set((articles.value || []).map((article) => article.category)),
]);

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return (articles.value || []).filter((article) => {
    const categoryMatched =
      selectedCategory.value === "全部" ||
      article.category === selectedCategory.value;
    const titleMatched =
      !keyword || article.title.toLowerCase().includes(keyword);
    return categoryMatched && titleMatched;
  });
});
</script>

<template>
  <div class="page-shell">
    <div class="page-hero">
      <span class="eyebrow"><span /> TECHNICAL WRITING</span>
      <h1>技术文章</h1>
      <p>从原始技术整理中拆分出的独立知识点。</p>
    </div>
    <div class="article-tools glass">
      <label>
        <UIcon name="i-lucide-search" />
        <input v-model="search" placeholder="搜索知识点标题..." />
      </label>
      <div class="filter-tags">
        <button
          v-for="category in categories"
          :key="category"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>
    <div v-if="filtered.length" class="article-grid article-list">
      <Reveal
        v-for="(article, index) in filtered"
        :key="article.path"
        :delay="index * 0.02"
      >
        <ArticleCard :article="article" />
      </Reveal>
    </div>
    <div v-else class="empty-state">没有匹配的知识点，换个标题试试。</div>
  </div>
</template>
