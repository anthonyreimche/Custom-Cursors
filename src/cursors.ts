// The drawable cursor art catalog.
//
// Every cursor is a 24x24 SVG drawn with a "dual stroke": a fat white halo under
// a thin dark core, so the shape stays legible over any photo — bright sky, mid
// grey, or deep shadow alike. This mirrors Safelight's own built-in cursors.
//
// We deliberately ship art only for the cursors where a custom drawing beats the
// OS default: the colour picker, the zoom magnifiers, the crosshairs, and the
// move target. Pan (hand) and the crop resize arrows are left on the native CSS
// cursors — every OS already renders a crisp open/closed hand and resize arrows
// at any display scaling, and a hand-drawn 24px hand only looks worse.

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

export interface ArtDef {
  /** Human label shown in the override dropdown. */
  label: string;
  /** Inline <svg…> markup, ready for api.registerCursor({ image }). */
  svg: string;
  /** The active point, in the SVG's own 24x24 pixel space. */
  hotspotX: number;
  hotspotY: number;
  /** Which roles this art is offered for in the preferences UI. */
  roles: CursorRole[];
}

const NS = 'xmlns="http://www.w3.org/2000/svg"';

/** Wrap inner markup as a 24x24 cursor SVG. */
function svg(inner: string): string {
  return `<svg ${NS} width="24" height="24" viewBox="0 0 24 24">${inner}</svg>`;
}

