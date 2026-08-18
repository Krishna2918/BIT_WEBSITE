import { createFileRoute, Link } from "@tanstack/react-router";
import { isOpaqueContinuationToken } from "@/lib/onboarding-contract";

type ContinuationSearch = { token?: string };

export const Route = createFileRoute("/consult_/continue")({
  validateSearch: (search: Record<string, unknown>): ContinuationSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ConsultationContinuation,
  head: () => ({
    meta: [
      { title: "Consultation continuation — BIT Solution" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ConsultationContinuation() {
  const { token } = Route.useSearch();
  const tokenShapeIsSafe = isOpaqueContinuationToken(token);

  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-xl px-5 py-20">
        <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Consultation
        </p>
        <h1 className="text-center text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
          {tokenShapeIsSafe ? "Continue your consultation" : "Continuation unavailable"}
        </h1>
        {tokenShapeIsSafe ? (
          <div
            className="mt-6 rounded-2xl border border-[var(--color-hairline)] bg-white p-6 text-center"
            data-continuation-state="staged-no-submit"
            aria-live="polite"
          >
            <p className="text-[16px] leading-relaxed text-muted">
              This secure continuation step is staged for an advisor’s review. It is not connected
              yet, so no information has been requested or sent.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              When the approved server binding is ready, this link will continue the same request
              without placing personal information or credentials in the address.
            </p>
          </div>
        ) : (
          <div
            className="mt-6 rounded-2xl border border-[var(--color-hairline)] bg-white p-6 text-center"
            data-continuation-state="unavailable"
            role="status"
            aria-live="polite"
          >
            <p className="text-[16px] leading-relaxed text-muted">
              This continuation link is missing or no longer available. No information was sent.
            </p>
          </div>
        )}
        <p className="mt-8 text-center">
          <Link to="/consult" className="text-link">
            Start a new consultation ›
          </Link>
        </p>
      </section>
    </main>
  );
}
