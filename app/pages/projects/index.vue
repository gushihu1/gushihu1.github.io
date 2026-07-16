<script setup lang="ts">
definePageMeta({ scrollToTop: false });
useMainPagePersistence("projects");

useSeoMeta({
  title: "项目",
  description: "刘梦涛参与的后台、跨端应用与数据可视化项目。",
});
const { data: projects } = await useAsyncData("all-projects", () =>
  withContentQueryRetry(() =>
    queryCollection("projects").order("date", "DESC").all(),
  ),
);
</script>
<template>
  <div class="page-shell">
    <div class="page-hero">
      <span class="eyebrow"><span /> PROJECT ARCHIVE</span>
      <h1>项目作品</h1>
      <p>复杂业务、跨端体验与数据可视化的真实实践。</p>
    </div>
    <div class="project-grid all-projects">
      <Reveal
        v-for="(project, i) in projects"
        :key="project.path"
        :delay="i * 0.05"
        ><ProjectCard :project="project" :index="i"
      /></Reveal>
    </div>
  </div>
</template>
