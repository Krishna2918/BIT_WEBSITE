import { useState } from "react";
import { GALLERY } from "@/data/gallery";

const DROP = Array.from({ length: 23 }, (_, i) => ({
  src: `/images/gallery/drop/wa-${String(i + 1).padStart(2, "0")}.jpg`,
  alt: "Floor BIT Solution walks",
}));

const ALL = [
  ...DROP,
  ...GALLERY.map((g) => ({ src: g.src, alt: g.alt })),
];

function row(start: number) {
  const items = ALL.filter((_, i) => i % 3 === start);
  const pad = [...items];
  while (pad.length < 10) pad.push(...items);
  return [...pad, ...pad];
}

const ROWS = [
  { items: row(0), size: "mid" as const, dir: "left" as const },
  { items: row(1), size: "lg" as const, dir: "right" as const },
  { items: row(2), size: "sm" as const, dir: "left" as const },
];

export function GalleryStrips() {
  const [open, setOpen] = useState<string | null>(null);
  const shot = open ? ALL.find((p) => p.src === open) : null;

  return (
    <div className="gallery-strips">
      <img
        className="gallery-strips-mark"
        src="/images/bit-mark-official.png"
        alt=""
        width={1914}
        height={1914}
      />
      {ROWS.map((r) => (
        <div
          key={r.size}
          className={`gallery-strip gallery-strip-${r.size}${r.dir === "right" ? " gallery-strip-rev" : ""}`}
        >
          <ul>
            {r.items.map((item, i) => (
              <li key={`${item.src}-${i}`}>
                <button type="button" onClick={() => setOpen(item.src)} aria-label={item.alt}>
                  <img src={item.src} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {shot ? (
        <div className="gallery-lightbox">
          <button
            type="button"
            className="gallery-scrim"
            aria-label="Close photo"
            onClick={() => setOpen(null)}
          />
          <figure>
            <img src={shot.src} alt={shot.alt} />
          </figure>
        </div>
      ) : null}
    </div>
  );
}
