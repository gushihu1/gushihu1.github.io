export type MainPagePersistenceKey = "home" | "projects" | "articles" | "about";

export const useMainPagePersistence = (key: MainPagePersistenceKey) => {
  const positions = useState<Record<MainPagePersistenceKey, number>>(
    "main-page-scroll-positions",
    () => ({
      home: 0,
      projects: 0,
      articles: 0,
      about: 0,
    }),
  );

  const savePosition = () => {
    if (!import.meta.client) return;
    positions.value[key] = window.scrollY;
  };

  const restorePosition = async () => {
    if (!import.meta.client) return;
    await nextTick();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: positions.value[key],
          left: 0,
          behavior: "auto",
        });
      });
    });
  };

  onBeforeRouteLeave(savePosition);
  onMounted(restorePosition);
  onActivated(restorePosition);
};
