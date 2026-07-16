<script setup lang="ts">
definePageMeta({ scrollToTop: false });
useMainPagePersistence("articles");

useSeoMeta({
  title: "文章归档",
  description: "记录软件开发、AI 探索与工程实践中的学习、思考和解决方案。",
});

const route = useRoute();
const router = useRouter();
const pageSize = 12;

const queryValue = (value: unknown) =>
  Array.isArray(value) ? String(value[0] || "") : String(value || "");

const search = ref(queryValue(route.query.q));
const selectedCategory = ref(queryValue(route.query.category) || "全部");

const { data: articleData } = await useAsyncData("article-archive", () =>
  withContentQueryRetry(() =>
    queryCollection("articles")
      .where("draft", "=", false)
      .order("date", "DESC")
      .all(),
  ),
);

const articles = computed(() => sortArticlesByDate(articleData.value || []));
const categoryCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const article of articles.value) {
    counts.set(article.category, (counts.get(article.category) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.name.localeCompare(right.name, "zh-CN"),
    );
});

const filteredArticles = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase("zh-CN");
  return articles.value.filter((article) => {
    const categoryMatched =
      selectedCategory.value === "全部" ||
      article.category === selectedCategory.value;
    const searchable = [
      article.title,
      article.description || "",
      article.category,
      ...(article.tags || []),
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return categoryMatched && (!keyword || searchable.includes(keyword));
  });
});

const currentPage = computed(() => {
  const page = Number.parseInt(queryValue(route.query.page), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredArticles.value.length / pageSize)),
);
const pagedArticles = computed(() => {
  const safePage = Math.min(currentPage.value, totalPages.value);
  const start = (safePage - 1) * pageSize;
  return filteredArticles.value.slice(start, start + pageSize);
});

const replaceFilterQuery = (updates: Record<string, string | undefined>) =>
  router.replace({
    query: {
      ...route.query,
      ...updates,
      page: undefined,
    },
  });

watchDebounced(
  search,
  (value) => {
    const normalized = value.trim();
    if (normalized === queryValue(route.query.q)) return;
    replaceFilterQuery({ q: normalized || undefined });
  },
  { debounce: 250, maxWait: 800 },
);

watch(selectedCategory, (value) => {
  const normalized = value === "全部" ? "" : value;
  if (normalized === queryValue(route.query.category)) return;
  replaceFilterQuery({ category: normalized || undefined });
});

watch(
  () => route.query.q,
  (value) => {
    const normalized = queryValue(value);
    if (search.value !== normalized) search.value = normalized;
  },
);
watch(
  () => route.query.category,
  (value) => {
    const normalized = queryValue(value) || "全部";
    if (selectedCategory.value !== normalized)
      selectedCategory.value = normalized;
  },
);

watch(totalPages, (pages) => {
  if (currentPage.value <= pages) return;
  router.replace({
    query: {
      ...route.query,
      page: pages > 1 ? String(pages) : undefined,
    },
  });
});

const goToPage = async (page: number) => {
  const nextPage = Math.min(totalPages.value, Math.max(1, page));
  if (nextPage === currentPage.value) return;
  await router.push({
    query: {
      ...route.query,
      page: nextPage > 1 ? String(nextPage) : undefined,
    },
  });
  if (import.meta.client) {
    document
      .querySelector("#article-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>

<template>
  <div class="page-shell article-archive">
    <header class="page-hero archive-hero">
      <div>
        <span class="eyebrow"><span /> ARTICLE ARCHIVE</span>
        <h1>文章归档</h1>
        <p>按主题与关键词浏览全部技术笔记。</p>
      </div>
      <div class="archive-hero__count">
        <strong>{{ articles.length }}</strong>
        <span>篇公开文章</span>
      </div>
    </header>

    <section class="article-tools" aria-label="文章筛选">
      <label class="article-search">
        <span class="sr-only">搜索文章</span>
        <UIcon name="i-lucide-search" />
        <input v-model="search" placeholder="搜索标题、摘要或标签..." />
        <button
          v-if="search"
          type="button"
          aria-label="清空搜索"
          @click="search = ''"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </label>
      <div class="filter-tags" aria-label="文章分类">
        <button
          :class="{ active: selectedCategory === '全部' }"
          :aria-pressed="selectedCategory === '全部'"
          @click="selectedCategory = '全部'"
        >
          全部 <span>{{ articles.length }}</span>
        </button>
        <button
          v-for="category in categoryCounts"
          :key="category.name"
          :class="{ active: selectedCategory === category.name }"
          :aria-pressed="selectedCategory === category.name"
          @click="selectedCategory = category.name"
        >
          {{ category.name }} <span>{{ category.count }}</span>
        </button>
      </div>
    </section>

    <section id="article-results" class="archive-results">
      <div class="archive-results__header">
        <div>
          <span>共 {{ filteredArticles.length }} 篇结果</span>
          <strong v-if="selectedCategory !== '全部'">
            {{ selectedCategory }}
          </strong>
        </div>
        <span>文章列表</span>
      </div>

      <div v-if="pagedArticles.length" class="editorial-list article-list">
        <Reveal
          v-for="(article, index) in pagedArticles"
          :key="article.stem"
          :delay="index * 0.025"
        >
          <ArticleCard :article="article" variant="list" />
        </Reveal>
      </div>
      <div v-else class="empty-state">
        <UIcon name="i-lucide-file-search" />
        <h2>没有找到匹配文章</h2>
        <p>试试更短的关键词，或切换到其他分类。</p>
      </div>

      <nav
        v-if="filteredArticles.length > pageSize"
        class="pagination"
        aria-label="文章分页"
      >
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <UIcon name="i-lucide-chevron-left" /> 上一页
        </button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页 <UIcon name="i-lucide-chevron-right" />
        </button>
      </nav>
    </section>
  </div>
</template>
