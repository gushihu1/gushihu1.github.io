import { buildKnowledgeNetwork } from "~/utils/knowledge";

export const useKnowledgeNetwork = () =>
  useAsyncData("knowledge-network", async () => {
    const [articles, projects, showcases] = await Promise.all([
      withContentQueryRetry(() => queryCollection("articles").all()),
      withContentQueryRetry(() => queryCollection("projects").all()),
      withContentQueryRetry(() => queryCollection("showcases").all()),
    ]);
    const network = buildKnowledgeNetwork({
      articles,
      projects,
      showcases,
    });

    if (import.meta.dev) {
      for (const warning of network.warnings) {
        console.warn(`[knowledge] ${warning}`);
      }
    }

    return network;
  });
