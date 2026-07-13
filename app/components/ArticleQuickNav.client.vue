<script setup lang="ts">
interface ArticleNavTarget {
  path: string;
  title: string;
}

defineProps<{
  previous?: ArticleNavTarget;
  next?: ArticleNavTarget;
}>();

const { y } = useWindowScroll();
const reducedMotion = usePreferredReducedMotion();
const showBackToTop = computed(() => y.value > 500);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.value === "reduce" ? "auto" : "smooth",
  });
};
</script>

<template>
  <nav class="article-quick-nav glass" aria-label="文章快捷导航">
    <NuxtLink
      v-if="previous"
      :to="previous.path"
      class="article-quick-nav__button"
      :aria-label="`上一章：${previous.title}`"
      :title="`上一章：${previous.title}`"
      data-label="上一章"
    >
      <UIcon name="i-lucide-chevron-left" />
      <span class="article-quick-nav__label">上一章</span>
    </NuxtLink>

    <NuxtLink
      to="/articles"
      class="article-quick-nav__button"
      aria-label="返回文章列表"
      title="返回文章列表"
      data-label="文章列表"
    >
      <UIcon name="i-lucide-list" />
      <span class="article-quick-nav__label">列表</span>
    </NuxtLink>

    <NuxtLink
      v-if="next"
      :to="next.path"
      class="article-quick-nav__button"
      :aria-label="`下一章：${next.title}`"
      :title="`下一章：${next.title}`"
      data-label="下一章"
    >
      <UIcon name="i-lucide-chevron-right" />
      <span class="article-quick-nav__label">下一章</span>
    </NuxtLink>

    <Transition name="quick-nav-top">
      <button
        v-if="showBackToTop"
        type="button"
        class="article-quick-nav__button"
        aria-label="返回顶部"
        title="返回顶部"
        data-label="返回顶部"
        @click="scrollToTop"
      >
        <UIcon name="i-lucide-arrow-up" />
        <span class="article-quick-nav__label">顶部</span>
      </button>
    </Transition>
  </nav>
</template>
