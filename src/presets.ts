// Roles, presets, scaling, and the resolution that turns a saved config into
// concrete cursor contributions — plus preset CRUD (save / rename / update /
// delete) and import/export.
//
// A "role" is a built-in cursor token we override. A "preset" (built-in or a
// user-saved one) maps roles to a catalog art; a per-role "override" wins over
// the preset; a per-role "scale" (falling back to a global default) sizes it.

import {
  ART,
  BASE,
  buildCursorSvg,
  scaleCustomSvg,
  type ArtKey,
  type CursorRole,
} from "./cursors";

/** The shape we hand to api.registerCursor (mirrors the host's CursorContribution). */
export interface CursorContribution {
  id: string;
  css?: string;
  image?: string;
  hotspotX?: number;
  hotspotY?: number;
  fallback?: string;
}

// Native CSS keyword each role falls back to. `pick` has no native cursor — its
// system default is the shipped "sample-ring" art — but still falls back here.
export const NATIVE_CSS: Record<CursorRole, string> = {
  pick: "crosshair",
  pan: "grab",
  panning: "grabbing",
  "zoom-in": "zoom-in",
  "zoom-out": "zoom-out",
  crosshair: "crosshair",
  "crop-move": "move",
  "crop-resize-nwse": "nwse-resize",
  "crop-resize-nesw": "nesw-resize",
  "crop-resize-ns": "ns-resize",
  "crop-resize-ew": "ew-resize",
};

export interface RoleMeta {
  role: CursorRole;
  hint?: string;
  group: "primary" | "advanced";
}

// Display names come from core (api.cursors.labels); this is the fallback only.
export const FALLBACK_LABELS: Record<CursorRole, string> = {
  pick: "Colour picker",
  "zoom-in": "Zoom in",
  "zoom-out": "Zoom out",
  crosshair: "Crosshair",
  "crop-move": "Move",
  pan: "Pan",
  panning: "Pan (dragging)",
  "crop-resize-nwse": "Resize (↖↘)",
  "crop-resize-nesw": "Resize (↗↙)",
  "crop-resize-ns": "Resize (↕)",
  "crop-resize-ew": "Resize (↔)",
};

export const ROLES: RoleMeta[] = [
  { role: "pick", hint: "White balance / colour sampling", group: "primary" },
  { role: "zoom-in", group: "primary" },
  { role: "zoom-out", group: "primary" },
  { role: "crosshair", hint: "Precise mode / drawing a crop", group: "primary" },
  { role: "crop-move", hint: "Dragging the crop box", group: "primary" },
  { role: "pan", hint: "Hand — drag the image around", group: "advanced" },
  { role: "panning", group: "advanced" },
  { role: "crop-resize-nwse", group: "advanced" },
  { role: "crop-resize-nesw", group: "advanced" },
  { role: "crop-resize-ns", group: "advanced" },
  { role: "crop-resize-ew", group: "advanced" },
];

export const ALL_ROLES: CursorRole[] = ROLES.map((r) => r.role);

export interface Preset {
  id: string;
  label: string;
  description: string;
  map: Partial<Record<CursorRole, ArtKey>>;
}

// Only a single built-in "Default" preset. Branded presets (Adobe / Lightroom /
// Capture One / darktable) were dropped: their real cursors are proprietary
// (Adobe, Capture One) or GPL-licensed (RawTherapee/GIMP) and can't be shipped
// here, and we won't misrepresent them with look-alikes. Users build their own
// presets from this art + custom SVGs.
export const PRESETS: Preset[] = [
  {
    id: "safelight",
    label: "Default",
    description: "A clean eyedropper, magnifier zoom, crosshair and move — the recommended set.",
    map: { pick: "dropper", "zoom-in": "magnifier-plus", "zoom-out": "magnifier-minus", crosshair: "crosshair-thin", "crop-move": "move" },
  },
];

export const PRESET_IDS = PRESETS.map((p) => p.id);

/** "preset" (follow the preset), "system" (built-in default), an art key, or
 *  "custom" (the user's own SVG in config.custom). */
export type Choice = "preset" | "system" | "custom" | ArtKey;

