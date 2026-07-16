<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    icon?: string;
  }>(),
  { icon: "i-lucide-copy" },
);

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

const copyValue = async () => {
  let succeeded = false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.value);
      succeeded = true;
    }
  } catch {
    succeeded = false;
  }

  if (!succeeded) succeeded = legacyCopy(props.value);
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
    class="button primary copy-contact-button"
    :aria-label="`复制${label} ${value}`"
    @click="copyValue"
  >
    <UIcon :name="copied ? 'i-lucide-check' : icon" />
    <span aria-live="polite">{{ copied ? `${label}已复制` : value }}</span>
  </button>
</template>
