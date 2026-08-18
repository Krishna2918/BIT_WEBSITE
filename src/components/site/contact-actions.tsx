import { SITE } from "@/lib/site";

export function ContactActions({ source }: { source: string }) {
  return (
    <div className="cta-pair justify-start">
      <a
        href={SITE.phoneHref}
        className="cta-book"
        aria-label={`Call BIT Solution from ${source}`}
      >
        Call {SITE.phoneDisplay}
      </a>
    </div>
  );
}
