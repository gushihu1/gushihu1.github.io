<script setup lang="ts">
const route = useRoute()
const { data: project } = await useAsyncData(`project-${route.path}`, () => queryCollection('projects').path(route.path).first())
if (!project.value) throw createError({ statusCode: 404, statusMessage: '项目不存在' })
useSeoMeta({ title: () => project.value?.title, description: () => project.value?.description })
</script>
<template><div class="page-shell article-layout"><article v-if="project" class="prose-wrap"><header class="article-header"><NuxtLink to="/projects" class="back-link"><UIcon name="i-lucide-arrow-left" /> 返回项目</NuxtLink><div class="tag-list"><span v-for="tag in project.stack" :key="tag">{{ tag }}</span></div><h1>{{ project.title }}</h1><p>{{ project.description }}</p><div class="article-meta"><span>{{ project.period }}</span><span>{{ project.role }}</span></div></header><div class="prose glass"><ContentRenderer :value="project" /></div></article></div></template>
