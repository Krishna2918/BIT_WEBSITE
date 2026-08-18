import { SeoArticle } from "@/components/site/seo-article";
import { LEGACY_PAGES } from "@/data/legacy-pages";
import { pageHead } from "@/lib/seo";

export function legacyRoute(path: keyof typeof LEGACY_PAGES) {
  const page = LEGACY_PAGES[path];
  return {
    component: () => <SeoArticle page={page} />,
    head: () => pageHead(path),
  };
}
