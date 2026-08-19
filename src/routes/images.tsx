import { createFileRoute, Link } from "@tanstack/react-router";
import { OntarioImageMap } from "@/components/site/ontario-image-map";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/images")({
  component: ImagesPage,
  head: () => pageHead("/images"),
});

function ImagesPage() {
  return (
    <main className="images-page">
      <section className="images-page-copy">
        <p>Images</p>
        <h1>Services across Ontario.</h1>
        <p>
          Floors appear on the map and leave. Stock until the client shots land.
        </p>
        <p>
          <Link to="/gallery">Still gallery ›</Link>
        </p>
      </section>
      <OntarioImageMap />
    </main>
  );
}
