<script setup lang="ts">
const props = defineProps<{ email: string }>();
const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

const legacyCopy = (value: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  textarea.remove();
  return succeeded;
};

const copyEmail = async () => {
  let succeeded = false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.email);
      succeeded = true;
    }
  } catch {
    succeeded = false;
  }

  if (!succeeded) succeeded = legacyCopy(props.email);
  if (!succeeded) return;

  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = false), 1800);
};

onBeforeUnmount(() => clearTimeout(copiedTimer));
</script>

<template>
  <button
    type="button"
    class="button primary copy-email-button"
    :aria-label="`复制邮箱 ${email}`"
    @click="copyEmail"
  >
    <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
    <span aria-live="polite">{{ copied ? "已复制" : email }}</span>
  </button>
</template>
