export const useEffects = () => {
  const reducedMotion = usePreferredReducedMotion()
  const effectsEnabled = useState('effects-enabled', () => true)
  const intensity = useState('effects-intensity', () => 72)
  const accent = useState('accent-color', () => '#7c5cff')
  const active = computed(() => effectsEnabled.value && reducedMotion.value !== 'reduce')
  return { effectsEnabled, intensity, accent, active, reducedMotion }
}
