import { createFileRoute } from "@tanstack/react-router";
import { GalleryStrips } from "@/components/site/gallery-strips";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => pageHead("/gallery"),
});

function GalleryPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-6 pt-14 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Gallery
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Hall of Fame.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
          Hardware, sectors, and the desk.
        </p>
      </section>
      <GalleryStrips />
    </main>
  );
}