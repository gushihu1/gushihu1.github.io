<script setup lang="ts">
import { motion } from 'motion-v'

withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })
const { active } = useEffects()
</script>
<template>
  <motion.div :initial="active ? { opacity: 0, y: 28 } : false" :while-in-view="{ opacity: 1, y: 0 }" :viewport="{ once: true, margin: '-8%' }" :transition="{ duration: .65, delay }"><slot /></motion.div>
</template>
