// Roles, presets, and the resolution that turns a saved config into concrete
// cursor contributions.
//
// A "role" is one of Safelight's built-in cursor tokens we can override (the same
// ids the core resolves via resolveCursorCss). A "preset" maps some roles to a
// catalog art; unmapped roles fall back to the system default. A per-role
// "override" (set by the user) wins over the preset for that one role.

import { ART, type ArtKey, type CursorRole } from "./cursors";

/** The shape we hand to api.registerCursor (mirrors the host's CursorContribution). */
export interface CursorContribution {
  id: string;
  css?: string;
  image?: string;
  hotspotX?: number;
  hotspotY?: number;
  fallback?: string;
}

// Every role we manage, in display order, with the CSS keyword each falls back to
// natively. `pick` has no native CSS cursor — its system default is the shipped
// "sample-ring" art — but it still falls back to "crosshair" if an image fails.
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
  label: string;
  hint?: string;
  group: "primary" | "advanced";
}

export const ROLES: RoleMeta[] = [
  { role: "pick", label: "Colour picker", hint: "White balance / colour sampling", group: "primary" },
  { role: "zoom-in", label: "Zoom in", group: "primary" },
  { role: "zoom-out", label: "Zoom out", group: "primary" },
  { role: "crosshair", label: "Crosshair", hint: "Precise mode / drawing a crop", group: "primary" },
  { role: "crop-move", label: "Move", hint: "Dragging the crop box", group: "primary" },
  { role: "pan", label: "Pan", hint: "Hand — drag the image around", group: "advanced" },
  { role: "panning", label: "Pan (dragging)", group: "advanced" },
  { role: "crop-resize-nwse", label: "Resize (↘↖)", group: "advanced" },
  { role: "crop-resize-nesw", label: "Resize (↙↗)", group: "advanced" },
  { role: "crop-resize-ns", label: "Resize (↕)", group: "advanced" },
  { role: "crop-resize-ew", label: "Resize (↔)", group: "advanced" },
];

export const ALL_ROLES: CursorRole[] = ROLES.map((r) => r.role);

export interface Preset {
  id: string;
  label: string;
  description: string;
  /** Roles this preset draws with custom art; everything else stays system. */
  map: Partial<Record<CursorRole, ArtKey>>;
}

export const PRESETS: Preset[] = [
  {
    id: "safelight",
    label: "Safelight (default)",
    description: "The shipped cursors — the sample-ring picker, system zoom and crop.",
    map: {},
  },
  {
    id: "classic",
    label: "Classic (Adobe-style)",
    description: "Eyedropper with a sampling ring, magnifier zoom, thin crosshair.",
    map: {
      pick: "pipette-ring",
      "zoom-in": "magnifier-plus",
      "zoom-out": "magnifier-minus",
      crosshair: "crosshair-thin",
      "crop-move": "move-4way",
    },
  },
  {
    id: "loupe",
    label: "Loupe Pro (Lightroom-style)",
    description: "Eyedropper with a magnified pixel-grid loupe at the sample point.",
    map: {
      pick: "pipette-loupe",
      "zoom-in": "magnifier-plus",
      "zoom-out": "magnifier-minus",
      crosshair: "crosshair-thin",
      "crop-move": "move-4way",
    },
  },
  {
    id: "precise",
    label: "Precise (technical)",
    description: "Fine crosshairs and ringed targets — never hides the pixel you hit.",
    map: {
      pick: "crosshair-pick",
      "zoom-in": "target-plus",
      "zoom-out": "target-minus",
      crosshair: "crosshair-thin",
      "crop-move": "move-4way",
    },
  },
  {
    id: "raw",
    label: "Open-source RAW (darktable-style)",
    description: "High-contrast plain eyedropper and a rounded crosshair; system zoom.",
    map: {
      pick: "pipette-plain",
      crosshair: "crosshair-rounded",
    },
  },
];

export const PRESET_IDS = PRESETS.map((p) => p.id);

/** A per-role choice: "preset" (follow the preset), "system" (built-in default),
 *  a catalog art key, or "custom" (the user's own SVG in config.custom). */
export type Choice = "preset" | "system" | "custom" | ArtKey;

export interface CustomArt {
  svg: string;
  hotspotX: number;
  hotspotY: number;
}

export interface Config {
  preset: string;
  overrides: Partial<Record<CursorRole, Choice>>;
  custom: Partial<Record<CursorRole, CustomArt>>;
}

export const DEFAULT_CONFIG: Config = { preset: "safelight", overrides: {}, custom: {} };

/** Tolerant parse of the persisted JSON blob — never throws, always returns a
 *  well-formed Config so a corrupt setting can't break activation. */
export function parseConfig(raw: unknown): Config {
  if (typeof raw !== "string" || raw.length === 0) return { ...DEFAULT_CONFIG };
  try {
    const o = JSON.parse(raw) as Partial<Config>;
    return {
      preset: typeof o.preset === "string" && PRESET_IDS.includes(o.preset) ? o.preset : "safelight",
      overrides: o.overrides && typeof o.overrides === "object" ? o.overrides : {},
      custom: o.custom && typeof o.custom === "object" ? o.custom : {},
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function presetById(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** The art a role resolves to under a config, as one of: "system", a catalog art
 *  key, or "custom". Resolves the "preset"/absent choice through the preset. */
export function resolvedChoice(role: CursorRole, config: Config): "system" | "custom" | ArtKey {
  const choice = config.overrides[role] ?? "preset";
  if (choice === "preset") return presetById(config.preset).map[role] ?? "system";
  return choice;
}

/** Build the concrete cursor contribution for a role under a config. */
export function resolveRole(role: CursorRole, config: Config): CursorContribution {
  const fallback = NATIVE_CSS[role];
  const choice = resolvedChoice(role, config);

  if (choice === "custom") {
    const c = config.custom[role];
    if (c && typeof c.svg === "string" && c.svg.includes("<svg")) {
      return { id: role, image: c.svg, hotspotX: c.hotspotX, hotspotY: c.hotspotY, fallback };
    }
    // Custom selected but nothing valid stored — fall through to system.
    return systemContribution(role);
  }

  if (choice === "system") return systemContribution(role);

  const art = ART[choice];
  if (!art) return systemContribution(role);
  return { id: role, image: art.svg, hotspotX: art.hotspotX, hotspotY: art.hotspotY, fallback };
}

/** The app's built-in spec for a role: the sample-ring image for `pick`, else the
 *  native CSS keyword. */
export function systemContribution(role: CursorRole): CursorContribution {
  if (role === "pick") {
    const a = ART["sample-ring"];
    return { id: "pick", image: a.svg, hotspotX: a.hotspotX, hotspotY: a.hotspotY, fallback: "crosshair" };
  }
  return { id: role, css: NATIVE_CSS[role] };
}

/** Every managed role resolved under a config — the full set to (re)register. */
export function resolveAll(config: Config): CursorContribution[] {
  return ALL_ROLES.map((role) => resolveRole(role, config));
}
