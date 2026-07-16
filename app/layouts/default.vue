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
  { label: "文章", to: "/articles" },
  { label: "项目", to: "/projects" },
  { label: "作品", to: "/showcase" },
  { label: "关于", to: "/about" },
];
const showImport = import.meta.dev;
const mobileOpen = ref(false);
const isNavActive = (to: string) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);

watch(
  () => route.path,
  () => (mobileOpen.value = false),
);
useEventListener("keydown", (event) => {
  if (event.key === "Escape") mobileOpen.value = false;
});
</script>

<template>
  <div class="site-shell" :class="{ 'effects-off': !active }">
    <div class="scroll-progress" :style="{ width: `${progress}%` }" />
    <div class="ambient ambient-a" />
    <div class="ambient ambient-b" />
    <header class="site-header glass">
      <NuxtLink to="/" class="brand" aria-label="返回技术博客首页">
        <span class="brand-mark">LM</span>
        <span class="brand-copy">
          <strong>LIU.MT</strong>
          <small>TECH BLOG</small>
        </span>
      </NuxtLink>
      <nav class="desktop-nav" aria-label="主导航">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="{ active: isNavActive(item.to) }"
          >{{ item.label }}</NuxtLink
        >
      </nav>
      <div class="header-actions">
        <NuxtLink
          v-if="showImport"
          to="/admin/import"
          class="icon-button"
          aria-label="打开内容导入"
          title="内容导入"
        >
          <UIcon name="i-lucide-file-up" />
        </NuxtLink>
        <button
          type="button"
          class="icon-button"
          :aria-label="effectsEnabled ? '关闭特效' : '开启特效'"
          @click="effectsEnabled = !effectsEnabled"
        >
          <UIcon
            :name="effectsEnabled ? 'i-lucide-sparkles' : 'i-lucide-eye-off'"
          />
        </button>
        <button
          type="button"
          class="icon-button mobile-menu"
          aria-label="打开导航"
          aria-controls="mobile-navigation"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon name="i-lucide-menu" />
        </button>
      </div>
      <Transition name="fade">
        <nav
          v-if="mobileOpen"
          id="mobile-navigation"
          class="mobile-nav glass"
          aria-label="移动端主导航"
        >
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            :class="{ active: isNavActive(item.to) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </Transition>
    </header>
    <main><slot /></main>
    <footer class="site-footer">
      <div class="site-footer__brand">
        <span class="brand-mark small">LM</span>
        <span>记录工程实践，也记录持续思考。</span>
      </div>
      <nav aria-label="页脚导航">
        <NuxtLink to="/articles">文章归档</NuxtLink>
        <NuxtLink to="/projects">项目实践</NuxtLink>
        <NuxtLink to="/showcase">作品展示</NuxtLink>
        <NuxtLink to="/about">关于作者</NuxtLink>
      </nav>
      <div>© {{ new Date().getFullYear() }} 刘梦涛 · Built with Nuxt</div>
    </footer>
  </div>
</template>
