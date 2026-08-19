import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { TrackingHooks } from "@/components/site/tracking";
import { AskAiChat, HelpSheet } from "@/components/site/ask-ai";
import { SITE } from "@/lib/site";
import { organizationJsonLd, robotsContent } from "@/lib/seo";
import appCss from "../styles.css?url";

const APP_NAME = "BIT Solution";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

function RootChrome() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isolated =
    path.startsWith("/fleet-operations") || path.startsWith("/dental-it");
  return (
    <>
      <TrackingHooks />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {isolated ? (
        <Outlet />
      ) : (
        <>
          <SiteNav />
          <div id="main">
            <Outlet />
          </div>
          <SiteFooter />
          <HelpSheet />
          <AskAiChat />
        </>
      )}
    </>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content: `${SITE.positioning} ${SITE.tagline} Across all of Ontario.`,
      },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#041627" },
      { name: "robots", content: robotsContent() },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: APP_NAME },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <RootChrome />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
