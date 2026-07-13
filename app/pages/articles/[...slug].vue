<script setup lang="ts">
const route = useRoute();
const { y } = useWindowScroll();
const { data: article } = await useAsyncData(`article-${route.path}`, () =>
  queryCollection("articles").path(route.path).first(),
);

if (!article.value)
  throw createError({ statusCode: 404, statusMessage: "文章不存在" });

const { data: all } = await useAsyncData("article-nav", () =>
  queryCollection("articles")
    .where("draft", "=", false)
    .order("path", "ASC")
    .all(),
);
const index = computed(() =>
  (all.value || []).findIndex((item) => item.path === route.path),
);
const prev = computed(() => (all.value || [])[index.value - 1]);
const next = computed(() => (all.value || [])[index.value + 1]);
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
  title: () => article.value?.title,
  description: () => article.value?.description || article.value?.title,
  ogType: "article",
});
</script>

<template>
  <div class="page-shell article-layout">
    <div class="reading-line" :style="{ width: `${progress}%` }" />
    <article v-if="article" class="prose-wrap">
      <header class="article-header">
        <NuxtLink to="/articles" class="back-link"
          ><UIcon name="i-lucide-arrow-left" /> 返回文章</NuxtLink
        >
        <div class="tag-list">
          <span>{{ article.category }}</span>
        </div>
        <h1>{{ article.title }}</h1>
        <p v-if="article.description">{{ article.description }}</p>
        <div class="article-meta">
          <span>{{ article.date }}</span
          ><span>{{ article.readingTime }}</span>
        </div>
      </header>
      <div class="prose glass"><ContentRenderer :value="article" /></div>
      <nav class="article-nav">
        <NuxtLink v-if="prev" :to="prev.path"
          ><small>上一篇</small><strong>{{ prev.title }}</strong></NuxtLink
        >
        <span />
        <NuxtLink v-if="next" :to="next.path" class="next"
          ><small>下一篇</small><strong>{{ next.title }}</strong></NuxtLink
        >
      </nav>
    </article>
    <ArticleQuickNav :previous="prev" :next="next" />
  </div>
</template>
