import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => pageHead("/login"),
});

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-white p-6 text-zinc-900">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              className="w-full rounded-md border border-zinc-200 px-4 py-2.5 text-sm hover:bg-zinc-50"
            >
              Continue with {p.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
