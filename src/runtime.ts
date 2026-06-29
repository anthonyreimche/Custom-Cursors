// Shared runtime state: the host api + React, plus the config read/write/apply
// helpers used by both the entry point and the preferences UI.

import type { SafelightAPI } from "./safelight";
import { parseConfig, resolveAll, FALLBACK_LABELS, type Config } from "./presets";
import type { CursorRole } from "./cursors";

// Assigned once in activate(), before any cursor is applied or any UI renders.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let api: SafelightAPI = null as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let React: any = null;

/** Single settings key holding the whole config as JSON. */
export const CONFIG_KEY = "config";

export function initRuntime(_api: SafelightAPI): void {
  api = _api;
  React = _api.react;
}

/** JSX factory for the `h(...)` call style (no JSX syntax, so no transform). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function h(type: any, props?: any, ...children: any[]): any {
  return React.createElement(type, props, ...children);
}

/** A cursor's display name, sourced from the core (api.cursors.labels) so it
 *  matches the rest of the app; falls back to our own copy on older app builds. */
export function cursorLabel(role: CursorRole): string {
  return api?.cursors?.labels?.[role] ?? FALLBACK_LABELS[role] ?? role;
}

/** Whether the host ships the shared UI kit. Cursor application works without it;
 *  only the Preferences panel needs it. */
export function hasUi(): boolean {
  return !!api?.ui;
}

/** The shared UI kit (Button, Select, Field, …). Only call once hasUi() is true. */
export function getUi(): NonNullable<SafelightAPI["ui"]> {
  const ui = api.ui;
  if (!ui) throw new Error("Custom Cursors requires a newer Safelight build (api.ui).");
  return ui;
}

export function getConfig(): Config {
  return parseConfig(api.settings.get<string>(CONFIG_KEY, ""));
}

export function saveConfig(config: Config): void {
  api.settings.set(CONFIG_KEY, JSON.stringify(config));
  // Apply right away so the change is instant; the settings.onChange subscription
  // in index.ts also re-applies (e.g. when edited from another window).
  applyCursors(config);
}

/** (Re)register every managed cursor token for the given config. Registering all
 *  of them — including the ones that resolve to a native CSS keyword — keeps the
 *  registry fully determined, so switching presets cleanly replaces prior art. */
export function applyCursors(config: Config): void {
  for (const contribution of resolveAll(config)) api.registerCursor(contribution);
}
