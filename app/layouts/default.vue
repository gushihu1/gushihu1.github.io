<script setup lang="ts">
const route = useRoute();
const { effectsEnabled, active } = useEffects();
const { y } = useWindowScroll();
const progress = computed(() =>
  import.meta.client
    ? Math.min(
        100,
        (y.value /
          Math.max(1, document.documentElement.scrollHeight - innerHeight)) *
          100,
      )
    : 0,
);
const nav = [
  { label: "首页", to: "/" },
  { label: "项目", to: "/projects" },
  { label: "文章", to: "/articles" },
  { label: "关于", to: "/about" },
];
const mobileOpen = ref(false);
watch(
  () => route.path,
  () => (mobileOpen.value = false),
);
</script>

<template>
  <div class="site-shell" :class="{ 'effects-off': !active }">
    <div class="scroll-progress" :style="{ width: `${progress}%` }" />
    <div class="ambient ambient-a" />
    <div class="ambient ambient-b" />
    <header class="site-header glass">
      <NuxtLink to="/" class="brand" aria-label="返回首页"
        ><span class="brand-mark">LM</span><span>LIU.MT</span></NuxtLink
      >
      <nav class="desktop-nav" aria-label="主导航">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
          >{{ item.label }}</NuxtLink
        >
      </nav>
      <div class="header-actions">
        <button
          class="icon-button"
          :aria-label="effectsEnabled ? '关闭特效' : '开启特效'"
          @click="effectsEnabled = !effectsEnabled"
        >
          <UIcon
            :name="
              effectsEnabled ? 'i-lucide-sparkles' : 'i-lucide-sparkles-off'
            "
          />
        </button>
        <button
          class="icon-button mobile-menu"
          aria-label="打开导航"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon name="i-lucide-menu" />
        </button>
      </div>
      <Transition name="fade">
        <nav v-if="mobileOpen" class="mobile-nav glass">
          <NuxtLink v-for="item in nav" :key="item.to" :to="item.to">{{
            item.label
          }}</NuxtLink>
        </nav>
      </Transition>
    </header>
    <main><slot /></main>
    <footer class="site-footer">
      <div>
        <span class="brand-mark small">LM</span>
        用代码构建体验，用系统化思维解决问题。
      </div>
      <div>© {{ new Date().getFullYear() }} 刘梦涛 · Built with Nuxt</div>
    </footer>
  </div>
</template>
