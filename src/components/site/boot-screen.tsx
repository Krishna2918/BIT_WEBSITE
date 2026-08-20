import { useEffect, useState, type ReactNode } from "react";

const PRELOAD = [
  "/images/bit-mark-official.png",
  "/images/bit-lockup-official.png",
];

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function BootGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bit-boot") === "1") {
      setReady(true);
      void import("@/components/globe/globe-scene");
      return;
    }
    let gone = false;
    const start = performance.now();
    const reveal = () => {
      if (gone) return;
      gone = true;
      const wait = Math.max(0, 280 - (performance.now() - start));
      window.setTimeout(() => {
        sessionStorage.setItem("bit-boot", "1");
        setReady(true);
      }, wait);
    };
    void Promise.all([
      ...PRELOAD.map(preload),
      import("@/components/globe/globe-scene").then(() => undefined).catch(() => undefined),
    ]).then(reveal);
    const cap = window.setTimeout(reveal, 1100);
    return () => {
      gone = true;
      window.clearTimeout(cap);
    };
  }, []);

  return (
    <>
      {ready ? null : (
        <div className="boot-screen" role="status" aria-live="polite" aria-label="Loading BIT Solution">
          <img src="/images/bit-mark-official.png" alt="" width={48} height={48} />
          <p>BIT Solution</p>
          <span className="boot-bar" />
        </div>
      )}
      <div className={ready ? "bit-app is-on" : "bit-app"} aria-hidden={ready ? undefined : true}>
        {children}
      </div>
    </>
  );
}
