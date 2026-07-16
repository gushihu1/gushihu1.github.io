<script setup lang="ts">
const props = defineProps<{ text: string }>();
const segments = computed(() => parseHighlightedText(props.text));
</script>

<template>
  <template v-for="(segment, index) in segments" :key="index">
    <mark v-if="segment.highlighted" class="inline-mark">{{ segment.text }}</mark>
    <template v-else>{{ segment.text }}</template>
  </template>
</template>
