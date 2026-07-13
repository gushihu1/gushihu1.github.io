<script setup lang="ts">
type Burst = { id: number; x: number; y: number };

const { active } = useEffects();
const finePointer = useMediaQuery("(pointer: fine)");
const dot = useTemplateRef<HTMLElement>("dot");
const ring = useTemplateRef<HTMLElement>("ring");
const bursts = ref<Burst[]>([]);

let burstId = 0;
let pointerX = -100;
let pointerY = -100;
let ringX = -100;
let ringY = -100;
let currentCard: HTMLElement | null = null;

const resetCard = () => {
  currentCard?.style.setProperty("--rx", "0deg");
  currentCard?.style.setProperty("--ry", "0deg");
  currentCard = null;
};

const onPointerMove = (event: PointerEvent) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!active.value || !finePointer.value) return;

  const card = (event.target as Element | null)?.closest?.(
    ".interactive-card",
  ) as HTMLElement | null;
  if (!card) {
    resetCard();
    return;
  }
  if (currentCard !== card) resetCard();
  currentCard = card;

  const rect = card.getBoundingClientRect();
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;
  const xRatio = localX / rect.width;
  const yRatio = localY / rect.height;
  card.style.setProperty("--mx", `${xRatio * 100}%`);
  card.style.setProperty("--my", `${yRatio * 100}%`);
  card.style.setProperty("--rx", `${(0.5 - yRatio) * 7}deg`);
  card.style.setProperty("--ry", `${(xRatio - 0.5) * 9}deg`);
};

const onPointerDown = (event: PointerEvent) => {
  if (!active.value || !finePointer.value || event.button !== 0) return;
  const id = ++burstId;
  bursts.value.push({ id, x: event.clientX, y: event.clientY });
  if (bursts.value.length > 6) bursts.value.shift();
  window.setTimeout(() => {
    bursts.value = bursts.value.filter((burst) => burst.id !== id);
  }, 720);
};

useEventListener(window, "pointermove", onPointerMove, { passive: true });
useEventListener(window, "pointerdown", onPointerDown, { passive: true });
useEventListener(window, "blur", resetCard);

const { pause, resume } = useRafFn(
  () => {
    ringX += (pointerX - ringX) * 0.14;
    ringY += (pointerY - ringY) * 0.14;
    if (dot.value)
      dot.value.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    if (ring.value)
      ring.value.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
  },
  { immediate: false },
);

watch(
  () => active.value && finePointer.value,
  (enabled) => {
    if (enabled) resume();
    else {
      pause();
      resetCard();
    }
  },
  { immediate: true },
);

onBeforeUnmount(resetCard);
</script>

<template>
  <div v-if="active && finePointer" class="fx-layer" aria-hidden="true">
    <i ref="dot" class="cursor-dot" />
    <i ref="ring" class="cursor-ring" />
    <i class="fx-beam beam-a" />
    <i class="fx-beam beam-b" />
    <span
      v-for="burst in bursts"
      :key="burst.id"
      class="click-burst"
      :style="{ left: `${burst.x}px`, top: `${burst.y}px` }"
    />
  </div>
</template>
