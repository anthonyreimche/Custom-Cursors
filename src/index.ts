// Custom Cursors — Safelight extension (MIT).
//
// Replaces Safelight's cursor icons with a chosen preset (Classic / Loupe Pro /
// Precise / Open-source RAW), and lets the user override any single cursor — or
// supply their own SVG — from the extension's Preferences tab.
//
// How it works: Safelight resolves canvas cursors through named tokens ("pick",
// "zoom-in", "pan", "crop-move", …). Re-registering those token ids with our own
// images swaps the cursors everywhere the core uses them — no core hooks needed.
// See cursors.ts for the art, presets.ts for the mapping, preferences.ts for UI.

import type { SafelightAPI } from "./safelight";
import { initRuntime, applyCursors, getConfig, CONFIG_KEY } from "./runtime";
import { PreferencesPanel } from "./preferences";

export function activate(api: SafelightAPI): void {
  initRuntime(api);

  // Apply the saved (or default) cursor set on load.
  applyCursors(getConfig());

  api.registerSettings({
    title: "Custom Cursors",
    keywords: ["cursor", "cursors", "pointer", "eyedropper", "picker", "crosshair", "icon", "theme"],
    fields: [],
    component: PreferencesPanel,
  });

  // Re-apply whenever the config changes (including edits from another window).
  api.settings.onChange((key) => {
    if (key === CONFIG_KEY) applyCursors(getConfig());
  });
}

export function deactivate(): void {
  // Nothing to undo by hand: the host sweeps our cursor registrations on unload,
  // and the core restores its built-in default for every token we overrode.
}
