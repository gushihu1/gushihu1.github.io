<script setup lang="ts">
import { profile } from "~/data/profile";

useSeoMeta({
  titleTemplate: (title) =>
    title ? `${title} · ${profile.name}` : `${profile.name} · 前端开发工程师`,
  description: profile.summary,
  ogTitle: `${profile.name} · 前端开发工程师`,
  ogDescription: profile.summary,
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
