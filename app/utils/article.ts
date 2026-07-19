export interface ArticleRouteSource {
  stem: string;
}

export interface ArticleSortSource extends ArticleRouteSource {
  date: string;
  title: string;
}

export interface HighlightedTextSegment {
  text: string;
  highlighted: boolean;
}

export const parseHighlightedText = (value: string) => {
  const segments: HighlightedTextSegment[] = [];
  const pattern = /==([^=\r\n]+)==/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) {
      segments.push({
        text: value.slice(cursor, match.index),
        highlighted: false,
      });
    }
    segments.push({ text: match[1] ?? "", highlighted: true });
    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) {
    segments.push({ text: value.slice(cursor), highlighted: false });
  }

  return segments.length ? segments : [{ text: value, highlighted: false }];
};

export const stripHighlightedText = (value: string) =>
  parseHighlightedText(value)
    .map((segment) => segment.text)
    .join("");

export const hasHighlightedText = (value: string) =>
  parseHighlightedText(value).some((segment) => segment.highlighted);

export const getArticlePath = (article: ArticleRouteSource) => {
  const stem = article.stem.replace(/^\/+/, "");
  return `/${stem}`;
};

export const getArticleStemFromRoute = (
  slug: string | string[] | undefined,
) => {
  const segments = Array.isArray(slug) ? slug : slug ? [slug] : [];
  return ["articles", ...segments].join("/");
};

export const sortArticlesByDate = <T extends ArticleSortSource>(
  articles: readonly T[],
) =>
  [...articles].sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      stripHighlightedText(left.title).localeCompare(
        stripHighlightedText(right.title),
        "zh-CN",
      ) ||
      left.stem.localeCompare(right.stem, "zh-CN"),
  );

export const toArticleNavigationTarget = <T extends ArticleSortSource>(
  article: T | undefined,
) =>
  article
    ? {
        path: getArticlePath(article),
        title: stripHighlightedText(article.title),
      }
    : undefined;