export interface CustomArt {
  svg: string;
  hotspotX: number;
  hotspotY: number;
}

// ── Scale ─────────────────────────────────────────────────────────────────────
// `scale` is a multiplier on the 24px art (1 = 24px). The default is well under
// 1 so cursors sit at a small native-cursor size rather than filling the box.
export const DEFAULT_SCALE = 0.6;
export const MIN_SCALE = 0.35;
export const MAX_SCALE = 2;

/** Bumped when a persisted config needs migrating. v2 reset the oversized v1
 *  default cursor size. */
export const CONFIG_VERSION = 2;

export function clampScale(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SCALE;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
}

// ── A user-saved preset ────────────────────────────────────────────────────────
export interface UserPreset {
  id: string;
  label: string;
  /** role → art key | "system" | "custom" (system entries are omitted). */
  map: Partial<Record<CursorRole, string>>;
  custom?: Partial<Record<CursorRole, CustomArt>>;
  scales?: Partial<Record<CursorRole, number>>;
  defaultScale?: number;
}

export interface Config {
  version: number;
  preset: string;
  overrides: Partial<Record<CursorRole, Choice>>;
  custom: Partial<Record<CursorRole, CustomArt>>;
  scales: Partial<Record<CursorRole, number>>;
  defaultScale: number;
  userPresets: UserPreset[];
}

export const DEFAULT_CONFIG: Config = {
  version: CONFIG_VERSION,
  preset: "safelight",
  overrides: {},
  custom: {},
  scales: {},
  defaultScale: DEFAULT_SCALE,
  userPresets: [],
};

function clone(c: Config): Config {
  return JSON.parse(JSON.stringify(c)) as Config;
}

// ── Parsing / validation ───────────────────────────────────────────────────────
function asObj<T>(v: unknown): T {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T);
}

function asScales(v: unknown): Partial<Record<CursorRole, number>> {
  const out: Partial<Record<CursorRole, number>> = {};
  const o = asObj<Record<string, unknown>>(v);
  for (const k of Object.keys(o)) {
    const n = Number(o[k]);
    if (Number.isFinite(n)) out[k as CursorRole] = clampScale(n);
  }
  return out;
}

export function isUserPresetShape(p: unknown): p is UserPreset {
  return (
    !!p &&
    typeof p === "object" &&
    typeof (p as UserPreset).label === "string" &&
    !!(p as UserPreset).map &&
    typeof (p as UserPreset).map === "object"
  );
}

function sanitizeUserPreset(p: UserPreset): UserPreset {
  return {
    id: typeof p.id === "string" ? p.id : genId(),
    label: String(p.label).slice(0, 80) || "Untitled",
    map: asObj(p.map),
    custom: asObj(p.custom),
    scales: asScales(p.scales),
    defaultScale: typeof p.defaultScale === "number" ? clampScale(p.defaultScale) : undefined,
  };
}

/** Tolerant parse — never throws, always returns a well-formed Config. */
export function parseConfig(raw: unknown): Config {
  if (typeof raw !== "string" || raw.length === 0) return clone(DEFAULT_CONFIG);
  try {
    const o = JSON.parse(raw) as Partial<Config>;
    const version = typeof o.version === "number" ? o.version : 1;
    // v1 baked in an oversized default cursor size; reset it to the current
    // default on upgrade. An explicit later change re-persists it as v2.
    const defaultScale = version < CONFIG_VERSION || typeof o.defaultScale !== "number" ? DEFAULT_SCALE : clampScale(o.defaultScale);
    return {
      version: CONFIG_VERSION,
      preset: typeof o.preset === "string" ? o.preset : "safelight",
      overrides: asObj(o.overrides),
      custom: asObj(o.custom),
      scales: asScales(o.scales),
      defaultScale,
      userPresets: Array.isArray(o.userPresets) ? o.userPresets.filter(isUserPresetShape).map(sanitizeUserPreset) : [],
    };
  } catch {
    return clone(DEFAULT_CONFIG);
  }
}

