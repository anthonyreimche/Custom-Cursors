// The drawable cursor art catalog.
//
// Every cursor is drawn in a 24x24 space (BASE), white with a thin black outline
// like a native OS cursor — the white fill reads on dark areas, the black outline
// reads on light ones. Filled glyphs are white fill + outline; fine reticles are
// a white stroke over a slightly wider black one. Art is stored as INNER markup
// so it can be rendered at any pixel size — see buildCursorSvg and the per-cursor
// scale in presets.ts.
//
// This is original art styled after the general photo-editor idiom — NOT copied
// from any app's proprietary cursors. Pan hands are offered but the OS hand stays
// the default; the crop resize arrows stay on native CSS cursors.

export type CursorRole =
  | "pick"
  | "pan"
  | "panning"
  | "zoom-in"
  | "zoom-out"
  | "crosshair"
  | "crop-move"
  | "crop-resize-nwse"
  | "crop-resize-nesw"
  | "crop-resize-ns"
  | "crop-resize-ew";

/** The coordinate space every cursor is drawn in. */
export const BASE = 24;

export interface ArtDef {
  label: string;
  /** Inner SVG markup (no <svg> wrapper), drawn in a 0 0 24 24 viewBox. */
  inner: string;
  hotspotX: number;
  hotspotY: number;
  /** Roles this art is offered for in the preferences UI. */
  roles: CursorRole[];
}

const NS = 'xmlns="http://www.w3.org/2000/svg"';

/** Wrap inner art as an SVG rendered at `size` px (the 24-space viewBox scales). */
export function buildCursorSvg(inner: string, size: number): string {
  const s = Math.max(1, Math.round(size));
  return `<svg ${NS} width="${s}" height="${s}" viewBox="0 0 ${BASE} ${BASE}">${inner}</svg>`;
}

// ── Drawing helpers ─────────────────────────────────────────────────────────
// Filled glyph: white body with a thin dark outline (no halo) — native-cursor look.
function filled(shape: string, w = 1.3): string {
  return `<g fill="#fff" stroke="#111" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${shape}</g>`;
}
/** Line art (crosshairs / reticles): a white stroke with a black outline — a wider
 *  black stroke under a narrower white core, so lines read white-with-outline. */
