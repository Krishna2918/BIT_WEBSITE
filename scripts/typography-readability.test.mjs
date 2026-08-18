import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("global type scale keeps readable mobile and desktop baselines", () => {
  const css = read("src/styles.css");

  assert.match(css, /body\s*\{[^}]*font-size:\s*1rem;[^}]*line-height:\s*1\.62;/su);
  assert.match(
    css,
    /@media \(min-width: 768px\)[\s\S]*?body\s*\{[^}]*font-size:\s*1\.125rem;[^}]*line-height:\s*1\.62;/u,
  );
  assert.match(css, /h1\s*\{[^}]*font-size:\s*clamp\(/su);
  assert.match(css, /h2\s*\{[^}]*font-size:\s*clamp\(/su);
  assert.match(css, /h3\s*\{[^}]*font-size:\s*clamp\(/su);
  assert.match(css, /button,[\s\S]*?input,[\s\S]*?select,[\s\S]*?textarea\s*\{\s*font-size:\s*1rem;/u);
  assert.match(css, /\[class~="text-\[12px\]"\]\s*\{\s*font-size:\s*0\.875rem;/u);
  assert.match(css, /\[class~="text-\[15px\]"\],[\s\S]*?font-size:\s*1rem;/u);
});

test("Ask AI and shared footer use readable controls and link grids", () => {
  const css = read("src/styles.css");
  const footer = read("src/components/site/site-footer.tsx");
  const nav = read("src/components/site/site-nav.tsx");

  assert.match(css, /\.ask-ai-msg,[\s\S]*?\.ask-ai-form input,[\s\S]*?font-size:\s*1rem !important;/u);
  assert.match(css, /\.help-lead,[\s\S]*?\.help-row strong,[\s\S]*?font-size:\s*1rem !important;/u);
  assert.match(css, /\.help-body\s*\{[^}]*overflow-y:\s*auto;/su);
  assert.match(css, /\.ask-ai-consent label,[\s\S]*?font-size:\s*0\.875rem;/u);
  assert.match(css, /\.site-footer-nav\s*\{[^}]*grid-template-columns:\s*1fr;/su);
  assert.match(css, /\.site-footer-nav,[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/u);
  assert.match(css, /\.site-footer-nav\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/su);
  assert.match(css, /\.site-footer-nav a,[\s\S]*?min-height:\s*2\.75rem;/u);
  assert.match(css, /\.site-footer-nav a,[\s\S]*?font-size:\s*1rem;/u);
  assert.match(footer, /className="site-footer-contact"/u);
  assert.match(footer, /className="site-footer-nav"/u);
  assert.match(footer, /className="site-footer-sectors"/u);
  assert.match(footer, /className="site-footer-legal"/u);
  assert.match(nav, /text-\[16px\]/u);
});
