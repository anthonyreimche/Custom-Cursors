// Dev-only render smoke test: server-render the Preferences panel across every
// preset and the custom-editor path to catch runtime (not just type) errors.

import * as React from "react";
import { renderToString } from "react-dom/server";
import { initRuntime } from "../src/runtime";
import { PreferencesPanel } from "../src/preferences";
import { PRESETS, ROLES } from "../src/presets";
import { makeFakeApi } from "./test-harness";

const { api, store } = makeFakeApi(React);
initRuntime(api);

const render = () => renderToString(React.createElement(PreferencesPanel));

let html = render();
if (!html.includes("preset") && !html.includes("Colour")) {
  throw new Error("panel did not render");
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
