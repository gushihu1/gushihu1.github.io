<script setup lang="ts">
interface ContentNavTarget {
  path: string;
  title: string;
}

const props = withDefaults(
  defineProps<{
    previous?: ContentNavTarget;
    next?: ContentNavTarget;
    listPath: string;
    collectionName: string;
    itemName?: string;
  }>(),
  {
    previous: undefined,
    next: undefined,
    itemName: "项",
  },
);

const previousLabel = computed(() => `上一${props.itemName}`);
const nextLabel = computed(() => `下一${props.itemName}`);
const { y } = useWindowScroll();
const reducedMotion = usePreferredReducedMotion();

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.value === "reduce" ? "auto" : "smooth",
  });
};
</script>

<template>
  <nav class="article-nav" :aria-label="`${collectionName}上下项导航`">
    <NuxtLink v-if="previous" :to="previous.path">
      <small>{{ previousLabel }}</small>
      <strong>{{ previous.title }}</strong>
    </NuxtLink>
    <span />
    <NuxtLink v-if="next" :to="next.path" class="next">
      <small>{{ nextLabel }}</small>
      <strong>{{ next.title }}</strong>
    </NuxtLink>
  </nav>

  <nav class="article-quick-nav glass" :aria-label="`${collectionName}快捷导航`">
    <NuxtLink
      v-if="previous"
      :to="previous.path"
      class="article-quick-nav__button"
      :aria-label="`${previousLabel}：${previous.title}`"
      :title="`${previousLabel}：${previous.title}`"
      :data-label="previousLabel"
    >
      <UIcon name="i-lucide-chevron-left" />
      <span class="article-quick-nav__label">{{ previousLabel }}</span>
    </NuxtLink>

    <NuxtLink
      :to="listPath"
      class="article-quick-nav__button"
      :aria-label="`返回${collectionName}列表`"
      :title="`返回${collectionName}列表`"
      :data-label="`${collectionName}列表`"
    >
      <UIcon name="i-lucide-list" />
      <span class="article-quick-nav__label">列表</span>
    </NuxtLink>

    <NuxtLink
      v-if="next"
      :to="next.path"
      class="article-quick-nav__button"
      :aria-label="`${nextLabel}：${next.title}`"
      :title="`${nextLabel}：${next.title}`"
      :data-label="nextLabel"
    >
      <UIcon name="i-lucide-chevron-right" />
      <span class="article-quick-nav__label">{{ nextLabel }}</span>
    </NuxtLink>

    <button
      type="button"
      class="article-quick-nav__button"
      aria-label="返回顶部"
      title="返回顶部"
      data-label="返回顶部"
      :disabled="y === 0"
      @click="scrollToTop"
    >
      <UIcon name="i-lucide-arrow-up" />
      <span class="article-quick-nav__label">顶部</span>
    </button>
  </nav>
</template>