/** Stroke art: draw the same path set twice — a white halo, then a dark core. */
function outlined(paths: string, halo = 3, core = 1.4): string {
  return (
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<g stroke="#fff" stroke-width="${halo}">${paths}</g>` +
    `<g stroke="#111" stroke-width="${core}">${paths}</g>` +
    `</g>`
  );
}

/** Filled art (e.g. a pipette bulb): a white body + halo, then a dark outline. */
function filled(shape: string, core = 1.3): string {
  return (
    `<g stroke-linejoin="round" stroke-linecap="round">` +
    `<g fill="#fff" stroke="#fff" stroke-width="2.6">${shape}</g>` +
    `<g fill="#fff" stroke="#111" stroke-width="${core}">${shape}</g>` +
    `</g>`
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────

// A pipette pointing down-left: a slim barrel up to a diamond bulb at top-right.
// The sample point is the barrel's bottom tip near (5,19).
const DROPPER_BARREL = `<path d="M5 19 L15 9"/>`;
const DROPPER_BULB = `<path d="M16.5 4.5 l3 3 l-3 3 l-3 -3 z"/>`;

// ── The catalog ──────────────────────────────────────────────────────────────

export const ART: Record<string, ArtDef> = {
  // Picker / white-balance cursors ────────────────────────────────────────────
  "sample-ring": {
    label: "Sample ring (Safelight)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick"],
    svg: svg(
      outlined(
        `<circle cx="12" cy="12" r="6"/>` +
          `<path d="M12 1V4"/><path d="M12 20V23"/><path d="M1 12H4"/><path d="M20 12H23"/>`,
        3,
        1.4,
      ),
    ),
  },

  "pipette-ring": {
    label: "Eyedropper + ring (Classic)",
    hotspotX: 5,
    hotspotY: 19,
    roles: ["pick"],
    svg: svg(
      outlined(`<circle cx="5" cy="19" r="2.9"/>`, 3, 1.3) +
        outlined(DROPPER_BARREL, 3, 1.4) +
        filled(DROPPER_BULB, 1.3),
    ),
  },

  "pipette-loupe": {
    label: "Eyedropper + loupe (Loupe Pro)",
    hotspotX: 5,
    hotspotY: 19,
    roles: ["pick"],
    svg: svg(
      // Magnified pixel-grid loupe sitting on the sample point.
      filled(`<rect x="2.3" y="16.3" width="6.4" height="6.4" rx="1.3"/>`, 1.2) +
        outlined(
          `<path d="M4.4 16.5 V22.5"/><path d="M6.6 16.5 V22.5"/>` +
            `<path d="M2.5 18.6 H8.5"/><path d="M2.5 20.7 H8.5"/>`,
          0,
          0.8,
        ) +
        outlined(`<path d="M8 16 L15 9"/>`, 3, 1.4) +
        filled(DROPPER_BULB, 1.3),
    ),
  },

  "crosshair-pick": {
    label: "Crosshair + dot (Precise)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick"],
    svg: svg(
      outlined(
        `<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`,
        3,
        1.4,
      ) +
        // The dot marks the exact sampled pixel at the centre.
        `<circle cx="12" cy="12" r="1.7" fill="#fff"/><circle cx="12" cy="12" r="0.95" fill="#111"/>`,
    ),
  },

  "pipette-plain": {
    label: "Plain eyedropper (RAW)",
    hotspotX: 3,
    hotspotY: 21,
    roles: ["pick"],
    svg: svg(
      outlined(`<path d="M3 21l5-5"/>`, 3.5, 1.5) +
        filled(`<path d="M8 16l9-9 3 3-9 9-4 1z"/>`, 1.5),
    ),
  },

  // Zoom cursors ───────────────────────────────────────────────────────────────
  "magnifier-plus": {
    label: "Magnifier +",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-in"],
    svg: svg(
      outlined(
        `<circle cx="10" cy="10" r="6.4"/><path d="M15 15 L21.5 21.5"/>` +
          `<path d="M10 6.8 V13.2"/><path d="M6.8 10 H13.2"/>`,
        3,
        1.5,
      ),
    ),
  },

  "magnifier-minus": {
    label: "Magnifier −",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-out"],
    svg: svg(
      outlined(
        `<circle cx="10" cy="10" r="6.4"/><path d="M15 15 L21.5 21.5"/>` +
          `<path d="M6.8 10 H13.2"/>`,
        3,
        1.5,
      ),
    ),
  },

  "target-plus": {
    label: "Target + (Precise)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["zoom-in"],
    svg: svg(
      outlined(
        `<circle cx="12" cy="12" r="7"/><path d="M12 7.5 V16.5"/><path d="M7.5 12 H16.5"/>`,
        3,
        1.4,
      ),
    ),
  },

  "target-minus": {
    label: "Target − (Precise)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["zoom-out"],
    svg: svg(
      outlined(`<circle cx="12" cy="12" r="7"/><path d="M7.5 12 H16.5"/>`, 3, 1.4),
    ),
  },

  // Crosshair cursors ───────────────────────────────────────────────────────────
  "crosshair-thin": {
    label: "Thin crosshair",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crosshair", "crop-move"],
    svg: svg(
      outlined(
        `<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`,
        3,
        1.4,
      ),
    ),
  },

  "crosshair-rounded": {
    label: "Rounded crosshair (RAW)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crosshair", "crop-move"],
    svg: svg(
      outlined(
        `<path d="M12 3V9.5"/><path d="M12 14.5V21"/><path d="M3 12H9.5"/><path d="M14.5 12H21"/>`,
        4,
        2.2,
      ),
    ),
  },

  // Move cursor ──────────────────────────────────────────────────────────────────
  "move-4way": {
    label: "Four-way move",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crop-move"],
    svg: svg(
      outlined(
        `<path d="M12 3 V21"/><path d="M3 12 H21"/>` +
          `<path d="M9 6 l3 -3 l3 3"/><path d="M9 18 l3 3 l3 -3"/>` +
          `<path d="M6 9 l-3 3 l3 3"/><path d="M18 9 l3 3 l-3 3"/>`,
        2.8,
        1.4,
      ),
    ),
  },
};

export type ArtKey = keyof typeof ART;

/** Encode inline SVG markup as a UTF-8 data URL (no base64 — keeps it small and
 *  avoids btoa's unicode pitfalls). Used both as the cursor image and for the
 *  previews drawn in the preferences UI. */
export function svgToDataUrl(markup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}