// ── Preset lookup ──────────────────────────────────────────────────────────────
export interface PresetView {
  id: string;
  label: string;
  description?: string;
  builtin: boolean;
  map: Partial<Record<CursorRole, string>>;
  custom?: Partial<Record<CursorRole, CustomArt>>;
  scales?: Partial<Record<CursorRole, number>>;
  defaultScale?: number;
}

/** Built-in presets first, then the user's, as a uniform list for the picker. */
export function allPresets(config: Config): PresetView[] {
  const builtin = PRESETS.map((p) => ({ id: p.id, label: p.label, description: p.description, builtin: true, map: p.map }));
  const user = config.userPresets.map((p) => ({ id: p.id, label: p.label, builtin: false, map: p.map, custom: p.custom, scales: p.scales, defaultScale: p.defaultScale }));
  return [...builtin, ...user];
}

export function getPreset(config: Config, id: string): PresetView | undefined {
  return allPresets(config).find((p) => p.id === id);
}

function activeMap(config: Config): Partial<Record<CursorRole, string>> {
  return getPreset(config, config.preset)?.map ?? {};
}

// ── Resolution ─────────────────────────────────────────────────────────────────
/** The art a role resolves to: "system", a catalog art key, or "custom". */
export function resolvedChoice(role: CursorRole, config: Config): "system" | "custom" | ArtKey {
  const override = config.overrides[role];
  if (override && override !== "preset") return override;
  return (activeMap(config)[role] as "custom" | ArtKey | undefined) ?? "system";
}

/** Effective scale for a role: its own override, else the global default. */
export function scaleFor(role: CursorRole, config: Config): number {
  return clampScale(config.scales[role] ?? config.defaultScale ?? DEFAULT_SCALE);
}

function imageContribution(role: CursorRole, art: { inner: string; hotspotX: number; hotspotY: number }, scale: number, fallback: string): CursorContribution {
  return {
    id: role,
    image: buildCursorSvg(art.inner, BASE * scale),
    hotspotX: Math.round(art.hotspotX * scale),
    hotspotY: Math.round(art.hotspotY * scale),
    fallback,
  };
}

/** The app's built-in spec for a role: the (scaled) sample-ring image for `pick`,
 *  else the native CSS keyword (which the OS sizes itself). */
export function systemContribution(role: CursorRole, scale = DEFAULT_SCALE): CursorContribution {
  if (role === "pick") return imageContribution("pick", ART["reticle"], scale, "crosshair");
  return { id: role, css: NATIVE_CSS[role] };
}

/** Build the concrete cursor contribution for a role under a config. */
export function resolveRole(role: CursorRole, config: Config): CursorContribution {
  const fallback = NATIVE_CSS[role];
  const choice = resolvedChoice(role, config);
  const scale = scaleFor(role, config);

  if (choice === "custom") {
    const c = config.custom[role];
    if (c && typeof c.svg === "string" && c.svg.includes("<svg")) {
      return { id: role, image: scaleCustomSvg(c.svg, scale), hotspotX: Math.round(c.hotspotX * scale), hotspotY: Math.round(c.hotspotY * scale), fallback };
    }
    return systemContribution(role, scale);
  }
  if (choice === "system") return systemContribution(role, scale);

  const art = ART[choice];
  if (!art) return systemContribution(role, scale);
  return imageContribution(role, art, scale, fallback);
}

/** Every managed role resolved under a config — the full set to (re)register. */
export function resolveAll(config: Config): CursorContribution[] {
  return ALL_ROLES.map((role) => resolveRole(role, config));
}

// ── Snapshots & dirty state ─────────────────────────────────────────────────────
interface Snapshot {
  map: Partial<Record<CursorRole, string>>;
  custom: Partial<Record<CursorRole, CustomArt>>;
  scales: Partial<Record<CursorRole, number>>;
  defaultScale: number;
}

/** Bake the current effective state into a snapshot (overrides folded into map). */
function snapshotFromConfig(config: Config): Snapshot {
  const map: Partial<Record<CursorRole, string>> = {};
  const custom: Partial<Record<CursorRole, CustomArt>> = {};
  for (const role of ALL_ROLES) {
    const c = resolvedChoice(role, config);
    if (c !== "system") map[role] = c;
    if (c === "custom" && config.custom[role]) custom[role] = config.custom[role];
  }
  return { map, custom, scales: { ...config.scales }, defaultScale: config.defaultScale };
}

