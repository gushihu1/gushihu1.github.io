<script setup lang="ts">
type ArticleCardVariant = "featured" | "list" | "compact";

const props = withDefaults(
  defineProps<{
    article: {
      stem: string;
      title: string;
      category: string;
      readingTime?: string;
      description?: string;
      tags?: string[];
    };
    variant?: ArticleCardVariant;
  }>(),
  { variant: "compact" },
);

const href = computed(() => getArticlePath(props.article));
</script>

<template>
  <NuxtLink :to="href" class="article-card" :class="`article-card--${variant}`">
    <div class="article-card__meta">
      <span class="article-card__category">{{ article.category }}</span>
      <span>{{ article.readingTime || "1 min" }}</span>
    </div>

    <div class="article-card__content">
      <span v-if="variant === 'featured'" class="article-card__eyebrow">
        FEATURED NOTE
      </span>
      <h3><InlineMarkedText :text="article.title" /></h3>
      <p v-if="article.description">{{ article.description }}</p>
    </div>

    <div class="article-card__footer">
      <div v-if="article.tags?.length" class="tag-list">
        <span v-for="tag in article.tags.slice(0, 3)" :key="tag">
          # {{ tag }}
        </span>
      </div>
      <span class="article-card__action">
        阅读全文 <UIcon name="i-lucide-arrow-up-right" />
      </span>
    </div>
  </NuxtLink>
</template>