function lines(paths: string, outline = 3, coreW = 1.6): string {
  return (
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<g stroke="#111" stroke-width="${outline}">${paths}</g>` +
    `<g stroke="#fff" stroke-width="${coreW}">${paths}</g></g>`
  );
}
/** Plain dark detail strokes drawn on a white face (e.g. the loupe grid). */
function detail(paths: string, w = 0.8): string {
  return `<g fill="none" stroke="#111" stroke-width="${w}" stroke-linecap="round">${paths}</g>`;
}

// Eyedropper: a fat rounded bulb, thin barrel and fine tip, rotated to point
// down-left (the tip is the hotspot).
const DROP = '<rect x="8.6" y="2" width="6.8" height="4.8" rx="2.2"/><rect x="10.6" y="6.2" width="2.8" height="9.2" rx="1"/><path d="M10.6 14.8 L12 19.8 L13.4 14.8 Z"/>';
const DROPPER = `<g transform="rotate(45 12 12)">${filled(DROP)}</g>`;

export const ART: Record<string, ArtDef> = {
  // Eyedropper / colour picker ─────────────────────────────────────────────────
  dropper: { label: "Eyedropper", hotspotX: 6, hotspotY: 18, roles: ["pick"], inner: DROPPER },
  "dropper-plus": {
    label: "Eyedropper + (add)",
    hotspotX: 6,
    hotspotY: 18,
    roles: ["pick"],
    inner: DROPPER + lines(`<path d="M19.6 2.6V6"/><path d="M17.9 4.3H21.3"/>`, 2.6, 1.3),
  },
  "dropper-minus": {
    label: "Eyedropper − (subtract)",
    hotspotX: 6,
    hotspotY: 18,
    roles: ["pick"],
    inner: DROPPER + lines(`<path d="M17.9 4.3H21.3"/>`, 2.6, 1.3),
  },
  loupe: {
    label: "Loupe (pixel grid)",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["pick"],
    inner:
      lines(`<path d="M14.5 14.5 L20 20"/>`, 3.6, 2.4) +
      filled(`<rect x="3.5" y="3.5" width="12" height="12" rx="2.6"/>`) +
      detail(`<path d="M7.3 4.2V14.8"/><path d="M11.5 4.2V14.8"/><path d="M4.2 7.3H14.8"/><path d="M4.2 11.5H14.8"/>`, 0.7),
  },

  // Zoom ────────────────────────────────────────────────────────────────────────
  "magnifier-plus": {
    label: "Magnifier +",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-in"],
    inner: lines(`<circle cx="10" cy="10" r="6.3"/><path d="M14.6 14.6 L21 21"/><path d="M10 6.8V13.2"/><path d="M6.8 10H13.2"/>`, 3, 1.5),
  },
  "magnifier-minus": {
    label: "Magnifier −",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-out"],
    inner: lines(`<circle cx="10" cy="10" r="6.3"/><path d="M14.6 14.6 L21 21"/><path d="M6.8 10H13.2"/>`, 3, 1.5),
  },

  // Crosshair / target ────────────────────────────────────────────────────────
  "crosshair-thin": {
    label: "Crosshair",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair", "crop-move"],
    inner: lines(`<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`, 3, 1.4),
  },
  "crosshair-dot": {
    label: "Crosshair + dot",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair", "crop-move"],
    inner:
      lines(`<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`, 3, 1.6) +
      `<circle cx="12" cy="12" r="1.6" fill="#fff" stroke="#111" stroke-width="0.7"/>`,
  },
  reticle: {
    label: "Target ring",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair"],
    inner: lines(`<circle cx="12" cy="12" r="6"/><path d="M12 1V4"/><path d="M12 20V23"/><path d="M1 12H4"/><path d="M20 12H23"/>`, 3, 1.4),
  },

  // Move / crop ─────────────────────────────────────────────────────────────────
  move: {
    label: "Four-way move",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crop-move"],
    inner: lines(
      `<path d="M12 3V21"/><path d="M3 12H21"/><path d="M9 6l3-3 3 3"/><path d="M9 18l3 3 3-3"/><path d="M6 9l-3 3 3 3"/><path d="M18 9l3 3-3 3"/>`,
      2.8,
      1.4,
    ),
  },
  crop: {
    label: "Crop brackets",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crop-move", "crosshair"],
    inner: lines(`<path d="M8 3 V15 a1.5 1.5 0 0 0 1.5 1.5 H21"/><path d="M3 8 H14.5 a1.5 1.5 0 0 1 1.5 1.5 V21"/>`, 3, 1.6),
  },

  // Pan (hand) ────────────────────────────────────────────────────────────────
  hand: {
    label: "Open hand",
    hotspotX: 12,
    hotspotY: 11,
    roles: ["pan", "panning"],
    inner: filled(`<rect x="7" y="10" width="9" height="9" rx="3"/><rect x="7.6" y="6" width="2" height="6" rx="1"/><rect x="9.9" y="5" width="2" height="7" rx="1"/><rect x="12.1" y="5.2" width="2" height="7" rx="1"/><rect x="14.2" y="6.5" width="2" height="6" rx="1"/><rect x="5.3" y="10.5" width="2.3" height="5" rx="1.1"/>`),
  },
  grab: {
    label: "Closed hand",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pan", "panning"],
    inner: filled(`<rect x="7" y="10" width="9.5" height="8" rx="3.5"/><rect x="7.8" y="8" width="2" height="3.2" rx="1"/><rect x="10" y="7.6" width="2" height="3.6" rx="1"/><rect x="12.2" y="7.8" width="2" height="3.4" rx="1"/><rect x="14.2" y="8.4" width="2" height="3" rx="1"/>`),
  },
};

export type ArtKey = keyof typeof ART;

/** Encode inline SVG markup as a UTF-8 data URL (small + unicode-safe). */
export function svgToDataUrl(markup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

/** Re-size a user-supplied SVG by setting its width/height to `scale`× its base
 *  (parsed from viewBox, else width/height, else 24). For custom cursors. */
export function scaleCustomSvg(svg: string, scale: number): string {
  const vb = svg.match(/viewBox\s*=\s*"\s*[\d.+-]+\s+[\d.+-]+\s+([\d.]+)\s+([\d.]+)/);
  let bw = BASE;
  let bh = BASE;
  if (vb) {
    bw = parseFloat(vb[1]) || BASE;
    bh = parseFloat(vb[2]) || BASE;
  } else {
    const w = svg.match(/\bwidth\s*=\s*"([\d.]+)/);
    const hh = svg.match(/\bheight\s*=\s*"([\d.]+)/);
    if (w) bw = parseFloat(w[1]) || BASE;
    if (hh) bh = parseFloat(hh[1]) || BASE;
  }
  const tw = Math.max(1, Math.round(bw * scale));
  const th = Math.max(1, Math.round(bh * scale));
  let out = svg;
  out = /\bwidth\s*=\s*"/.test(out) ? out.replace(/\bwidth\s*=\s*"[^"]*"/, `width="${tw}"`) : out.replace(/<svg/, `<svg width="${tw}"`);
  out = /\bheight\s*=\s*"/.test(out) ? out.replace(/\bheight\s*=\s*"[^"]*"/, `height="${th}"`) : out.replace(/<svg/, `<svg height="${th}"`);
  return out;
}
