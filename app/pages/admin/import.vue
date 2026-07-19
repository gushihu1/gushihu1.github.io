<script setup lang="ts">
if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: "页面不存在" });
}

type ImportStatus = "new" | "identical" | "conflict" | "rename";
type ConflictDecision = "keep" | "replace" | "keepBoth";

interface ImportItem {
  id: string;
  title: string;
  status: ImportStatus;
  filename: string;
  folder: string;
  relativePath: string;
  existingFilename: string | null;
  existingRelativePath: string | null;
  existingHash: string | null;
  existingContent: string;
  incomingContent: string;
  warning: string;
  linkChanges: { added: string[]; removed: string[] };
  inboundReferences: Array<{
    file: string;
    line: number;
    target: string;
    willBreak: boolean;
  }>;
  requiresLinkConfirmation: boolean;
}

interface ImportPreview {
  sourceName: string;
  targetDir: string;
  items: ImportItem[];
  summary: Record<ImportStatus, number>;
  folderSummary: Array<{ folder: string; count: number; fallback: boolean }>;
  fallbackCount: number;
  warningCount: number;
}

interface ImportInput {
  sourceName: string;
  sourceText: string;
  sourceDate: string;
  targetDir: string;
  level: number;
  category: string;
  preset: "auto" | "interview" | "generic";
  sourceId: string;
  autoFolder: boolean;
  folderLevel: number;
}

useSeoMeta({ title: "本地内容导入", robots: "noindex, nofollow" });

const folders = ref<string[]>([".", "generated"]);
const selectedFile = ref<File | null>(null);
const targetDir = ref("generated");
const level = ref(4);
const autoFolder = ref(true);
const folderLevel = ref(3);
const category = ref("");
const preset = ref<ImportInput["preset"]>("auto");
const sourceId = ref("");
const preview = ref<ImportPreview | null>(null);
const inputSnapshot = ref<ImportInput | null>(null);
const decisions = reactive<Record<string, ConflictDecision>>({});
const busy = ref(false);
const message = ref("");
const errorMessage = ref("");
const allowLinkChanges = ref(false);

const statusLabels: Record<ImportStatus, string> = {
  new: "新增",
  identical: "内容一致",
  conflict: "内容冲突",
  rename: "移动/改名",
};

const conflicts = computed(() =>
  (preview.value?.items || []).filter((item) => item.status === "conflict"),
);
const allConflictsResolved = computed(() =>
  conflicts.value.every((item) => Boolean(decisions[item.id])),
);
const relationRiskItems = computed(() =>
  (preview.value?.items || []).filter((item) => {
    if (item.status === "rename") return item.inboundReferences.length > 0;
    return (
      item.status === "conflict" &&
      decisions[item.id] === "replace" &&
      (item.linkChanges.removed.length > 0 || item.inboundReferences.length > 0)
    );
  }),
);
const folderLevelOptions = computed(() =>
  Array.from({ length: Math.max(0, level.value - 1) }, (_, index) => index + 1),
);

watch(level, (value) => {
  if (folderLevel.value >= value || folderLevel.value < 1) {
    folderLevel.value = Math.max(1, value - 1);
  }
});

onMounted(async () => {
  try {
    const result = await $fetch<{ folders: string[] }>(
      "/api/local-content/folders",
    );
    folders.value = result.folders;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
});

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error) {
    const value = error as {
      data?: { statusMessage?: string; message?: string };
      message?: string;
    };
    return (
      value.data?.statusMessage ||
      value.data?.message ||
      value.message ||
      "操作失败"
    );
  }
  return String(error || "操作失败");
}

function handleFile(event: Event) {
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] || null;
  preview.value = null;
  message.value = "";
  errorMessage.value = "";
}

function resetDecisions() {
  for (const key of Object.keys(decisions)) delete decisions[key];
  allowLinkChanges.value = false;
}

async function createInputSnapshot(): Promise<ImportInput> {
  if (!selectedFile.value) throw new Error("请先选择 Markdown 文件");
  const normalizedTarget = targetDir.value.trim().replace(/\\/g, "/");
  if (!normalizedTarget) throw new Error("请选择或输入目标目录");
  return {
    sourceName: selectedFile.value.name,
    sourceText: await selectedFile.value.text(),
    sourceDate: new Date(selectedFile.value.lastModified || Date.now())
      .toISOString()
      .slice(0, 10),
    targetDir: normalizedTarget,
    level: level.value,
    category: category.value.trim(),
    preset: preset.value,
    sourceId: sourceId.value.trim(),
    autoFolder: autoFolder.value,
    folderLevel: folderLevel.value,
  };
}

