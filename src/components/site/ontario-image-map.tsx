import { useEffect, useMemo, useState } from "react";
import {
  CITY_LABELS,
  HQ,
  ONTARIO_MEDIA,
  ONTARIO_POINTS,
  project,
  randomPointInOntario,
  type MapMedia,
} from "@/data/ontario-images";

type Floater = {
  id: number;
  media: MapMedia;
  x: number;
  y: number;
};

const MAX_LIVE = 5;
const MAX_VIDEO = 2;

export function OntarioImageMap() {
  const [live, setLive] = useState<Floater[]>([]);
  const [reduce, setReduce] = useState(false);

  const path = useMemo(
    () => ONTARIO_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z",
    [],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce) {
      setLive(
        CITY_LABELS.slice(0, 4).map((city, i) => {
          const p = project(city.lng, city.lat);
          return { id: i + 1, media: ONTARIO_MEDIA[i % ONTARIO_MEDIA.length], x: p.x, y: p.y };
        }),
      );
      return;
    }

    let id = 1;
    const timeouts: number[] = [];
    const spawn = () => {
      const thisId = id++;
      setLive((prev) => {
        const videos = prev.filter((f) => f.media.kind === "video").length;
        const pool =
          videos >= MAX_VIDEO ? ONTARIO_MEDIA.filter((m) => m.kind === "image") : ONTARIO_MEDIA;
        const used = new Set(prev.map((f) => f.media.src));
        const fresh = pool.filter((m) => !used.has(m.src));
        const pick = fresh.length ? fresh : pool;
        const media = pick[Math.floor(Math.random() * pick.length)];
        const spot = randomPointInOntario();
        return [...prev, { id: thisId, media, x: spot.x, y: spot.y }];
      });
      timeouts.push(
        window.setTimeout(() => {
          setLive((prev) => prev.filter((f) => f.id !== thisId));
        }, 6800),
      );
    };

    spawn();
    const timer = window.setInterval(spawn, 1500);
    return () => {
      window.clearInterval(timer);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [reduce]);

  return (
    <div className="ontario-stage">
      <div className={reduce ? "ontario-drift ontario-drift-static" : "ontario-drift"}>
        <svg
          className="ontario-svg"
          viewBox="0 0 1000 1180"
          role="img"
          aria-label="Flat map of Ontario"
        >
          <path className="ontario-land" d={path} />
          <circle className="ontario-hq" cx={HQ.x} cy={HQ.y} r="7" />
          {CITY_LABELS.map((city) => {
            const p = project(city.lng, city.lat);
            return (
              <g key={city.name} className="ontario-city">
                <circle cx={p.x} cy={p.y} r="3.2" />
                <text x={p.x + 8} y={p.y + 4}>
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>

        {live.map((item) => (
          <article
            key={item.id}
            className="ontario-card"
            style={{ left: `${(item.x / 1000) * 100}%`, top: `${(item.y / 1180) * 100}%` }}
          >
            {item.media.kind === "video" ? (
              <video autoPlay muted loop playsInline preload="metadata" aria-hidden>
                <source src={item.media.src} type="video/mp4" />
              </video>
            ) : (
              <img src={item.media.src} alt="" />
            )}
            <p>{item.media.label}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
