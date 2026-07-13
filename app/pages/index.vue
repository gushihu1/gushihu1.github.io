<script setup lang="ts">
import { motion } from "motion-v";
import { profile } from "~/data/profile";

definePageMeta({ scrollToTop: false });
useMainPagePersistence("home");

const { active } = useEffects();
const { data: projects } = await useAsyncData("featured-projects", () =>
  queryCollection("projects").where("featured", "=", true).limit(3).all(),
);
const { data: articles } = await useAsyncData("latest-articles", () =>
  queryCollection("articles")
    .where("draft", "=", false)
    .order("path", "ASC")
    .limit(3)
    .all(),
);
const roles = [
  "Vue 前端开发",
  "UNI-APP 跨端开发",
  "echarts 图表开发",
  "前端项目搭建",
];
const roleIndex = useState("home-role-index", () => 0);
let timer: ReturnType<typeof setInterval> | undefined;

const startRoleTimer = () => {
  if (timer) return;
  timer = setInterval(
    () => (roleIndex.value = (roleIndex.value + 1) % roles.length),
    2600,
  );
};

const stopRoleTimer = () => {
  clearInterval(timer);
  timer = undefined;
};

onMounted(startRoleTimer);
onActivated(startRoleTimer);
onDeactivated(stopRoleTimer);
onBeforeUnmount(stopRoleTimer);
</script>

<template>
  <div>
    <section class="hero section-shell">
      <ClientOnly><ParticleField /></ClientOnly>
      <div class="hero-grid" />
      <div class="scanline" />
      <motion.div
        class="hero-copy"
        :initial="active ? { opacity: 0, y: 30 } : false"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
      >
        <div class="availability"><span /> AVAILABLE FOR GREAT IDEAS</div>
        <p class="hero-kicker">HELLO, I'M {{ profile.name }}</p>
        <h1>把复杂系统<br /><span>变成流畅体验。</span></h1>
        <div class="role-switcher">
          <UIcon name="i-lucide-terminal" /><Transition
            name="role"
            mode="out-in"
            ><strong :key="roleIndex">{{
              roles[roleIndex]
            }}</strong></Transition
          >
        </div>
        <p class="hero-summary">{{ profile.summary }}</p>
        <div class="hero-actions">
          <NuxtLink to="/projects" class="button primary"
            >探索我的作品 <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
          <NuxtLink to="/about" class="button secondary">了解更多</NuxtLink>
        </div>
      </motion.div>
      <motion.div
        class="hero-orbit"
        :initial="active ? { opacity: 0, scale: 0.85 } : false"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 1, delay: 0.2 }"
      >
        <div class="orbit-ring ring-1" />
        <div class="orbit-ring ring-2" />
        <div class="orbit-ring ring-3" />
        <div class="avatar-core">
          <span>{{ profile.initials }}</span
          ><small>FRONTEND<br />ENGINEER</small>
        </div>
        <span
          v-for="(item, i) in ['Vue', 'UNI-APP', 'echarts', 'ES6+']"
          :key="item"
          class="orbit-node"
          :class="`node-${i + 1}`"
          >{{ item }}</span
        >
      </motion.div>
      <div class="scroll-hint">
        <span>SCROLL TO EXPLORE</span>
        <div />
      </div>
    </section>

    <section class="ticker">
      <div>
        <span v-for="i in 2" :key="i"
          ><b v-for="tech in profile.stack" :key="`${i}-${tech}`"
            >{{ tech }} <i>✦</i></b
          ></span
        >
      </div>
    </section>

    <section class="section-shell content-section">
      <Reveal
        ><SectionTitle
          eyebrow="SELECTED WORK"
          title="从业务难题，到可复用方案"
          description="不止完成页面，更关注系统如何演进、能力如何沉淀。"
      /></Reveal>
      <div class="project-grid">
        <Reveal
          v-for="(project, i) in projects"
          :key="project.path"
          :delay="i * 0.08"
          ><ProjectCard :project="project" :index="i"
        /></Reveal>
      </div>
      <NuxtLink to="/projects" class="text-link"
        >查看全部项目 <UIcon name="i-lucide-arrow-right"
      /></NuxtLink>
    </section>

    <section class="section-shell content-section capability-section">
      <Reveal
        ><div class="capability-copy">
          <SectionTitle eyebrow="PROFESSIONAL SKILLS" title="专业技能" />
          <p>能力内容来自个人简历，不使用主观评分。</p>
          <div class="skill-chips">
            <span v-for="tech in profile.stack" :key="tech">{{ tech }}</span>
          </div>
        </div></Reveal
      >
      <Reveal :delay="0.12"
        ><div class="ability-panel glass">
          <ol class="ability-list">
            <li v-for="(ability, i) in profile.abilities" :key="ability">
              <span>{{ String(i + 1).padStart(2, "0") }}</span>
              <p>{{ ability }}</p>
            </li>
          </ol>
        </div></Reveal
      >
    </section>

    <section class="section-shell content-section">
      <Reveal
        ><SectionTitle
          eyebrow="FIELD NOTES"
          title="来自一线项目的技术笔记"
          description="记录那些真正影响稳定性、性能与开发体验的决策。"
      /></Reveal>
      <div class="article-grid">
        <Reveal
          v-for="(article, i) in articles"
          :key="article.path"
          :delay="i * 0.07"
          ><ArticleCard :article="article"
        /></Reveal>
      </div>
    </section>

    <section class="section-shell contact-banner glass">
      <div>
        <span class="eyebrow"><span /> LET'S CONNECT</span>
        <h2>有值得一起解决的问题？</h2>
        <p>欢迎交流 Vue、跨端、数据可视化，以及如何让 AI 真正进入开发流程。</p>
      </div>
      <CopyEmailButton :email="profile.email" />
    </section>
  </div>
</template>
