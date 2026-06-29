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

The extension ships a single built-in **Default** preset (a clean eyedropper,
magnifier zoom, crosshair and move). Beyond that, **you make your own**: save the
current cursors as a named preset, rename / update / delete it, and
**import / export** presets as JSON to share or back up. (The built-in Default is
read-only; your saved presets aren't.)

There are deliberately no "Photoshop" / "Lightroom" / "Capture One" / "darktable"
presets: those apps' real cursors are proprietary (Adobe, Capture One) or
GPL-licensed (RawTherapee / GIMP) and can't be shipped here, and we won't pass off
look-alikes as the real thing. The art below is original, styled after the general
photo-editor idiom.

## Per-cursor overrides

Under the preset picker, each cursor has its own dropdown:

- **From preset** — follow whatever the chosen preset uses (the default).
- **System default** — Safelight's built-in cursor for that role.
- A **named icon** — any art that suits that cursor (the picker offers the
  eyedropper, add/subtract droppers, loupe, crosshair and target).
- **Custom SVG…** — paste your own SVG and set its hotspot (the active click
  point, in the SVG's own pixel coordinates). Give it a white halo under a dark
  core so it stays visible on any photo.

Each cursor also has a **size** (a percentage of the 24px art). There's a global
**Default cursor size** (60% by default, so cursors sit at a small native scale
rather than oversized), and any single cursor can override it. Native pan/resize
cursors are sized by the OS, so their size control is disabled.

Changes apply instantly. "Reset tweaks" clears every per-cursor override, custom
SVG and size while keeping the selected preset and the default size.

## How it works

Safelight resolves canvas cursors through named **tokens** (`pick`, `zoom-in`,
`pan`, `crop-move`, …) via its cursor store. This extension re-registers those
token ids with its own images through `api.registerCursor`, so the new cursors
appear everywhere the core uses them — no core hooks required. The whole config
lives in one persisted setting and is re-applied on load and on change.

The cursor **names** shown in the Preferences tab come from the core
(`api.cursors.labels`), so they always match the app's own wording — the
extension supplies the icon, not the name.

When the extension is disabled or uninstalled, Safelight restores its built-in
defaults for every token that was overridden.

## Build

```sh
npm install
npm run build      # bundles to dist/index.js (committed; the store fetches as-is)
npm run typecheck  # tsc, no emit
npm run smoke      # server-renders the Preferences panel across all presets
npm run check      # asserts the preset CRUD / import-export / scale logic
npm run contact    # writes contact.html — a visual sheet of every cursor + hotspot
npm run render-prefs # writes prefs.html — the Preferences tab with a theme shim
npm run verify     # typecheck + check + smoke + build
```

React is provided by the host at runtime via `api.react`, so it is never bundled.

## Develop / test in the app

Extensions ▸ Dev ▸ Choose folder… and point it at this folder, then ↻ Reload the
row after each `npm run build`. The Preferences tab appears under
Settings ▸ Extensions ▸ Custom Cursors.

## License

MIT — see [LICENSE](LICENSE).
