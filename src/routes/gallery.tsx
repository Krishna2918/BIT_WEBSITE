import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryStrips } from "@/components/site/gallery-strips";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => pageHead("/gallery"),
});

function GalleryPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-10 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Gallery
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          The floors we walk.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Hardware, sectors, and the desk. These are the rooms — not case studies.
        </p>
        <p className="mt-4">
          <Link to="/images" className="text-[16px] text-link no-underline hover:underline">
            Moving map of Ontario ›
          </Link>
        </p>
      </section>
      <GalleryStrips />
    </main>
  );
}