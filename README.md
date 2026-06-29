# Custom Cursors

Custom cursor icons for [Safelight](https://github.com/anthonyreimche/Safelight).

Safelight's default cursors are good, but everyone's muscle memory comes from a
different app. This extension lets you pick a cursor **preset** modelled on the
tool you already know — or override any single cursor (or all of them) with a
named icon or your own SVG — from its Preferences tab.

It restyles the cursors Safelight draws on the Develop canvas: the colour /
white-balance **picker**, **zoom in / out**, the **crosshair** (precise mode and
crop drawing), and the crop **move** cursor. Pan and the crop resize arrows stay
on the native OS cursors by default — every platform already renders a crisp hand
and resize arrows at any display scaling — but you can override those too.

## Presets

| Preset | Picker | Modelled on |
| --- | --- | --- |
| **Safelight** (default) | Sample ring | The shipped cursors |
| **Classic** | Eyedropper + sampling ring | Photoshop / GIMP |
| **Loupe Pro** | Eyedropper + magnified pixel-grid loupe | Lightroom / Affinity Photo |
| **Precise** | Crosshair with a centre dot | Technical / minimal |
| **Open-source RAW** | High-contrast plain eyedropper | darktable / RawTherapee |

Each preset also swaps the matching zoom, crosshair and move cursors so the set
feels coherent.

## Per-cursor overrides

Under the preset picker, each cursor has its own dropdown:

- **From preset** — follow whatever the chosen preset uses (the default).
- **System default** — Safelight's built-in cursor for that role.
- A **named icon** — any art that suits that cursor (e.g. the picker offers all
  five eyedropper styles).
- **Custom SVG…** — paste your own SVG and set its hotspot (the active click
  point, in the SVG's own pixel coordinates). Keep it small (≤ 32×32 renders
  best) and give it a white halo under a dark core so it stays visible on any
  photo.

Changes apply instantly. "Reset overrides" clears every per-cursor change while
keeping the selected preset.

## How it works

Safelight resolves canvas cursors through named **tokens** (`pick`, `zoom-in`,
`pan`, `crop-move`, …) via its cursor store. This extension re-registers those
token ids with its own images through `api.registerCursor`, so the new cursors
appear everywhere the core uses them — no core hooks required. The whole config
lives in one persisted setting and is re-applied on load and on change.

When the extension is disabled or uninstalled, Safelight restores its built-in
defaults for every token that was overridden.

## Build

```sh
npm install
npm run build      # bundles to dist/index.js (committed; the store fetches as-is)
npm run typecheck  # tsc, no emit
npm run smoke      # server-renders the Preferences panel across all presets
npm run contact    # writes contact.html — a visual sheet of every cursor + hotspot
npm run verify     # typecheck + smoke + build
```

React is provided by the host at runtime via `api.react`, so it is never bundled.

## Develop / test in the app

Extensions ▸ Dev ▸ Choose folder… and point it at this folder, then ↻ Reload the
row after each `npm run build`. The Preferences tab appears under
Settings ▸ Extensions ▸ Custom Cursors.

## License

MIT — see [LICENSE](LICENSE).
