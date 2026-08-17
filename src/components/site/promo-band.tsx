import { Link } from "@tanstack/react-router";
import { ScrollVideo } from "@/components/site/scroll-video";

type PromoBandProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  video?: string;
  to: string;
  cta?: string;
  secondaryTo?: string;
  secondaryCta?: string;
  tone?: "light" | "muted" | "dark";
};

export function PromoBand({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  video,
  to,
  cta = "Learn more",
  secondaryTo,
  secondaryCta,
  tone = "light",
}: PromoBandProps) {
  const dark = tone === "dark";
  const surface =
    tone === "dark" ? "bg-band-dark text-band-dark-fg" : tone === "muted" ? "bg-bg-muted text-ink" : "bg-bg text-ink";
  const sub = dark ? "text-band-dark-muted" : "text-muted";

  return (
    <section className={`${surface} px-5 pb-10 pt-14 text-center sm:pt-16`}>
      {eyebrow ? (
        <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.14em] text-link">{eyebrow}</p>
      ) : null}
      <h2 className="text-[40px] font-semibold leading-none tracking-[-0.025em] sm:text-[56px]">{title}</h2>
      <p className={`mx-auto mt-3 max-w-xl text-[19px] leading-snug sm:text-[21px] ${sub}`}>{subtitle}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-[17px]">
        <Link to={to} className="text-link no-underline hover:underline">
          {cta} ›
        </Link>
        {secondaryTo && secondaryCta ? (
          <Link to={secondaryTo} className="text-link no-underline hover:underline">
            {secondaryCta} ›
          </Link>
        ) : null}
      </div>
      <div className="mx-auto mt-8 max-w-5xl">
        {video ? (
          <ScrollVideo src={video} poster={image} alt={imageAlt} className="mx-auto w-full max-w-4xl" />
        ) : (
          <img src={image} alt={imageAlt} className="mx-auto h-auto w-full max-w-4xl object-contain" />
        )}
      </div>
    </section>
  );
}

type TwinCardProps = {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  video?: string;
  to: string;
  tone?: "light" | "muted" | "dark";
};

export function TwinCard({
  title,
  subtitle,
  image,
  imageAlt,
  video,
  to,
  tone = "light",
}: TwinCardProps) {
  const dark = tone === "dark";
  const surface = dark ? "bg-band-dark text-band-dark-fg" : tone === "muted" ? "bg-bg-muted text-ink" : "bg-bg text-ink";
  const sub = dark ? "text-band-dark-muted" : "text-muted";

  return (
    <article className={`${surface} px-5 pb-8 pt-12 text-center`}>
      <h3 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[32px]">{title}</h3>
      <p className={`mx-auto mt-2 max-w-sm text-[16px] leading-snug ${sub}`}>{subtitle}</p>
      <div className="mt-3">
        <Link to={to} className="text-[16px] text-link no-underline hover:underline">
          Learn more ›
        </Link>
      </div>
      {video ? (
        <ScrollVideo src={video} poster={image} alt={imageAlt} className="mx-auto mt-6 w-full max-w-md" />
      ) : (
        <img src={image} alt={imageAlt} className="mx-auto mt-6 h-auto w-full max-w-md object-contain" />
      )}
    </article>
  );
}
