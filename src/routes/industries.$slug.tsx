import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { IndustryPage } from "@/components/site/industry-page";
import { getIndustry } from "@/data/industries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/industries/$slug")({
  loader: ({ params }) => {
    const industry = getIndustry(params.slug);
    if (!industry) throw notFound();
    return industry;
  },
  component: IndustryRoute,
  notFoundComponent: MissingIndustry,
  head: ({ loaderData }) => pageHead(`/industries/${loaderData?.slug ?? ""}`),
});

function IndustryRoute() {
  const industry = Route.useLoaderData();
  return <IndustryPage industry={industry} />;
}

function MissingIndustry() {
  return (
    <main className="px-5 py-24 text-center">
      <h1 className="text-[32px] font-semibold text-ink">That floor is not on the map.</h1>
      <Link to="/industries" className="mt-4 inline-block text-link">
        All sectors ›
      </Link>
    </main>
  );
}
