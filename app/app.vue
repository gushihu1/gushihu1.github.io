<script setup lang="ts">
import { profile } from "~/data/profile";

useSeoMeta({
  titleTemplate: (title) =>
    title
      ? `${title} · ${profile.name}的技术博客`
      : `${profile.name}的技术博客`,
  description: "记录软件开发、AI 探索与工程实践中的学习、思考和解决方案。",
  ogTitle: `${profile.name}的技术博客`,
  ogDescription: "记录软件开发、AI 探索与工程实践中的学习、思考和解决方案。",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="linear-gradient(90deg, #7c5cff, #00e5ff)"
      :height="2"
    />
    <PageEffects />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