function stable(s: Snapshot): string {
  const sort = (o: Record<string, unknown>) =>
    Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
  return JSON.stringify({ map: sort(s.map), custom: sort(s.custom), scales: sort(s.scales), defaultScale: s.defaultScale });
}

/** Has the current config drifted from its selected preset? */
export function isDirty(config: Config): boolean {
  const p = getPreset(config, config.preset);
  const cur = snapshotFromConfig(config);
  if (!p) return Object.keys(cur.map).length > 0;
  const base: Snapshot = { map: p.map, custom: p.custom ?? {}, scales: p.scales ?? {}, defaultScale: p.defaultScale ?? config.defaultScale };
  return stable(cur) !== stable(base);
}

export function activeIsUserPreset(config: Config): boolean {
  return config.userPresets.some((p) => p.id === config.preset);
}

// ── Mutations ───────────────────────────────────────────────────────────────────
function genId(): string {
  return `user-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** Select a preset: load its snapshot and clear per-role overrides. */
export function applyPreset(config: Config, id: string): Config {
  const p = getPreset(config, id);
  return {
    ...config,
    preset: id,
    overrides: {},
    custom: p?.custom ? { ...p.custom } : {},
    scales: p?.scales ? { ...p.scales } : {},
    defaultScale: p?.defaultScale ?? config.defaultScale,
  };
}

/** Save the current state as a new user preset and select it. */
export function saveAsPreset(config: Config, label: string): Config {
  const snap = snapshotFromConfig(config);
  const preset: UserPreset = { id: genId(), label: label.trim() || "Untitled", map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale };
  return { ...config, userPresets: [...config.userPresets, preset], preset: preset.id, overrides: {} };
}

/** Overwrite the active user preset with the current state (no-op for built-ins). */
export function updateActivePreset(config: Config): Config {
  const idx = config.userPresets.findIndex((p) => p.id === config.preset);
  if (idx < 0) return config;
  const snap = snapshotFromConfig(config);
  const userPresets = config.userPresets.slice();
  userPresets[idx] = { ...userPresets[idx], map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale };
  return { ...config, userPresets, overrides: {} };
}

export function renamePreset(config: Config, id: string, label: string): Config {
  return { ...config, userPresets: config.userPresets.map((p) => (p.id === id ? { ...p, label: label.trim() || p.label } : p)) };
}

export function deletePreset(config: Config, id: string): Config {
  const next = { ...config, userPresets: config.userPresets.filter((p) => p.id !== id) };
  return config.preset === id ? applyPreset(next, "safelight") : next;
}

// ── Import / export ─────────────────────────────────────────────────────────────
const EXPORT_TAG = "safelightCursorPresets";

/** Serialise presets to a shareable JSON string. */
export function exportPresets(presets: UserPreset[]): string {
  return JSON.stringify({ [EXPORT_TAG]: 1, presets }, null, 2);
}

/** Export the CURRENT state as a single named preset (for built-ins / tweaks). */
export function exportCurrent(config: Config, label: string): string {
  const snap = snapshotFromConfig(config);
  return exportPresets([{ id: genId(), label, map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale }]);
}

export interface ImportResult {
  config: Config;
  added: number;
  error?: string;
}

/** Parse exported JSON and append the presets it contains as new user presets. */
export function importPresets(config: Config, json: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { config, added: 0, error: "That doesn't look like valid JSON." };
  }
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === "object" && Array.isArray((data as { presets?: unknown[] }).presets)) list = (data as { presets: unknown[] }).presets;
  else if (isUserPresetShape(data)) list = [data];

  const valid = list.filter(isUserPresetShape).map((p) => ({ ...sanitizeUserPreset(p), id: genId() }));
  if (!valid.length) return { config, added: 0, error: "No cursor presets found in that data." };
  return { config: { ...config, userPresets: [...config.userPresets, ...valid] }, added: valid.length };
}
