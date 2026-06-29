// Dev-only render smoke test: server-render the Preferences panel across every
// preset and the custom-editor path to catch runtime (not just type) errors.

import * as React from "react";
import { renderToString } from "react-dom/server";
import { initRuntime } from "../src/runtime";
import { PreferencesPanel } from "../src/preferences";
import { PRESETS, ROLES } from "../src/presets";

const store: Record<string, unknown> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api: any = {
  react: React,
  settings: {
    get: (k: string, f: unknown) => (k in store ? store[k] : f),
    set: (k: string, v: unknown) => {
      store[k] = v;
    },
    onChange: () => () => {},
  },
  registerCursor: () => {},
  registerSettings: () => {},
  preferences: { open: () => {} },
};
initRuntime(api);

const render = () => renderToString(React.createElement(PreferencesPanel));

let html = render();
if (!html.includes("Custom") && !html.includes("preset")) {
  throw new Error("panel intro did not render");
}

for (const p of PRESETS) {
  store.config = JSON.stringify({ preset: p.id, overrides: {}, custom: {} });
  html = render();
}

const overrides: Record<string, string> = {};
const custom: Record<string, unknown> = {};
for (const r of ROLES) {
  overrides[r.role] = "custom";
  custom[r.role] = { svg: "", hotspotX: 1, hotspotY: 2 };
}
store.config = JSON.stringify({ preset: "classic", overrides, custom });
html = render();

console.log(`SMOKE OK — final render ${html.length} chars across ${PRESETS.length} presets + custom path`);