async function loadPreview() {
  busy.value = true;
  message.value = "";
  errorMessage.value = "";
  resetDecisions();
  try {
    const input = await createInputSnapshot();
    const result = await $fetch<ImportPreview>(
      "/api/local-content/import/preview",
      {
        method: "POST",
        body: input,
      },
    );
    inputSnapshot.value = input;
    preview.value = result;
    for (const item of result.items) {
      if (item.status === "conflict") decisions[item.id] = "keep";
    }
  } catch (error) {
    preview.value = null;
    errorMessage.value = getErrorMessage(error);
  } finally {
    busy.value = false;
  }
}

function setAllConflicts(decision: ConflictDecision) {
  for (const item of conflicts.value) decisions[item.id] = decision;
}

async function applyChanges() {
  if (!preview.value || !inputSnapshot.value || !allConflictsResolved.value)
    return;
  busy.value = true;
  message.value = "";
  errorMessage.value = "";
  try {
    const result = await $fetch<{
      targetDir: string;
      summary: Record<string, number>;
    }>("/api/local-content/import/apply", {
      method: "POST",
      body: {
        input: inputSnapshot.value,
        decisions: { ...decisions },
        expectedItems: preview.value.items.map((item) => ({
          id: item.id,
          status: item.status,
          existingFilename: item.existingFilename,
          existingRelativePath: item.existingRelativePath,
          relativePath: item.relativePath,
          existingHash: item.existingHash,
        })),
        allowLinkChanges: allowLinkChanges.value,
      },
    });
    const summary = result.summary;
    message.value = `导入完成：新增 ${summary.created}，替换 ${summary.replaced}，同时保留 ${summary.keptBoth}，保留原文件 ${summary.kept}，改名 ${summary.renamed}，跳过 ${summary.identical}`;
    preview.value = null;
    const folderResult = await $fetch<{ folders: string[] }>(
      "/api/local-content/folders",
    );
    folders.value = folderResult.folders;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="page-shell import-page">
    <header class="page-hero import-hero">
      <span class="eyebrow"><span /> LOCAL CONTENT TOOL</span>
      <h1>文章导入管理</h1>
      <p>选择 Markdown 知识库，预览拆分结果后安全写入本地文章目录。</p>
    </header>

    <section class="import-panel glass">
      <div class="form-grid">
        <label class="file-field">
          <span>Markdown 文件</span>
          <input
            type="file"
            accept=".md,text/markdown,text/plain"
            @change="handleFile"
          />
          <small>{{ selectedFile?.name || "尚未选择文件" }}</small>
        </label>
        <label>
          <span>导入根目录</span>
          <input
            v-model="targetDir"
            list="article-folders"
            placeholder=".、generated 或 vue/基础"
          />
          <datalist id="article-folders">
            <option value=".">content/articles（根目录）</option>
            <option
              v-for="folder in folders.filter((item) => item !== '.')"
              :key="folder"
              :value="folder"
            />
          </datalist>
          <small>“.” 表示 content/articles，也可选择已有目录或输入新目录</small>
        </label>
        <label class="switch-field">
          <span>按标题自动分目录</span>
          <span class="switch-control">
            <input v-model="autoFolder" type="checkbox" />
            <span>{{ autoFolder ? "已开启" : "已关闭（平铺导入）" }}</span>
          </span>
          <small>分类目录生成在所选导入根目录下面</small>
        </label>
        <label>
          <span>目录标题级别</span>
          <select v-model.number="folderLevel" :disabled="!autoFolder">
            <option
              v-for="value in folderLevelOptions"
              :key="value"
              :value="value"
            >
              {{ value }} 级标题
            </option>
          </select>
          <small>缺少该级父标题的文章会进入“其他”</small>
        </label>
        <label>
          <span>拆分标题级别</span>
          <select v-model.number="level">
            <option
              v-for="value in [2, 3, 4, 5, 6]"
              :key="value"
              :value="value"
            >
              {{ value }} 级标题
            </option>
          </select>
        </label>
        <label>
          <span>导入预设</span>
          <select v-model="preset">
            <option value="auto">自动识别</option>
            <option value="generic">普通 Markdown</option>
            <option value="interview">现有前端知识库</option>
          </select>
        </label>
        <label>
          <span>固定分类（可选）</span>
          <input v-model="category" placeholder="例如 Vue、AI、工程化" />
        </label>
        <label>
          <span>来源标识（可选）</span>
          <input v-model="sourceId" placeholder="仅用于兼容命令行参数" />
        </label>
      </div>
      <div class="panel-actions">
        <button
          class="button primary"
          :disabled="busy || !selectedFile"
          @click="loadPreview"
        >
          {{ busy ? "处理中..." : "预览导入" }}
        </button>
      </div>
    </section>

    <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
    <p v-if="message" class="notice success">{{ message }}</p>

    <template v-if="preview">
      <section class="summary-grid">
        <div class="summary-card glass">
          <strong>{{ preview.summary.new }}</strong
          ><span>新增</span>
        </div>
        <div class="summary-card glass">
          <strong>{{ preview.summary.identical }}</strong
          ><span>内容一致</span>
        </div>
        <div class="summary-card glass conflict">
          <strong>{{ preview.summary.conflict }}</strong
          ><span>冲突</span>
        </div>
        <div class="summary-card glass">
          <strong>{{ preview.summary.rename }}</strong
          ><span>移动/改名</span>
        </div>
      </section>

      <section class="folder-distribution glass">
        <div>
          <strong>目录分布</strong>
          <span v-if="preview.fallbackCount"
            >“其他” {{ preview.fallbackCount }} 篇</span
          >
          <span v-if="preview.warningCount"
            >{{ preview.warningCount }} 条匹配警告</span
          >
        </div>
        <ul>
          <li v-for="entry in preview.folderSummary" :key="entry.folder">
            <code>{{ entry.folder }}</code>
            <span>{{ entry.count }} 篇</span>
          </li>
        </ul>
      </section>

      <section v-if="conflicts.length" class="bulk-actions glass">
        <span>批量处理全部冲突</span>
        <button @click="setAllConflicts('keep')">全部保留现有</button>
        <button @click="setAllConflicts('replace')">全部使用新内容</button>
        <button @click="setAllConflicts('keepBoth')">全部同时保留</button>
      </section>

      <section class="preview-list">
        <article
          v-for="item in preview.items"
          :key="item.id"
          class="preview-item glass"
        >
          <header>
            <div>
              <span class="status" :class="item.status">{{
                statusLabels[item.status]
              }}</span>
              <h2>{{ item.title }}</h2>
            </div>
            <code
              >{{ item.existingRelativePath || "—" }} →
              {{ item.relativePath }}</code
            >
          </header>

          <p v-if="item.warning" class="item-warning">{{ item.warning }}</p>

          <div
            v-if="
              item.linkChanges.added.length ||
              item.linkChanges.removed.length ||
              item.inboundReferences.length
            "
            class="item-warning"
          >
            <strong>Wiki Link 关系变化</strong>
            <p v-if="item.linkChanges.added.length">
              新增：{{ item.linkChanges.added.join("、") }}
            </p>
            <p v-if="item.linkChanges.removed.length">
              删除：{{ item.linkChanges.removed.join("、") }}
            </p>
            <p v-if="item.inboundReferences.length">
              当前文件被引用：{{
                item.inboundReferences
                  .map((entry) => `${entry.file}:${entry.line}`)
                  .join("、")
              }}
            </p>
          </div>

          <div v-if="item.status === 'conflict'" class="conflict-layout">
            <div>
              <h3>现有文件</h3>
              <pre>{{ item.existingContent }}</pre>
            </div>
            <div>
              <h3>导入内容</h3>
              <pre>{{ item.incomingContent }}</pre>
            </div>
          </div>

          <div v-if="item.status === 'conflict'" class="decision-row">
            <label
              ><input
                v-model="decisions[item.id]"
                type="radio"
                value="keep"
              />保留现有</label
            >
            <label
              ><input
                v-model="decisions[item.id]"
                type="radio"
                value="replace"
              />使用新内容</label
            >
            <label
              ><input
                v-model="decisions[item.id]"
                type="radio"
                value="keepBoth"
              />同时保留</label
            >
          </div>
        </article>
      </section>

      <div class="apply-bar glass">
        <span
          >导入根目录：content/articles{{
            preview.targetDir === "." ? "" : `/${preview.targetDir}`
          }}</span
        >
        <label v-if="relationRiskItems.length" class="switch-control">
          <input v-model="allowLinkChanges" type="checkbox" />
          <span>确认删除关系或移动被引用文件</span>
        </label>
        <button
          class="button primary"
          :disabled="
            busy ||
            !allConflictsResolved ||
            (relationRiskItems.length > 0 && !allowLinkChanges)
          "
          @click="applyChanges"
        >
          {{ busy ? "正在写入..." : "确认应用" }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.import-page {
  padding: 128px 0 100px;
}
.import-hero {
  padding: 0 0 34px;
}
.import-hero h1 {
  margin: 10px 0 8px;
  font-size: clamp(2.2rem, 5vw, 4.5rem);
}
.import-hero p {
  color: var(--muted);
}
.import-panel {
  padding: 26px;
  border-radius: var(--radius);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.form-grid label {
  display: grid;
  gap: 8px;
  color: #dfe4f5;
}
.form-grid small {
  color: var(--muted);
}
.form-grid input,
.form-grid select {
  width: 100%;
  color: var(--text);
  background: rgba(5, 7, 14, 0.72);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
}
.switch-control {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}
.switch-control input {
  width: 18px;
  height: 18px;
}
.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 22px;
}
.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.notice {
  padding: 14px 18px;
  border-radius: 14px;
  margin: 18px 0;
}
.notice.error {
  color: #ffb7c2;
  background: rgba(255, 72, 105, 0.1);
  border: 1px solid rgba(255, 72, 105, 0.22);
}
.notice.success {
  color: #a8ffd2;
  background: rgba(50, 255, 154, 0.08);
  border: 1px solid rgba(50, 255, 154, 0.2);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 22px 0;
}
.summary-card {
  padding: 20px;
  border-radius: 18px;
  display: grid;
  gap: 4px;
}
.summary-card strong {
  font-size: 2rem;
}
.summary-card span {
  color: var(--muted);
}
.summary-card.conflict strong {
  color: #ff9aab;
}
.bulk-actions {
  padding: 14px 18px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.folder-distribution {
  margin: 18px 0;
  padding: 18px;
  border-radius: 16px;
}
.folder-distribution > div {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.folder-distribution > div span {
  color: var(--muted);
}
.folder-distribution ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 14px 0 0;
  list-style: none;
}
.folder-distribution li {
  display: flex;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
}
.folder-distribution li span,
.item-warning {
  color: #ffc978;
}
.item-warning {
  margin: 12px 0 0;
}
.bulk-actions span {
  margin-right: auto;
  color: var(--muted);
}
.bulk-actions button {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  cursor: pointer;
}
.preview-list {
  display: grid;
  gap: 16px;
  margin: 18px 0;
}
.preview-item {
  border-radius: 20px;
  padding: 20px;
}
.preview-item header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.preview-item h2 {
  margin: 8px 0 0;
  font-size: 1.15rem;
}
.preview-item code {
  color: var(--muted);
  text-align: right;
  overflow-wrap: anywhere;
}
.status {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 0.72rem;
  background: rgba(124, 92, 255, 0.14);
}
.status.conflict {
  color: #ffb7c2;
  background: rgba(255, 72, 105, 0.12);
}
.status.identical {
  color: #a8ffd2;
  background: rgba(50, 255, 154, 0.1);
}
.conflict-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 18px;
}
.conflict-layout h3 {
  color: var(--muted);
  font-size: 0.82rem;
}
.conflict-layout pre {
  max-height: 390px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 16px;
  border-radius: 14px;
  background: #070912;
  border: 1px solid var(--line);
  font-size: 0.78rem;
}
.decision-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.decision-row label {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}
.apply-bar {
  position: sticky;
  bottom: 18px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  border-radius: 18px;
}
@media (max-width: 760px) {
  .form-grid,
  .conflict-layout {
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .preview-item header,
  .apply-bar {
    align-items: flex-start;
    flex-direction: column;
  }
  .preview-item code {
    text-align: left;
  }
}
</style>
