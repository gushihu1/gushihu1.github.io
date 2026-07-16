<script setup lang="ts">
const route = useRoute();
const { y } = useWindowScroll();
const articleStem = computed(() =>
  getArticleStemFromRoute(route.params.slug as string | string[] | undefined),
);
const { data: article } = await useAsyncData(
  `article-${route.path}`,
  () =>
    withContentQueryRetry(() =>
      queryCollection("articles").where("stem", "=", articleStem.value).first(),
    ),
  { watch: [articleStem] },
);

if (!article.value)
  throw createError({ statusCode: 404, statusMessage: "文章不存在" });

const { data: articleData } = await useAsyncData("article-nav", () =>
  withContentQueryRetry(() =>
    queryCollection("articles")
      .where("draft", "=", false)
      .order("date", "DESC")
      .all(),
  ),
);
const all = computed(() => sortArticlesByDate(articleData.value || []));
const index = computed(() =>
  all.value.findIndex((item) => item.stem === articleStem.value),
);
const prev = computed(() =>
  toArticleNavigationTarget(all.value[index.value - 1]),
);
const next = computed(() =>
  toArticleNavigationTarget(all.value[index.value + 1]),
);
const progress = computed(() =>
  import.meta.client
    ? Math.min(
        100,
        (y.value /
          Math.max(1, document.documentElement.scrollHeight - innerHeight)) *
          100,
      )
    : 0,
);

useSeoMeta({
  title: () =>
    article.value?.title
      ? stripHighlightedText(article.value.title)
      : undefined,
  description: () => article.value?.description || article.value?.title,
  ogTitle: () =>
    article.value?.title
      ? stripHighlightedText(article.value.title)
      : undefined,
  ogDescription: () => article.value?.description || article.value?.title,
  ogType: "article",
});
</script>

<template>
  <div class="page-shell article-layout article-detail">
    <div class="reading-line" :style="{ width: `${progress}%` }" />
    <article v-if="article" class="prose-wrap">
      <header class="article-header">
        <ContentBackButton fallback-path="/articles" />
        <div class="tag-list article-header__tags">
          <span>{{ article.category }}</span>
          <span v-for="tag in article.tags?.slice(0, 3)" :key="tag">
            # {{ tag }}
          </span>
        </div>
        <h1><InlineMarkedText :text="article.title" /></h1>
        <p v-if="article.description">{{ article.description }}</p>
        <div class="article-meta">
          <span>{{ article.readingTime }}</span>
        </div>
      </header>
      <div class="prose glass"><ContentRenderer :value="article" /></div>
      <ContentDetailNavigation
        :previous="prev"
        :next="next"
        list-path="/articles"
        collection-name="文章"
        item-name="篇"
      />
    </article>
  </div>
</template>
