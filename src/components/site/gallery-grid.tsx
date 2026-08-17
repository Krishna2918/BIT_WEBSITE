import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { GalleryGroup, GalleryItem } from "@/data/gallery";

const FILTERS: { id: "all" | GalleryGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sector", label: "Sectors" },
  { id: "hardware", label: "Hardware" },
  { id: "desk", label: "Desk" },
];

export function GalleryGrid({
  items,
  filters = false,
}: {
  items: GalleryItem[];
  filters?: boolean;
}) {
  const [group, setGroup] = useState<"all" | GalleryGroup>("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = group === "all" ? items : items.filter((i) => i.group === group);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((n) => (n === null ? n : (n + 1) % shown.length));
      if (e.key === "ArrowLeft")
        setOpen((n) => (n === null ? n : (n - 1 + shown.length) % shown.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shown.length]);

  const active = open !== null ? shown[open] : null;

  return (
    <>
      {filters ? (
        <div className="gallery-filters" role="tablist" aria-label="Gallery filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={group === f.id}
              className={group === f.id ? "is-on" : undefined}
              onClick={() => {
                setGroup(f.id);
                setOpen(null);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="gallery-grid">
        {shown.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              className="gallery-tile"
              onClick={() => setOpen(i)}
              aria-label={`Open ${item.label}`}
            >
              <img src={item.src} alt={item.alt} />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <div className="gallery-lightbox">
          <button
            type="button"
            className="gallery-scrim"
            aria-label="Close photo"
            onClick={() => setOpen(null)}
          />
          <figure>
            <img src={active.src} alt={active.alt} />
            <figcaption>
              <strong>{active.label}</strong>
              <em>{active.alt}</em>
            </figcaption>
            <button
              type="button"
              className="gallery-close"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </figure>
        </div>
      ) : null}
    </>
  );
}
