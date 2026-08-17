import { createFileRoute } from "@tanstack/react-router";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { GALLERY } from "@/data/gallery";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — BIT Solution" },
      {
        name: "description",
        content:
          "Floors BIT Solution walks: hardware, sectors, and the desk — across Ontario.",
      },
    ],
  }),
});

function GalleryPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Gallery
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          The floors we walk.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Hardware, sectors, and the desk. These are the rooms — not case studies.
        </p>
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <GalleryGrid items={GALLERY} filters />
      </section>
    </main>
  );
}
