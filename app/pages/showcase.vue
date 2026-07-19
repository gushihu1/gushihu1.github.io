<script setup lang="ts">
definePageMeta({ scrollToTop: false });
useMainPagePersistence("showcase");

useSeoMeta({
  title: "作品",
  description: "展示独立作品，以及与项目实践关联的界面和交互成果。",
  ogTitle: "作品展示",
  ogDescription: "展示独立作品，以及与项目实践关联的界面和交互成果。",
});

const { data: showcaseData } = await useAsyncData("showcases", () =>
  withContentQueryRetry(() =>
    queryCollection("showcases")
      .where("draft", "=", false)
      .order("date", "DESC")
      .all(),
  ),
);

const showcases = computed(() => showcaseData.value ?? []);
const { data: knowledgeNetwork } = await useKnowledgeNetwork();
const hasKnowledgeRelation = (stem: string) => {
  if (!knowledgeNetwork.value) return false;
  const path = getShowcasePath(stem);
  return knowledgeNetwork.value.relations.some(
    (relation) => relation.source === path || relation.target === path,
  );
};
</script>

<template>
  <div class="page-shell showcase-page">
    <header class="page-hero showcase-hero">
      <div>
        <span class="eyebrow"><span /> WORK SHOWCASE</span>
        <h1>作品展示</h1>
        <p>作品可以独立呈现，也可以与相关项目实践相互串联。</p>
      </div>
      <div class="showcase-hero__count" aria-label="作品统计">
        <strong>{{ showcases.length }}</strong>
        <span>件公开作品</span>
      </div>
    </header>

    <div class="showcase-list">
      <Reveal
        v-for="(showcase, index) in showcases"
        :key="showcase.path"
        :delay="index * 0.04"
      >
        <section
          :id="getShowcaseAnchor(showcase.stem)"
          class="showcase-project glass"
        >
          <header class="showcase-project__header">
            <div>
              <span class="meta">{{
                hasKnowledgeRelation(showcase.stem) ? "关联作品" : "独立作品"
              }}</span>
              <h2>{{ showcase.title }}</h2>
              <p>{{ showcase.description }}</p>
            </div>
          </header>

          <div class="tag-list showcase-project__tags">
            <span v-for="item in showcase.tags" :key="item">{{ item }}</span>
          </div>

          <ProjectGallery
            v-if="showcase.gallery?.length"
            :images="showcase.gallery"
            :title="showcase.title"
          />
          <div v-else class="showcase-project__empty">
            <UIcon name="i-lucide-images" />
            <div>
              <strong>作品图片整理中</strong>
              <span>作品说明已经开放，图片将在脱敏和整理后补充。</span>
            </div>
          </div>
          <KnowledgeRelations
            :network="knowledgeNetwork"
            :current-path="getShowcasePath(showcase.stem)"
            compact
          />
        </section>
      </Reveal>
    </div>

    <div v-if="!showcases.length" class="empty-state showcase-empty">
      <UIcon name="i-lucide-folder-open" />
      <h2>暂无公开作品</h2>
      <p>在作品集合中添加内容后会自动出现在这里。</p>
    </div>
  </div>
</template>
