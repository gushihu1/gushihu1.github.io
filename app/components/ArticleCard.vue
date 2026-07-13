<script setup lang="ts">
defineProps<{ article: any }>()
</script>
<template>
  <NuxtLink :to="article.path" class="article-card glass interactive-card">
    <div class="article-meta"><span>{{ article.category }}</span><span>{{ article.readingTime || '1 min' }}</span></div>
    <h3>{{ article.title }}</h3><p v-if="article.description">{{ article.description }}</p>
    <div class="tag-list"><span v-for="tag in article.tags?.slice(0, 3)" :key="tag"># {{ tag }}</span></div>
  </NuxtLink>
</template>
