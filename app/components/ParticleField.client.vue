<script setup lang="ts">
const { active, intensity } = useEffects()
const options = computed(() => ({
  fullScreen: { enable: false }, background: { color: { value: 'transparent' } }, fpsLimit: 60,
  particles: {
    color: { value: ['#7c5cff', '#00e5ff', '#ffffff'] }, links: { color: '#7c5cff', distance: 140, enable: true, opacity: .18, width: 1 },
    move: { enable: true, speed: intensity.value / 80, direction: 'none' as const, outModes: { default: 'bounce' as const } },
    number: { density: { enable: true }, value: Math.round(intensity.value * .6) }, opacity: { value: { min: .1, max: .45 } }, size: { value: { min: 1, max: 2.5 } }
  },
  interactivity: { events: { onHover: { enable: true, mode: 'grab' }, resize: { enable: true } }, modes: { grab: { distance: 160, links: { opacity: .45 } } } },
  detectRetina: true
}))
</script>
<template><VueParticles v-if="active" id="hero-particles" class="particles" :options="options" /></template>
