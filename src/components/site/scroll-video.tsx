import { useEffect, useRef } from "react";

type ScrollVideoProps = {
  src: string;
  poster: string;
  alt: string;
  className?: string;
};

export function ScrollVideo({ src, poster, alt, className = "" }: ScrollVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let ready = false;
    let raf = 0;
    let shown = 0;
    let target = 0;

    const readTarget = () => {
      if (!ready || !video.duration) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.88;
      const end = vh * 0.12 - rect.height;
      const t = (start - rect.top) / Math.max(1, start - end);
      target = Math.max(0, Math.min(1, t)) * Math.max(0, video.duration - 0.08);
    };

    const tick = () => {
      shown += (target - shown) * 0.16;
      if (Math.abs(video.currentTime - shown) > 0.02) {
        try {
          video.currentTime = shown;
        } catch {
          /* seeking mid-load */
        }
      }
      if (Math.abs(target - shown) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      readTarget();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMeta = () => {
      ready = true;
      video.pause();
      kick();
    };

    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="mx-auto h-auto w-full object-contain"
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      />
    </div>
  );
}
