<script setup lang="ts">
const props = defineProps<{
  fallbackPath: string;
}>();

const router = useRouter();

const goBack = async () => {
  const previousPath = window.history.state?.back;

  if (typeof previousPath === "string" && previousPath.startsWith("/")) {
    router.back();
    return;
  }

  await navigateTo(props.fallbackPath);
};
</script>

<template>
  <button type="button" class="back-link" @click="goBack">
    <UIcon name="i-lucide-arrow-left" />
    返回
  </button>
</template>
