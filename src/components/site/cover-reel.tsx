import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { INDUSTRIES } from "@/data/industries";

const ROWS = 2;
const COLS = 8;
const GAP = 8;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function rowOf(index: number) {
  return INDUSTRIES.slice(index * COLS, index * COLS + COLS);
}

export function CoverReel() {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [stageW, setStageW] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = () => {
      const el = pinRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const h = el.offsetHeight;
        const view = window.innerHeight;
        const total = Math.max(1, h - view);
        const raw = clamp((window.scrollY - top) / total, 0, 1);
        const w = el.querySelector(".cover-stage")?.clientWidth ?? 1200;
        const visibleNow = w < 720 ? 1 : 2;
        const steps = COLS - visibleNow;
        const t = clamp((raw - 0.02) / 0.98, 0, 1);
        setShift(t * steps);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const visible = stageW > 0 && stageW < 720 ? 1 : 2;
  const cardW = stageW
    ? Math.floor((stageW - GAP * (visible - 1)) / visible)
    : 0;
  const tx = -shift * (cardW + GAP);

  return (
    <section id="sectors" className="cover-wrap">
      {reduce ? (
        <>
          <div className="cover-reel-copy">
            <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link sm:text-[15px]">
              Who we cover
            </p>
            <h2 className="text-center text-[clamp(1.55rem,5.2vw,2.75rem)] font-semibold tracking-[-0.03em]">
              One team. Every kind of floor.
            </h2>
            <p className="mx-auto mt-2 max-w-xl px-1 text-center text-[15px] leading-snug sm:text-[16px]">
              From Brampton HQ across all of Ontario.
            </p>
          </div>
          <ul className="cover-static-grid">
            {INDUSTRIES.map((item) => (
              <li key={item.slug}>
                <CoverCard item={item} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div ref={pinRef} className="cover-reel">
          <div className="cover-reel-sticky">
            <div className="cover-reel-copy">
              <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link sm:text-[15px]">
                Who we cover
              </p>
              <h2 className="text-center text-[clamp(1.55rem,5.2vw,2.75rem)] font-semibold tracking-[-0.03em]">
                One team. Every kind of floor.
              </h2>
              <p className="mx-auto mt-2 max-w-xl px-1 text-center text-[15px] leading-snug sm:text-[16px]">
                From Brampton HQ across all of Ontario.
              </p>
            </div>
            <div
              ref={stageRef}
              className="cover-stage cover-stage-stack"
              aria-live="polite"
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const items = rowOf(row);
                return (
                  <div key={row} className="cover-row">
                    <div
                      className="cover-track"
                      style={{
                        gap: GAP,
                        transform: cardW
                          ? `translate3d(${tx}px, 0, 0)`
                          : undefined,
                      }}
                    >
                      {items.map((item) => (
                        <CoverCard
                          key={item.slug}
                          item={item}
                          width={cardW || undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="cover-dots" aria-hidden>
                {Array.from({ length: COLS - visible + 1 }, (_, i) => (
                  <span
                    key={i}
                    className={i === Math.round(shift) ? "cover-dot cover-dot-on" : "cover-dot"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CoverCard({
  item,
  width,
}: {
  item: (typeof INDUSTRIES)[number];
  width?: number;
}) {
  return (
    <Link
      to="/industries/$slug"
      params={{ slug: item.slug }}
      className="cover-card"
      style={width ? { width, flex: `0 0 ${width}px` } : undefined}
    >
      <img src={item.image} alt={item.imageAlt} />
      <div className="cover-card-meta">
        <p className="cover-card-kicker">{item.compliance.join(" · ")}</p>
        <h3>{item.name}</h3>
        <p>{item.line}</p>
        <span>
          See how BIT runs it <span aria-hidden>›</span>
        </span>
      </div>
    </Link>
  );
}
