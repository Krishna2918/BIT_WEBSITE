import { useEffect, useRef } from "react";
import { easeInOut, getProgress, getSpin, subscribeProgress } from "@/lib/hero-scroll";

export function LogoSpread() {
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = () => {
      const el = mark.current;
      if (!el) return;
      const p = getProgress();
      const t = easeInOut(Math.min(1, p / 0.32));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const start = Math.min(vw, vh) * 0.4;
      const end = Math.min(vw, vh) * 0.2;
      const size = start + (end - start) * t;
      const x0 = 50;
      const y0 = 16;
      const x1 = 100 - ((end / 2 + Math.min(vw, 1600) * 0.035) / vw) * 100;
      const y1 = ((end / 2 + Math.min(vh, 1200) * 0.04) / vh) * 100;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const spin = getSpin();

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      el.style.transform = `translate3d(-50%, -50%, 0) rotateY(${spin}deg)`;
    };
    apply();
    window.addEventListener("resize", apply);
    const unsub = subscribeProgress(apply);
    return () => {
      window.removeEventListener("resize", apply);
      unsub();
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ perspective: "1800px", perspectiveOrigin: "50% 30%" }}
    >
      <div
        ref={mark}
        className="absolute aspect-square"
        style={{
          left: "50%",
          top: "16%",
          width: "min(40vmin, 360px)",
          height: "min(40vmin, 360px)",
          transform: "translate3d(-50%, -50%, 0)",
          transformStyle: "preserve-3d",
          willChange: "transform, left, top, width, height",
          filter: "drop-shadow(0 16px 26px rgba(80, 150, 210, 0.14))",
        }}
      >
        <img
          src="/images/bit-glass-cut.png"
          alt="BIT"
          draggable={false}
          className="h-full w-full select-none object-contain"
        />
      </div>
    </div>
  );
}
