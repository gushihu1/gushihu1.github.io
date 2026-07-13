<script setup lang="ts">
defineProps<{ project: any; index?: number }>()
</script>
<template>
  <NuxtLink :to="project.path" class="project-card glass interactive-card">
    <div class="card-top"><span class="card-index">0{{ (index || 0) + 1 }}</span><UIcon name="i-lucide-arrow-up-right" /></div>
    <div><span class="meta">{{ project.period }}</span><h3>{{ project.title }}</h3><p>{{ project.description }}</p></div>
    <div class="tag-list"><span v-for="tag in project.stack?.slice(0, 4)" :key="tag">{{ tag }}</span></div>
  </NuxtLink>
</template>
