// src/cursors.ts
var BASE = 24;
var NS = 'xmlns="http://www.w3.org/2000/svg"';
function buildCursorSvg(inner, size) {
  const s = Math.max(1, Math.round(size));
  return `<svg ${NS} width="${s}" height="${s}" viewBox="0 0 ${BASE} ${BASE}">${inner}</svg>`;
}
function halo(shape) {
  return `<g fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${shape}</g>`;
}
function body(shape, w = 1.4) {
  return `<g fill="#fff" stroke="#111" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${shape}</g>`;
}
function filled(shape, w = 1.4) {
  return halo(shape) + body(shape, w);
}
function lines(paths, h2 = 3, c = 1.4) {
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#fff" stroke-width="${h2}">${paths}</g><g stroke="#111" stroke-width="${c}">${paths}</g></g>`;
}
var DROP = '<rect x="8.6" y="2" width="6.8" height="4.8" rx="2.2"/><rect x="10.6" y="6.2" width="2.8" height="9.2" rx="1"/><path d="M10.6 14.8 L12 19.8 L13.4 14.8 Z"/>';
var DROPPER = `<g transform="rotate(45 12 12)">${filled(DROP)}</g>`;
var ART = {
  // Eyedropper / colour picker ─────────────────────────────────────────────────
  dropper: { label: "Eyedropper", hotspotX: 6, hotspotY: 18, roles: ["pick"], inner: DROPPER },
  "dropper-plus": {
    label: "Eyedropper + (add)",
    hotspotX: 6,
    hotspotY: 18,
    roles: ["pick"],
    inner: DROPPER + lines(`<path d="M19.6 2.6V6"/><path d="M17.9 4.3H21.3"/>`, 2.6, 1.3)
  },
  "dropper-minus": {
    label: "Eyedropper \u2212 (subtract)",
    hotspotX: 6,
    hotspotY: 18,
    roles: ["pick"],
    inner: DROPPER + lines(`<path d="M17.9 4.3H21.3"/>`, 2.6, 1.3)
  },
  loupe: {
    label: "Loupe (pixel grid)",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["pick"],
    inner: lines(`<path d="M14.5 14.5 L20 20"/>`, 3.6, 2.6) + filled(`<rect x="3.5" y="3.5" width="12" height="12" rx="2.6"/>`) + lines(`<path d="M7.3 4.2V14.8"/><path d="M11.5 4.2V14.8"/><path d="M4.2 7.3H14.8"/><path d="M4.2 11.5H14.8"/>`, 0, 0.7)
  },
  // Zoom ────────────────────────────────────────────────────────────────────────
  "magnifier-plus": {
    label: "Magnifier +",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-in"],
    inner: lines(`<circle cx="10" cy="10" r="6.3"/><path d="M14.6 14.6 L21 21"/><path d="M10 6.8V13.2"/><path d="M6.8 10H13.2"/>`, 3, 1.5)
  },
  "magnifier-minus": {
    label: "Magnifier \u2212",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-out"],
    inner: lines(`<circle cx="10" cy="10" r="6.3"/><path d="M14.6 14.6 L21 21"/><path d="M6.8 10H13.2"/>`, 3, 1.5)
  },
  // Crosshair / target ────────────────────────────────────────────────────────
  "crosshair-thin": {
    label: "Crosshair",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair", "crop-move"],
    inner: lines(`<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`, 3, 1.4)
  },
  "crosshair-dot": {
    label: "Crosshair + dot",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair", "crop-move"],
    inner: lines(`<path d="M12 2V9"/><path d="M12 15V22"/><path d="M2 12H9"/><path d="M15 12H22"/>`, 3, 1.4) + `<circle cx="12" cy="12" r="1.7" fill="#fff"/><circle cx="12" cy="12" r="0.95" fill="#111"/>`
  },
  reticle: {
    label: "Target ring",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick", "crosshair"],
    inner: lines(`<circle cx="12" cy="12" r="6"/><path d="M12 1V4"/><path d="M12 20V23"/><path d="M1 12H4"/><path d="M20 12H23"/>`, 3, 1.4)
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
      1.4
    )
  },
  crop: {
    label: "Crop brackets",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crop-move", "crosshair"],
    inner: lines(`<path d="M8 3 V15 a1.5 1.5 0 0 0 1.5 1.5 H21"/><path d="M3 8 H14.5 a1.5 1.5 0 0 1 1.5 1.5 V21"/>`, 3, 1.6)
  },
  // Pan (hand) ────────────────────────────────────────────────────────────────
  hand: {
    label: "Open hand",
    hotspotX: 12,
    hotspotY: 11,
    roles: ["pan", "panning"],
    inner: filled(`<rect x="7" y="10" width="9" height="9" rx="3"/><rect x="7.6" y="6" width="2" height="6" rx="1"/><rect x="9.9" y="5" width="2" height="7" rx="1"/><rect x="12.1" y="5.2" width="2" height="7" rx="1"/><rect x="14.2" y="6.5" width="2" height="6" rx="1"/><rect x="5.3" y="10.5" width="2.3" height="5" rx="1.1"/>`)
  },
  grab: {
    label: "Closed hand",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pan", "panning"],
    inner: filled(`<rect x="7" y="10" width="9.5" height="8" rx="3.5"/><rect x="7.8" y="8" width="2" height="3.2" rx="1"/><rect x="10" y="7.6" width="2" height="3.6" rx="1"/><rect x="12.2" y="7.8" width="2" height="3.4" rx="1"/><rect x="14.2" y="8.4" width="2" height="3" rx="1"/>`)
  }
};
function svgToDataUrl(markup) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}
function scaleCustomSvg(svg, scale) {
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

// src/presets.ts
var NATIVE_CSS = {
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
  "crop-resize-ew": "ew-resize"
};
var FALLBACK_LABELS = {
  pick: "Colour picker",
  "zoom-in": "Zoom in",
  "zoom-out": "Zoom out",
  crosshair: "Crosshair",
  "crop-move": "Move",
  pan: "Pan",
  panning: "Pan (dragging)",
  "crop-resize-nwse": "Resize (\u2196\u2198)",
  "crop-resize-nesw": "Resize (\u2197\u2199)",
  "crop-resize-ns": "Resize (\u2195)",
  "crop-resize-ew": "Resize (\u2194)"
};
var ROLES = [
  { role: "pick", hint: "White balance / colour sampling", group: "primary" },
  { role: "zoom-in", group: "primary" },
  { role: "zoom-out", group: "primary" },
  { role: "crosshair", hint: "Precise mode / drawing a crop", group: "primary" },
  { role: "crop-move", hint: "Dragging the crop box", group: "primary" },
  { role: "pan", hint: "Hand \u2014 drag the image around", group: "advanced" },
  { role: "panning", group: "advanced" },
  { role: "crop-resize-nwse", group: "advanced" },
  { role: "crop-resize-nesw", group: "advanced" },
  { role: "crop-resize-ns", group: "advanced" },
  { role: "crop-resize-ew", group: "advanced" }
];
var ALL_ROLES = ROLES.map((r) => r.role);
var PRESETS = [
  {
    id: "safelight",
    label: "Default",
    description: "A clean eyedropper, magnifier zoom, crosshair and move \u2014 the recommended set.",
    map: { pick: "dropper", "zoom-in": "magnifier-plus", "zoom-out": "magnifier-minus", crosshair: "crosshair-thin", "crop-move": "move" }
  }
];
var PRESET_IDS = PRESETS.map((p) => p.id);
var DEFAULT_SCALE = 0.6;
var MIN_SCALE = 0.35;
var MAX_SCALE = 2;
var CONFIG_VERSION = 2;
function clampScale(n) {
  if (!Number.isFinite(n)) return DEFAULT_SCALE;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
}
var DEFAULT_CONFIG = {
  version: CONFIG_VERSION,
  preset: "safelight",
  overrides: {},
  custom: {},
  scales: {},
  defaultScale: DEFAULT_SCALE,
  userPresets: []
};
function clone(c) {
  return JSON.parse(JSON.stringify(c));
}
function asObj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}
function asScales(v) {
  const out = {};
  const o = asObj(v);
  for (const k of Object.keys(o)) {
    const n = Number(o[k]);
    if (Number.isFinite(n)) out[k] = clampScale(n);
  }
  return out;
}
function isUserPresetShape(p) {
  return !!p && typeof p === "object" && typeof p.label === "string" && !!p.map && typeof p.map === "object";
}
function sanitizeUserPreset(p) {
  return {
    id: typeof p.id === "string" ? p.id : genId(),
    label: String(p.label).slice(0, 80) || "Untitled",
    map: asObj(p.map),
    custom: asObj(p.custom),
    scales: asScales(p.scales),
    defaultScale: typeof p.defaultScale === "number" ? clampScale(p.defaultScale) : void 0
  };
}
function parseConfig(raw) {
  if (typeof raw !== "string" || raw.length === 0) return clone(DEFAULT_CONFIG);
  try {
    const o = JSON.parse(raw);
    const version = typeof o.version === "number" ? o.version : 1;
    const defaultScale = version < CONFIG_VERSION || typeof o.defaultScale !== "number" ? DEFAULT_SCALE : clampScale(o.defaultScale);
    return {
      version: CONFIG_VERSION,
      preset: typeof o.preset === "string" ? o.preset : "safelight",
      overrides: asObj(o.overrides),
      custom: asObj(o.custom),
      scales: asScales(o.scales),
      defaultScale,
      userPresets: Array.isArray(o.userPresets) ? o.userPresets.filter(isUserPresetShape).map(sanitizeUserPreset) : []
    };
  } catch {
    return clone(DEFAULT_CONFIG);
  }
}
function allPresets(config) {
  const builtin = PRESETS.map((p) => ({ id: p.id, label: p.label, description: p.description, builtin: true, map: p.map }));
  const user = config.userPresets.map((p) => ({ id: p.id, label: p.label, builtin: false, map: p.map, custom: p.custom, scales: p.scales, defaultScale: p.defaultScale }));
  return [...builtin, ...user];
}
function getPreset(config, id) {
  return allPresets(config).find((p) => p.id === id);
}
function activeMap(config) {
  return getPreset(config, config.preset)?.map ?? {};
}
function resolvedChoice(role, config) {
  const override = config.overrides[role];
  if (override && override !== "preset") return override;
  return activeMap(config)[role] ?? "system";
}
function scaleFor(role, config) {
  return clampScale(config.scales[role] ?? config.defaultScale ?? DEFAULT_SCALE);
}
function imageContribution(role, art, scale, fallback) {
  return {
    id: role,
    image: buildCursorSvg(art.inner, BASE * scale),
    hotspotX: Math.round(art.hotspotX * scale),
    hotspotY: Math.round(art.hotspotY * scale),
    fallback
  };
}
function systemContribution(role, scale = DEFAULT_SCALE) {
  if (role === "pick") return imageContribution("pick", ART["reticle"], scale, "crosshair");
  return { id: role, css: NATIVE_CSS[role] };
}
function resolveRole(role, config) {
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
function resolveAll(config) {
  return ALL_ROLES.map((role) => resolveRole(role, config));
}
function snapshotFromConfig(config) {
  const map = {};
  const custom = {};
  for (const role of ALL_ROLES) {
    const c = resolvedChoice(role, config);
    if (c !== "system") map[role] = c;
    if (c === "custom" && config.custom[role]) custom[role] = config.custom[role];
  }
  return { map, custom, scales: { ...config.scales }, defaultScale: config.defaultScale };
}
function stable(s) {
  const sort = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
  return JSON.stringify({ map: sort(s.map), custom: sort(s.custom), scales: sort(s.scales), defaultScale: s.defaultScale });
}
function isDirty(config) {
  const p = getPreset(config, config.preset);
  const cur = snapshotFromConfig(config);
  if (!p) return Object.keys(cur.map).length > 0;
  const base = { map: p.map, custom: p.custom ?? {}, scales: p.scales ?? {}, defaultScale: p.defaultScale ?? config.defaultScale };
  return stable(cur) !== stable(base);
}
function activeIsUserPreset(config) {
  return config.userPresets.some((p) => p.id === config.preset);
}
function genId() {
  return `user-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
function applyPreset(config, id) {
  const p = getPreset(config, id);
  return {
    ...config,
    preset: id,
    overrides: {},
    custom: p?.custom ? { ...p.custom } : {},
    scales: p?.scales ? { ...p.scales } : {},
    defaultScale: p?.defaultScale ?? config.defaultScale
  };
}
function saveAsPreset(config, label) {
  const snap = snapshotFromConfig(config);
  const preset = { id: genId(), label: label.trim() || "Untitled", map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale };
  return { ...config, userPresets: [...config.userPresets, preset], preset: preset.id, overrides: {} };
}
function updateActivePreset(config) {
  const idx = config.userPresets.findIndex((p) => p.id === config.preset);
  if (idx < 0) return config;
  const snap = snapshotFromConfig(config);
  const userPresets = config.userPresets.slice();
  userPresets[idx] = { ...userPresets[idx], map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale };
  return { ...config, userPresets, overrides: {} };
}
function renamePreset(config, id, label) {
  return { ...config, userPresets: config.userPresets.map((p) => p.id === id ? { ...p, label: label.trim() || p.label } : p) };
}
function deletePreset(config, id) {
  const next = { ...config, userPresets: config.userPresets.filter((p) => p.id !== id) };
  return config.preset === id ? applyPreset(next, "safelight") : next;
}
var EXPORT_TAG = "safelightCursorPresets";
function exportPresets(presets) {
  return JSON.stringify({ [EXPORT_TAG]: 1, presets }, null, 2);
}
function exportCurrent(config, label) {
  const snap = snapshotFromConfig(config);
  return exportPresets([{ id: genId(), label, map: snap.map, custom: snap.custom, scales: snap.scales, defaultScale: snap.defaultScale }]);
}
function importPresets(config, json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    return { config, added: 0, error: "That doesn't look like valid JSON." };
  }
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === "object" && Array.isArray(data.presets)) list = data.presets;
  else if (isUserPresetShape(data)) list = [data];
  const valid = list.filter(isUserPresetShape).map((p) => ({ ...sanitizeUserPreset(p), id: genId() }));
  if (!valid.length) return { config, added: 0, error: "No cursor presets found in that data." };
  return { config: { ...config, userPresets: [...config.userPresets, ...valid] }, added: valid.length };
}

// src/runtime.ts
var api = null;
var React = null;
var CONFIG_KEY = "config";
function initRuntime(_api) {
  api = _api;
  React = _api.react;
}
function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
}
function cursorLabel(role) {
  return api?.cursors?.labels?.[role] ?? FALLBACK_LABELS[role] ?? role;
}
function hasUi() {
  return !!api?.ui;
}
function getUi() {
  const ui = api.ui;
  if (!ui) throw new Error("Custom Cursors requires a newer Safelight build (api.ui).");
  return ui;
}
function getConfig() {
  return parseConfig(api.settings.get(CONFIG_KEY, ""));
}
function saveConfig(config) {
  api.settings.set(CONFIG_KEY, JSON.stringify(config));
  applyCursors(config);
}
function applyCursors(config) {
  for (const contribution of resolveAll(config)) api.registerCursor(contribution);
}

// src/preferences.ts
var SPLIT = "linear-gradient(90deg,#dcdcdc 0 50%,#262626 50% 100%)";
var S = {
  intro: { fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.45, margin: 0 },
  presetMeta: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.3 },
  panel: { display: "flex", flexDirection: "column", gap: "6px", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-surface-1)" },
  panelTitle: { fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" },
  sizeLabel: { fontSize: "11px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" },
  header: { textAlign: "left", background: "none", border: "none", color: "var(--color-text-muted)", font: "inherit", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", padding: "2px 0" },
  roleInfo: { width: "100px", flexShrink: 0 },
  roleLabel: { fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" },
  pctWrap: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", width: "60px", flexShrink: 0 },
  sizeNA: { width: "60px", flexShrink: 0, textAlign: "right", paddingRight: "4px", fontSize: "11px", color: "var(--color-text-muted)" },
  pct: { fontSize: "10px", color: "var(--color-text-muted)" },
  previewBox: { width: "34px", height: "26px", flexShrink: 0, borderRadius: "4px", border: "1px solid var(--color-border)", overflow: "hidden", background: SPLIT, display: "flex", alignItems: "center", justifyContent: "center" },
  previewImg: { maxWidth: "30px", maxHeight: "22px", display: "block" },
  previewCss: { fontSize: "9px", fontWeight: 500, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "1px 4px", borderRadius: "3px", letterSpacing: "0.04em" },
  numLabel: { fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px" },
  note: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.4, margin: 0 }
};
var CUSTOM_PLACEHOLDER = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="3"/>\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#111" stroke-width="1.4"/>\n</svg>';
function choicesFor(role) {
  const arts = Object.keys(ART).filter((k) => ART[k].roles.includes(role)).map((k) => ({ value: k, label: ART[k].label }));
  return [{ value: "preset", label: "From preset" }, { value: "system", label: "System default" }, ...arts, { value: "custom", label: "Custom SVG\u2026" }];
}
function copyText(t) {
  try {
    void navigator.clipboard?.writeText(t);
  } catch {
  }
}
function downloadText(name, t) {
  try {
    const url = URL.createObjectURL(new Blob([t], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  } catch {
  }
}
function CursorPreview({ role, config }) {
  const h2 = h;
  const c = resolveRole(role, config);
  const cursor = c.image ? `url("${svgToDataUrl(c.image)}") ${c.hotspotX ?? 0} ${c.hotspotY ?? 0}, ${c.fallback ?? "auto"}` : c.css ?? "auto";
  const content = c.image ? h2("img", { src: svgToDataUrl(c.image), style: S.previewImg, alt: "", draggable: false }) : h2("span", { style: S.previewCss }, "OS");
  return h2(
    "div",
    { style: { ...S.previewBox, cursor }, title: c.image ? "Hover to preview the cursor" : `System cursor: ${c.css} \u2014 hover to preview` },
    content
  );
}
function CustomEditor({ role, config, onPatch }) {
  const h2 = h;
  const ui = getUi();
  const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
  return h2(
    ui.Stack,
    { gap: 6, style: { padding: "2px 0 6px 96px" } },
    h2(ui.TextArea, { value: cur.svg, onChange: (v) => onPatch({ svg: v }), mono: true, rows: 4, placeholder: CUSTOM_PLACEHOLDER }),
    h2(
      ui.Row,
      { gap: 10, wrap: true },
      h2("label", { style: S.numLabel }, "Hotspot X", h2(ui.NumberInput, { value: cur.hotspotX, onChange: (n) => onPatch({ hotspotX: n }), min: 0, max: 32, step: 1, width: "52px" })),
      h2("label", { style: S.numLabel }, "Hotspot Y", h2(ui.NumberInput, { value: cur.hotspotY, onChange: (n) => onPatch({ hotspotY: n }), min: 0, max: 32, step: 1, width: "52px" }))
    ),
    h2("p", { style: S.note }, "Paste a small SVG (a 24\xD724 viewBox works best); the size control scales it. Hotspot is in the SVG's own pixels.")
  );
}
function RoleRow({ role, label, hint, config, onChoice, onScale, onPatch }) {
  const h2 = h;
  const ui = getUi();
  const value = config.overrides[role] ?? "preset";
  const isImage = !!resolveRole(role, config).image;
  const pct = Math.round(scaleFor(role, config) * 100);
  const size = isImage ? h2("div", { style: S.pctWrap, title: "Cursor size (% of base)" }, h2(ui.NumberInput, { value: pct, onChange: (n) => onScale(n), min: 35, max: 200, step: 5, width: "42px" }), h2("span", { style: S.pct }, "%")) : h2("div", { style: S.sizeNA, title: "Sized by the operating system" }, "\u2014");
  return h2(
    "div",
    { key: role },
    h2(
      ui.Row,
      { gap: 6, style: { padding: "4px 0", borderBottom: `1px solid ${ui.tokens.borderSubtle}` } },
      h2("div", { style: S.roleInfo, title: hint }, h2("span", { style: S.roleLabel }, label)),
      h2(ui.Select, { value, onChange: onChoice, options: choicesFor(role), style: { flex: 1, minWidth: 0 } }),
      size,
      h2(CursorPreview, { role, config })
    ),
    value === "custom" ? h2(CustomEditor, { role, config, onPatch }) : null
  );
}
function PreferencesPanel() {
  const h2 = h;
  const { useState } = React;
  const [config, setConfig] = useState(() => getConfig());
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState("");
  const [advOpen, setAdvOpen] = useState(false);
  if (!hasUi()) {
    return h2("p", { style: S.intro }, "Custom Cursors needs a newer version of Safelight (with the shared UI kit). The cursors still apply \u2014 only this settings panel is unavailable until you update.");
  }
  const ui = getUi();
  const commit = (next) => {
    setConfig(next);
    saveConfig(next);
  };
  const closeMode = () => {
    setMode(null);
    setMsg("");
  };
  const setChoice = (role, value) => {
    const overrides = { ...config.overrides };
    if (value === "preset") delete overrides[role];
    else overrides[role] = value;
    commit({ ...config, overrides });
  };
  const setScale = (role, pct) => commit({ ...config, scales: { ...config.scales, [role]: clampScale(pct / 100) } });
  const patchCustom = (role, patch) => {
    const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
    commit({ ...config, custom: { ...config.custom, [role]: { ...cur, ...patch } } });
  };
  const setDefaultScale = (pct) => commit({ ...config, defaultScale: clampScale(pct / 100) });
  const resetTweaks = () => commit({ ...config, overrides: {}, custom: {}, scales: {} });
  const presets = allPresets(config);
  const active = getPreset(config, config.preset);
  const dirty = isDirty(config);
  const isUser = activeIsUserPreset(config);
  const confirmName = () => {
    if (!name.trim()) return;
    commit(mode === "rename" ? renamePreset(config, config.preset, name) : saveAsPreset(config, name));
    closeMode();
  };
  const doImport = () => {
    const r = importPresets(config, importText);
    if (r.error) {
      setMsg(r.error);
      return;
    }
    commit(r.config);
    setImportText("");
    setMsg(`Imported ${r.added} preset${r.added === 1 ? "" : "s"}.`);
  };
  const exportText = () => isUser && active ? exportPresets([config.userPresets.find((p) => p.id === config.preset)]) : exportCurrent(config, active?.label ?? "Cursors");
  const primary = ROLES.filter((r) => r.group === "primary");
  const advanced = ROLES.filter((r) => r.group === "advanced");
  const renderRow = (r) => h2(RoleRow, { key: r.role, role: r.role, label: cursorLabel(r.role), hint: r.hint, config, onChoice: (v) => setChoice(r.role, v), onScale: (n) => setScale(r.role, n), onPatch: (p) => patchCustom(r.role, p) });
  const managePanel = () => {
    if (mode === "save" || mode === "rename") {
      return h2("div", { style: S.panel }, h2("span", { style: S.panelTitle }, mode === "save" ? "Save current cursors as a preset" : "Rename preset"), h2(ui.TextInput, { value: name, onChange: setName, placeholder: "Preset name" }), h2(ui.Row, { gap: 6 }, h2(ui.Button, { size: "sm", variant: "primary", onClick: confirmName }, mode === "save" ? "Save" : "Rename"), h2(ui.Button, { size: "sm", onClick: closeMode }, "Cancel")));
    }
    if (mode === "delete") {
      return h2("div", { style: S.panel }, h2("span", { style: S.panelTitle }, `Delete \u201C${active?.label ?? ""}\u201D?`), h2(ui.Row, { gap: 6 }, h2(ui.Button, { size: "sm", variant: "danger", onClick: () => {
        commit(deletePreset(config, config.preset));
        closeMode();
      } }, "Delete"), h2(ui.Button, { size: "sm", onClick: closeMode }, "Cancel")));
    }
    if (mode === "export") {
      const text = exportText();
      return h2("div", { style: S.panel }, h2("span", { style: S.panelTitle }, "Export preset"), h2(ui.TextArea, { value: text, onChange: () => {
      }, mono: true, rows: 5, readOnly: true }), h2(ui.Row, { gap: 6, wrap: true }, h2(ui.Button, { size: "sm", onClick: () => copyText(text) }, "Copy"), h2(ui.Button, { size: "sm", onClick: () => downloadText("cursor-presets.json", text) }, "Download"), config.userPresets.length > 1 ? h2(ui.Button, { size: "sm", onClick: () => downloadText("cursor-presets.json", exportPresets(config.userPresets)) }, "Download all") : null, h2(ui.Button, { size: "sm", onClick: closeMode }, "Close")));
    }
    if (mode === "import") {
      return h2("div", { style: S.panel }, h2("span", { style: S.panelTitle }, "Import presets"), h2(ui.TextArea, { value: importText, onChange: setImportText, mono: true, rows: 4, placeholder: "Paste exported preset JSON here\u2026" }), h2("input", { type: "file", accept: ".json,application/json", onChange: (e) => {
        const f = e.target.files?.[0];
        if (f) void f.text().then((t) => setImportText(t));
      }, style: { fontSize: "11px", color: "var(--color-text-secondary)" } }), msg ? h2("span", { style: S.note }, msg) : null, h2(ui.Row, { gap: 6 }, h2(ui.Button, { size: "sm", variant: "primary", onClick: doImport, disabled: !importText.trim() }, "Import"), h2(ui.Button, { size: "sm", onClick: closeMode }, "Close")));
    }
    return null;
  };
  return h2(
    ui.Stack,
    { gap: 10, style: { maxWidth: "560px" } },
    h2("p", { style: S.intro }, "Pick a preset, fine-tune any cursor's art and size or paste your own SVG, and save your own presets."),
    // Preset picker (dropdown) + meta
    h2(ui.Select, { value: config.preset, onChange: (id) => {
      commit(applyPreset(config, id));
      closeMode();
    }, options: presets.map((p) => ({ value: p.id, label: p.builtin ? p.label : `${p.label} (saved)` })) }),
    h2("div", { style: S.presetMeta }, `${active?.description ?? (isUser ? "Your saved preset" : "")}${dirty ? "  \u2022 modified" : ""}`),
    // Preset toolbar
    h2(
      ui.Row,
      { gap: 6, wrap: true },
      h2(ui.Button, { size: "sm", onClick: () => {
        setName("");
        setMode("save");
      } }, "Save as preset"),
      isUser && dirty ? h2(ui.Button, { size: "sm", onClick: () => commit(updateActivePreset(config)) }, "Update") : null,
      isUser ? h2(ui.Button, { size: "sm", onClick: () => {
        setName(active?.label ?? "");
        setMode("rename");
      } }, "Rename") : null,
      isUser ? h2(ui.Button, { size: "sm", variant: "danger", onClick: () => setMode("delete") }, "Delete") : null,
      h2(ui.Button, { size: "sm", onClick: () => setMode("export") }, "Export"),
      h2(ui.Button, { size: "sm", onClick: () => {
        setImportText("");
        setMsg("");
        setMode("import");
      } }, "Import")
    ),
    managePanel(),
    // Default size + reset on one line
    h2(
      ui.Row,
      { gap: 12, align: "center", justify: "space-between" },
      h2(ui.Row, { gap: 6 }, h2("span", { style: S.sizeLabel }, "Default size"), h2(ui.NumberInput, { value: Math.round(config.defaultScale * 100), onChange: setDefaultScale, min: 35, max: 200, step: 5, width: "52px" }), h2("span", { style: S.pct }, "%")),
      h2(ui.Button, { size: "sm", onClick: resetTweaks, title: "Clear per-cursor overrides, custom SVGs and sizes (keeps the preset and default size)" }, "Reset tweaks")
    ),
    ...primary.map(renderRow),
    // Advanced (collapsed)
    h2("button", { type: "button", style: S.header, onClick: () => setAdvOpen(!advOpen) }, `${advOpen ? "\u25BE" : "\u25B8"} Advanced \u2014 pan & resize (system by default)`),
    advOpen ? h2(ui.Stack, { gap: 0 }, ...advanced.map(renderRow)) : null
  );
}

// src/index.ts
function activate(api2) {
  initRuntime(api2);
  applyCursors(getConfig());
  api2.registerSettings({
    title: "Custom Cursors",
    keywords: ["cursor", "cursors", "pointer", "eyedropper", "picker", "crosshair", "icon", "theme"],
    fields: [],
    component: PreferencesPanel
  });
  api2.settings.onChange((key) => {
    if (key === CONFIG_KEY) applyCursors(getConfig());
  });
}
function deactivate() {
}
export {
  activate,
  deactivate
};
