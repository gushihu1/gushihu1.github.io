<script setup lang="ts">
import { motion } from "motion-v";
import { profile } from "~/data/profile";

definePageMeta({ scrollToTop: false });
useMainPagePersistence("home");

const { active } = useEffects();
const { data: articleData } = await useAsyncData("home-articles", () =>
  withContentQueryRetry(() =>
    queryCollection("articles")
      .where("draft", "=", false)
      .order("date", "DESC")
      .all(),
  ),
);
const { data: projects } = await useAsyncData("home-projects", () =>
  withContentQueryRetry(() =>
    queryCollection("projects").order("date", "DESC").limit(2).all(),
  ),
);

const sortedArticles = computed(() =>
  sortArticlesByDate(articleData.value || []),
);
const highlightedArticles = computed(() =>
  sortedArticles.value.filter((article) => hasHighlightedText(article.title)),
);
const featuredArticle = computed(() => highlightedArticles.value[0]);
const latestArticles = computed(() => highlightedArticles.value.slice(1, 6));
const allCategoryCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const article of sortedArticles.value) {
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
const categoryCounts = computed(() => allCategoryCounts.value.slice(0, 10));

const topicSummary = ["软件开发", "AI 探索", "工程实践"];
</script>

<template>
  <div>
    <section class="blog-hero section-shell">
      <ClientOnly><ParticleField /></ClientOnly>
      <div class="blog-hero__grid" />
      <div class="scanline" />

      <motion.div
        class="blog-hero__copy"
        :initial="active ? { opacity: 0, y: 24 } : false"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.7 }"
      >
        <span class="eyebrow"><span /> TECHNOLOGY FIELD NOTES</span>
        <h1>刘梦涛的<br /><span>技术成长笔记</span></h1>
        <p class="blog-hero__summary">
          记录软件开发、AI
          与工程实践，也沉淀那些真正影响系统质量、开发效率和长期维护的思考。
        </p>
        <div class="blog-hero__topics" aria-label="主要写作方向">
          <span v-for="topic in topicSummary" :key="topic">{{ topic }}</span>
        </div>
        <div class="blog-hero__actions">
          <NuxtLink to="/articles" class="button primary">
            浏览全部文章 <UIcon name="i-lucide-arrow-right" />
          </NuxtLink>
          <a href="#latest-notes" class="button secondary">查看精选文章</a>
        </div>
        <div class="blog-hero__stats">
          <div>
            <strong>{{ sortedArticles.length }}</strong
            ><span>篇技术笔记</span>
          </div>
          <div>
            <strong>{{ allCategoryCounts.length }}</strong
            ><span>个写作方向</span>
          </div>
          <div>
            <strong>{{ projects?.length || 0 }}</strong
            ><span>项精选实践</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        v-if="featuredArticle"
        class="blog-hero__featured"
        :initial="active ? { opacity: 0, x: 24 } : false"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.75, delay: 0.1 }"
      >
        <ArticleCard :article="featuredArticle" variant="featured" />
      </motion.div>
    </section>

    <section
      id="latest-notes"
      class="section-shell content-section blog-section"
    >
      <Reveal>
        <div class="section-heading-row">
          <SectionTitle
            eyebrow="LATEST NOTES"
            title="文章精选"
            description="汇集软件开发、AI 探索与工程实践中的技术思考。"
          />
          <NuxtLink to="/articles" class="text-link">
            查看文章归档 <UIcon name="i-lucide-arrow-right" />
          </NuxtLink>
        </div>
      </Reveal>
      <div class="editorial-list">
        <Reveal
          v-for="(article, index) in latestArticles"
          :key="article.stem"
          :delay="index * 0.04"
        >
          <ArticleCard :article="article" variant="list" />
        </Reveal>
      </div>
    </section>

    <section class="section-shell content-section blog-section">
      <Reveal>
        <SectionTitle
          eyebrow="EXPLORE TOPICS"
          title="按主题阅读"
          description="从高频主题进入，快速找到同一技术方向的笔记。"
        />
      </Reveal>
      <div class="topic-grid">
        <Reveal
          v-for="(topic, index) in categoryCounts"
          :key="topic.name"
          :delay="index * 0.025"
        >
          <NuxtLink
            :to="{ path: '/articles', query: { category: topic.name } }"
            class="topic-card"
          >
            <span>{{ topic.name }}</span>
            <strong>{{ topic.count }}</strong>
            <UIcon name="i-lucide-arrow-up-right" />
          </NuxtLink>
        </Reveal>
      </div>
    </section>

    <section class="section-shell content-section blog-section">
      <Reveal>
        <div class="section-heading-row">
          <SectionTitle
            eyebrow="PROJECT PRACTICE"
            title="项目实践"
            description="从真实业务中沉淀出来的解决方案与经验。"
          />
          <NuxtLink to="/projects" class="text-link">
            查看全部项目 <UIcon name="i-lucide-arrow-right" />
          </NuxtLink>
        </div>
      </Reveal>
      <div class="project-grid blog-projects">
        <Reveal
          v-for="(project, index) in projects"
          :key="project.path"
          :delay="index * 0.07"
        >
          <ProjectCard :project="project" :index="index" />
        </Reveal>
      </div>
    </section>

    <section class="section-shell author-card">
      <div class="author-card__identity">
        <span class="brand-mark">{{ profile.initials }}</span>
        <div>
          <span class="eyebrow"><span /> ABOUT THE AUTHOR</span>
          <h2>{{ profile.name }}</h2>
          <p>{{ profile.role }} · {{ profile.location }}</p>
        </div>
      </div>
      <p class="author-card__summary">{{ profile.summary }}</p>
      <div class="author-card__actions">
        <NuxtLink to="/about" class="button secondary">了解作者</NuxtLink>
        <CopyContactButton
          label="邮箱"
          :value="profile.email"
          icon="i-lucide-mail"
        />
        <CopyContactButton
          label="手机号"
          :value="profile.phone"
          icon="i-lucide-phone"
        />
      </div>
    </section>
  </div>
</template>
