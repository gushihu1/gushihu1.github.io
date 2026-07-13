<script setup lang="ts">
import { profile } from "~/data/profile";

definePageMeta({ scrollToTop: false });
useMainPagePersistence("about");

useSeoMeta({ title: "关于我", description: profile.summary });
</script>
<template>
  <div class="page-shell">
    <section class="about-hero">
      <div class="about-avatar glass">
        <div class="avatar-core">
          <span>{{ profile.initials }}</span
          ><small>FRONTEND<br />ENGINEER</small>
        </div>
      </div>
      <div>
        <span class="eyebrow"><span /> ABOUT ME</span>
        <h1>你好，我是{{ profile.name }}</h1>
        <p>{{ profile.summary }}</p>
        <CopyEmailButton :email="profile.email" />
      </div>
    </section>
    <section class="about-grid">
      <Reveal
        ><div class="glass info-panel">
          <SectionTitle eyebrow="EXPERIENCE" title="工作经历" />
          <div class="timeline">
            <div v-for="item in profile.experience" :key="item.company">
              <span class="timeline-dot" /><time>{{ item.period }}</time>
              <h3>{{ item.company }}</h3>
              <strong>{{ item.role }}</strong>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div></Reveal
      ><Reveal :delay="0.1"
        ><div class="glass info-panel">
          <SectionTitle eyebrow="EDUCATION" title="教育与能力" />
          <div class="education">
            <UIcon name="i-lucide-graduation-cap" />
            <div>
              <h3>{{ profile.education.school }}</h3>
              <p>{{ profile.education.degree }}</p>
              <time>{{ profile.education.period }}</time>
            </div>
          </div>
          <h3 class="subheading">技术栈</h3>
          <div class="skill-chips">
            <span v-for="item in profile.stack" :key="item">{{ item }}</span>
          </div>
          <h3 class="subheading">专业技能</h3>
          <ol class="ability-list compact">
            <li v-for="(ability, i) in profile.abilities" :key="ability">
              <span>{{ String(i + 1).padStart(2, "0") }}</span>
              <p>{{ ability }}</p>
            </li>
          </ol>
        </div></Reveal
      >
    </section>
  </div>
</template>
