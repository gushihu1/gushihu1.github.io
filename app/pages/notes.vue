<script setup lang="ts">
if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: "页面不存在" });
}

definePageMeta({ scrollToTop: false });
useSeoMeta({ title: "个人笔记", robots: "noindex, nofollow" });

interface LocalNote {
  id: string;
  title: string;
  relativePath: string;
  content: string;
}

const notes = ref<LocalNote[]>([]);
const selectedId = ref("");
const loading = ref(true);
const errorMessage = ref("");
const selectedNote = computed(
  () => notes.value.find((note) => note.id === selectedId.value) || null,
);

onMounted(async () => {
  try {
    const result = await $fetch<{ notes: LocalNote[] }>(
      "/api/local-content/notes",
    );
    notes.value = result.notes;
    selectedId.value = result.notes[0]?.id || "";
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "个人笔记读取失败";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-shell private-notes-page">
    <header class="page-hero private-notes-hero">
      <div>
        <span class="eyebrow"><span /> PRIVATE NOTES</span>
        <h1>个人笔记</h1>
        <p>仅在本地开发环境读取，不进入公开内容集合和生产构建数据。</p>
      </div>
      <div class="private-notes-count" aria-label="个人笔记统计">
        <strong>{{ notes.length }}</strong>
        <span>篇本地笔记</span>
      </div>
    </header>

    <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>

    <div v-if="loading" class="empty-state glass">
      <UIcon name="i-lucide-loader-circle" />
      <h2>正在读取个人笔记</h2>
    </div>

    <div v-else-if="notes.length" class="private-notes-layout">
      <aside class="private-notes-sidebar glass" aria-label="个人笔记列表">
        <button
          v-for="note in notes"
          :key="note.id"
          type="button"
          :class="{ active: note.id === selectedId }"
          @click="selectedId = note.id"
        >
          <strong>{{ note.title }}</strong>
          <span>{{ note.relativePath }}</span>
        </button>
      </aside>

      <article v-if="selectedNote" class="private-note-content glass">
        <header>
          <span class="eyebrow"><span /> LOCAL MARKDOWN</span>
          <h2>{{ selectedNote.title }}</h2>
          <code>content/private-notes/{{ selectedNote.relativePath }}</code>
        </header>
        <MDC :value="selectedNote.content" class="prose" />
      </article>
    </div>

    <div v-else-if="!errorMessage" class="empty-state glass">
      <UIcon name="i-lucide-notebook-pen" />
      <h2>还没有个人笔记</h2>
      <p>
        在 <code>content/private-notes</code> 中添加 Markdown
        文件后即可在这里查看。
      </p>
    </div>
  </div>
</template>

<style scoped>
.private-notes-page {
  padding: 128px 0 100px;
}

.private-notes-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
}

.private-notes-count {
  display: grid;
  min-width: 150px;
  padding: 18px 22px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(11, 14, 25, 0.7);
}

.private-notes-count strong {
  color: var(--accent-2);
  font-size: 2rem;
}

.private-notes-count span,
.private-notes-sidebar button span {
  color: var(--muted);
  font-size: 0.78rem;
}

.private-notes-layout {
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  gap: 22px;
  margin-top: 32px;
  align-items: start;
}

.private-notes-sidebar {
  display: grid;
  gap: 8px;
  padding: 12px;
  position: sticky;
  top: 104px;
}

.private-notes-sidebar button {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.private-notes-sidebar button:hover,
.private-notes-sidebar button.active {
  border-color: rgba(124, 92, 255, 0.4);
  background: rgba(124, 92, 255, 0.12);
}

.private-note-content {
  min-width: 0;
  padding: clamp(24px, 4vw, 48px);
}

.private-note-content header {
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--line);
}

.private-note-content h2 {
  margin: 12px 0;
  font-size: clamp(1.7rem, 4vw, 2.6rem);
}

.private-note-content code {
  color: var(--muted);
}

@media (max-width: 760px) {
  .private-notes-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .private-notes-layout {
    grid-template-columns: 1fr;
  }

  .private-notes-sidebar {
    position: static;
  }
}
</style>
