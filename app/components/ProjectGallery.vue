<script setup lang="ts">
type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

const props = defineProps<{
  images?: GalleryImage[];
  title: string;
}>();

const gallery = computed(() => props.images ?? []);
const activeIndex = ref(0);
const isOpen = ref(false);
const failedImages = ref<Set<string>>(new Set());
const triggerElement = shallowRef<HTMLElement>();
const pointerStartX = ref<number>();
let previousBodyOverflow = "";
const currentImage = computed(() => gallery.value[activeIndex.value]);
const hasMultipleImages = computed(() => gallery.value.length > 1);

function openImage(index: number, event: MouseEvent) {
  activeIndex.value = index;
  triggerElement.value = event.currentTarget as HTMLElement;
  isOpen.value = true;
}

function closeLightbox() {
  isOpen.value = false;
}

function showPrevious() {
  if (!gallery.value.length) return;
  activeIndex.value =
    (activeIndex.value - 1 + gallery.value.length) % gallery.value.length;
}

function showNext() {
  if (!gallery.value.length) return;
  activeIndex.value = (activeIndex.value + 1) % gallery.value.length;
}

function markImageFailed(src: string) {
  failedImages.value = new Set([...failedImages.value, src]);
}

function startSwipe(event: PointerEvent) {
  pointerStartX.value = event.clientX;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function finishSwipe(event: PointerEvent) {
  const startX = pointerStartX.value;
  pointerStartX.value = undefined;
  if (startX === undefined || !hasMultipleImages.value) return;

  const distance = event.clientX - startX;
  if (Math.abs(distance) < 50) return;
  distance > 0 ? showPrevious() : showNext();
}

watch(isOpen, async (open) => {
  if (!import.meta.client) return;

  if (open) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  await nextTick();
  triggerElement.value?.focus();
});

onBeforeUnmount(() => {
  if (import.meta.client && isOpen.value) {
    document.body.style.overflow = previousBodyOverflow;
  }
});

useEventListener("keydown", (event) => {
  if (!isOpen.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
    return;
  }
  if (!hasMultipleImages.value) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPrevious();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showNext();
  }
});
</script>

<template>
  <div class="project-gallery">
    <button
      v-for="(image, index) in gallery"
      :key="`${image.src}-${index}`"
      type="button"
      class="project-gallery__item"
      :aria-label="`查看${title}图片：${image.alt}`"
      @click="openImage(index, $event)"
    >
      <img
        v-if="!failedImages.has(image.src)"
        :src="image.src"
        :alt="image.alt"
        loading="lazy"
        decoding="async"
        @error="markImageFailed(image.src)"
      />
      <span v-else class="project-gallery__error" role="status">
        <UIcon name="i-lucide-image-off" />
        <span>图片暂时无法加载</span>
      </span>
      <span class="project-gallery__overlay" aria-hidden="true">
        <UIcon name="i-lucide-maximize-2" />
      </span>
      <span v-if="image.caption" class="project-gallery__caption">
        {{ image.caption }}
      </span>
    </button>
  </div>

  <Teleport to="body">
    <Transition name="project-lightbox">
      <div
        v-if="isOpen && currentImage"
        class="project-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${title}图片预览`"
        @click.self="closeLightbox"
      >
        <div class="project-lightbox__content">
          <div class="project-lightbox__toolbar">
            <span>{{ activeIndex + 1 }} / {{ gallery.length }}</span>
            <button
              type="button"
              aria-label="关闭图片预览"
              @click="closeLightbox"
            >
              <UIcon name="i-lucide-x" />
            </button>
          </div>

          <button
            v-if="hasMultipleImages"
            type="button"
            class="project-lightbox__nav project-lightbox__nav--previous"
            aria-label="查看上一张图片"
            @click="showPrevious"
          >
            <UIcon name="i-lucide-chevron-left" />
          </button>

          <div
            class="project-lightbox__stage"
            @pointerdown="startSwipe"
            @pointerup="finishSwipe"
            @pointercancel="pointerStartX = undefined"
          >
            <img
              v-if="!failedImages.has(currentImage.src)"
              :src="currentImage.src"
              :alt="currentImage.alt"
              decoding="async"
              @error="markImageFailed(currentImage.src)"
            />
            <div v-else class="project-lightbox__error" role="status">
              <UIcon name="i-lucide-image-off" />
              <span>图片暂时无法加载</span>
            </div>
          </div>

          <button
            v-if="hasMultipleImages"
            type="button"
            class="project-lightbox__nav project-lightbox__nav--next"
            aria-label="查看下一张图片"
            @click="showNext"
          >
            <UIcon name="i-lucide-chevron-right" />
          </button>

          <div class="project-lightbox__description">
            <strong>{{ currentImage.alt }}</strong>
            <span v-if="currentImage.caption">{{ currentImage.caption }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
