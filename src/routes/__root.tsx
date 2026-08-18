import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { TrackingHooks } from "@/components/site/tracking";
import { CookieConsent } from "@/components/site/cookie-consent";
import { AskAiChat, HelpSheet } from "@/components/site/ask-ai";
import { SITE, SITE_INDEXABLE } from "@/lib/site";
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
      <CookieConsent />
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
          <SiteFooter compact={path === "/consult"} />
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
      { name: "theme-color", content: "#161617" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "robots",
        content: SITE_INDEXABLE ? "index,follow" : "noindex,nofollow,noarchive",
      },
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
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/brand-icons/bit-mark-v20260818.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/brand-icons/bit-mark-v20260818-32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/brand-icons/bit-mark-v20260818-16.png",
      },
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/brand-icons/bit-mark-v20260818.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/brand-icons/bit-mark-v20260818-180.png",
      },
      { rel: "manifest", href: "/site-v20260818.webmanifest" },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: SITE.name,
          telephone: SITE.phoneTel,
          email: SITE.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "373 Steeles Ave W",
            addressLocality: "Brampton",
            addressRegion: "ON",
            postalCode: "L6Y 0P8",
            addressCountry: "CA",
          },
          url: SITE.url,
          description: SITE.positioning,
        }),
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-ink">
        <RootChrome />
        <Scripts />
      </body>
    </html>
  ),
});
