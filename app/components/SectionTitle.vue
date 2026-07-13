<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description?: string }>()
</script>
<template>
  <div class="section-heading">
    <span class="eyebrow"><span />{{ eyebrow }}</span>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
  </div>
</template>
