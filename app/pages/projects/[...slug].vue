<script setup lang="ts">
const route = useRoute();
const { data: project } = await useAsyncData(`project-${route.path}`, () =>
  withContentQueryRetry(() =>
    queryCollection("projects").path(route.path).first(),
  ),
);

if (!project.value)
  throw createError({ statusCode: 404, statusMessage: "项目不存在" });

const { data: all } = await useAsyncData("project-nav", () =>
  withContentQueryRetry(() =>
    queryCollection("projects").order("date", "DESC").all(),
  ),
);
const { data: relatedShowcases } = await useAsyncData(
  `project-showcases-${route.path}`,
  () =>
    withContentQueryRetry(() =>
      queryCollection("showcases")
        .where("projectPath", "=", route.path)
        .where("draft", "=", false)
        .all(),
    ),
);
const index = computed(() =>
  (all.value || []).findIndex((item) => item.path === route.path),
);
const prev = computed(() => (all.value || [])[index.value - 1]);
const next = computed(() => (all.value || [])[index.value + 1]);

useSeoMeta({
  title: () => project.value?.title,
  description: () => project.value?.description,
});
</script>

<template>
  <div class="page-shell article-layout">
    <article v-if="project" class="prose-wrap">
      <header class="article-header">
        <ContentBackButton fallback-path="/projects" />
        <div class="tag-list">
          <span v-for="tag in project.stack" :key="tag">{{ tag }}</span>
        </div>
        <h1>{{ project.title }}</h1>
        <p>{{ project.description }}</p>
        <div class="article-meta">
          <span>{{ project.period }}</span
          ><span>{{ project.role }}</span>
        </div>
      </header>
      <div class="prose glass"><ContentRenderer :value="project" /></div>
      <section v-if="relatedShowcases?.length" class="related-showcases glass">
        <div>
          <span class="eyebrow"><span /> RELATED WORKS</span>
          <h2>相关作品</h2>
          <p>查看与这个项目关联的界面与交互成果。</p>
        </div>
        <div class="related-showcases__list">
          <NuxtLink
            v-for="showcase in relatedShowcases"
            :key="showcase.path"
            :to="`/showcase#showcase-${showcase.stem}`"
            class="related-showcases__item"
          >
            <span>
              <strong>{{ showcase.title }}</strong>
              <small>{{ showcase.description }}</small>
            </span>
            <UIcon name="i-lucide-arrow-up-right" />
          </NuxtLink>
        </div>
      </section>
      <ContentDetailNavigation
        :previous="prev"
        :next="next"
        list-path="/projects"
        collection-name="项目"
        item-name="个项目"
      />
    </article>
  </div>
</template>
