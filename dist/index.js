// src/cursors.ts
var NS = 'xmlns="http://www.w3.org/2000/svg"';
function svg(inner) {
  return `<svg ${NS} width="24" height="24" viewBox="0 0 24 24">${inner}</svg>`;
}
function outlined(paths, halo = 3, core = 1.4) {
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#fff" stroke-width="${halo}">${paths}</g><g stroke="#111" stroke-width="${core}">${paths}</g></g>`;
}
function filled(shape, core = 1.3) {
  return `<g stroke-linejoin="round" stroke-linecap="round"><g fill="#fff" stroke="#fff" stroke-width="2.6">${shape}</g><g fill="#fff" stroke="#111" stroke-width="${core}">${shape}</g></g>`;
}
var DROPPER_BARREL = `<path d="M5 19 L15 9"/>`;
var DROPPER_BULB = `<path d="M16.5 4.5 l3 3 l-3 3 l-3 -3 z"/>`;
var ART = {
  // Picker / white-balance cursors ────────────────────────────────────────────
  "sample-ring": {
    label: "Sample ring (Safelight)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["pick"],
    svg: svg(
      outlined(
        `<circle cx="12" cy="12" r="6"/><path d="M12 1V4"/><path d="M12 20V23"/><path d="M1 12H4"/><path d="M20 12H23"/>`,
        3,
        1.4
      )
    )
  },
  "pipette-ring": {
    label: "Eyedropper + ring (Classic)",
    hotspotX: 5,
    hotspotY: 19,
    roles: ["pick"],
    svg: svg(
      outlined(`<circle cx="5" cy="19" r="2.9"/>`, 3, 1.3) + outlined(DROPPER_BARREL, 3, 1.4) + filled(DROPPER_BULB, 1.3)
    )
  },
  "pipette-loupe": {
    label: "Eyedropper + loupe (Loupe Pro)",
    hotspotX: 5,
    hotspotY: 19,
    roles: ["pick"],
    svg: svg(
      // Magnified pixel-grid loupe sitting on the sample point.
      filled(`<rect x="2.3" y="16.3" width="6.4" height="6.4" rx="1.3"/>`, 1.2) + outlined(
        `<path d="M4.4 16.5 V22.5"/><path d="M6.6 16.5 V22.5"/><path d="M2.5 18.6 H8.5"/><path d="M2.5 20.7 H8.5"/>`,
        0,
        0.8
      ) + outlined(`<path d="M8 16 L15 9"/>`, 3, 1.4) + filled(DROPPER_BULB, 1.3)
    )
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
        1.4
      ) + // The dot marks the exact sampled pixel at the centre.
      `<circle cx="12" cy="12" r="1.7" fill="#fff"/><circle cx="12" cy="12" r="0.95" fill="#111"/>`
    )
  },
  "pipette-plain": {
    label: "Plain eyedropper (RAW)",
    hotspotX: 3,
    hotspotY: 21,
    roles: ["pick"],
    svg: svg(
      outlined(`<path d="M3 21l5-5"/>`, 3.5, 1.5) + filled(`<path d="M8 16l9-9 3 3-9 9-4 1z"/>`, 1.5)
    )
  },
  // Zoom cursors ───────────────────────────────────────────────────────────────
  "magnifier-plus": {
    label: "Magnifier +",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-in"],
    svg: svg(
      outlined(
        `<circle cx="10" cy="10" r="6.4"/><path d="M15 15 L21.5 21.5"/><path d="M10 6.8 V13.2"/><path d="M6.8 10 H13.2"/>`,
        3,
        1.5
      )
    )
  },
  "magnifier-minus": {
    label: "Magnifier \u2212",
    hotspotX: 10,
    hotspotY: 10,
    roles: ["zoom-out"],
    svg: svg(
      outlined(
        `<circle cx="10" cy="10" r="6.4"/><path d="M15 15 L21.5 21.5"/><path d="M6.8 10 H13.2"/>`,
        3,
        1.5
      )
    )
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
        1.4
      )
    )
  },
  "target-minus": {
    label: "Target \u2212 (Precise)",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["zoom-out"],
    svg: svg(
      outlined(`<circle cx="12" cy="12" r="7"/><path d="M7.5 12 H16.5"/>`, 3, 1.4)
    )
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
        1.4
      )
    )
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
        2.2
      )
    )
  },
  // Move cursor ──────────────────────────────────────────────────────────────────
  "move-4way": {
    label: "Four-way move",
    hotspotX: 12,
    hotspotY: 12,
    roles: ["crop-move"],
    svg: svg(
      outlined(
        `<path d="M12 3 V21"/><path d="M3 12 H21"/><path d="M9 6 l3 -3 l3 3"/><path d="M9 18 l3 3 l3 -3"/><path d="M6 9 l-3 3 l3 3"/><path d="M18 9 l3 3 l-3 3"/>`,
        2.8,
        1.4
      )
    )
  }
};
function svgToDataUrl(markup) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
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
var ROLES = [
  { role: "pick", label: "Colour picker", hint: "White balance / colour sampling", group: "primary" },
  { role: "zoom-in", label: "Zoom in", group: "primary" },
  { role: "zoom-out", label: "Zoom out", group: "primary" },
  { role: "crosshair", label: "Crosshair", hint: "Precise mode / drawing a crop", group: "primary" },
  { role: "crop-move", label: "Move", hint: "Dragging the crop box", group: "primary" },
  { role: "pan", label: "Pan", hint: "Hand \u2014 drag the image around", group: "advanced" },
  { role: "panning", label: "Pan (dragging)", group: "advanced" },
  { role: "crop-resize-nwse", label: "Resize (\u2198\u2196)", group: "advanced" },
  { role: "crop-resize-nesw", label: "Resize (\u2199\u2197)", group: "advanced" },
  { role: "crop-resize-ns", label: "Resize (\u2195)", group: "advanced" },
  { role: "crop-resize-ew", label: "Resize (\u2194)", group: "advanced" }
];
var ALL_ROLES = ROLES.map((r) => r.role);
var PRESETS = [
  {
    id: "safelight",
    label: "Safelight (default)",
    description: "The shipped cursors \u2014 the sample-ring picker, system zoom and crop.",
    map: {}
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
      "crop-move": "move-4way"
    }
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
      "crop-move": "move-4way"
    }
  },
  {
    id: "precise",
    label: "Precise (technical)",
    description: "Fine crosshairs and ringed targets \u2014 never hides the pixel you hit.",
    map: {
      pick: "crosshair-pick",
      "zoom-in": "target-plus",
      "zoom-out": "target-minus",
      crosshair: "crosshair-thin",
      "crop-move": "move-4way"
    }
  },
  {
    id: "raw",
    label: "Open-source RAW (darktable-style)",
    description: "High-contrast plain eyedropper and a rounded crosshair; system zoom.",
    map: {
      pick: "pipette-plain",
      crosshair: "crosshair-rounded"
    }
  }
];
var PRESET_IDS = PRESETS.map((p) => p.id);
var DEFAULT_CONFIG = { preset: "safelight", overrides: {}, custom: {} };
function parseConfig(raw) {
  if (typeof raw !== "string" || raw.length === 0) return { ...DEFAULT_CONFIG };
  try {
    const o = JSON.parse(raw);
    return {
      preset: typeof o.preset === "string" && PRESET_IDS.includes(o.preset) ? o.preset : "safelight",
      overrides: o.overrides && typeof o.overrides === "object" ? o.overrides : {},
      custom: o.custom && typeof o.custom === "object" ? o.custom : {}
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
function presetById(id) {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
function resolvedChoice(role, config) {
  const choice = config.overrides[role] ?? "preset";
  if (choice === "preset") return presetById(config.preset).map[role] ?? "system";
  return choice;
}
function resolveRole(role, config) {
  const fallback = NATIVE_CSS[role];
  const choice = resolvedChoice(role, config);
  if (choice === "custom") {
    const c = config.custom[role];
    if (c && typeof c.svg === "string" && c.svg.includes("<svg")) {
      return { id: role, image: c.svg, hotspotX: c.hotspotX, hotspotY: c.hotspotY, fallback };
    }
    return systemContribution(role);
  }
  if (choice === "system") return systemContribution(role);
  const art = ART[choice];
  if (!art) return systemContribution(role);
  return { id: role, image: art.svg, hotspotX: art.hotspotX, hotspotY: art.hotspotY, fallback };
}
function systemContribution(role) {
  if (role === "pick") {
    const a = ART["sample-ring"];
    return { id: "pick", image: a.svg, hotspotX: a.hotspotX, hotspotY: a.hotspotY, fallback: "crosshair" };
  }
  return { id: role, css: NATIVE_CSS[role] };
}
function resolveAll(config) {
  return ALL_ROLES.map((role) => resolveRole(role, config));
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
  wrap: { display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "var(--color-text-primary)", maxWidth: "560px" },
  intro: { fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  presetRow: { textAlign: "left", display: "flex", flexDirection: "column", gap: "2px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-surface-1)", cursor: "pointer", font: "inherit", color: "inherit" },
  presetRowOn: { border: "1px solid var(--color-accent)", background: "var(--color-surface-2)" },
  presetLabel: { fontSize: "12px", fontWeight: 600 },
  presetDesc: { fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.4 },
  sectionLabel: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginTop: "6px" },
  roleRow: { display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "1px solid var(--color-border-subtle)" },
  roleInfo: { display: "flex", flexDirection: "column", gap: "1px", width: "118px", flexShrink: 0 },
  roleLabel: { fontSize: "12px", fontWeight: 500 },
  roleHint: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.3 },
  select: { flex: 1, minWidth: 0, padding: "5px 6px", background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", font: "inherit", fontSize: "12px", cursor: "pointer" },
  previewBox: { width: "44px", height: "30px", flexShrink: 0, borderRadius: "4px", border: "1px solid var(--color-border)", overflow: "hidden", background: SPLIT, display: "flex", alignItems: "center", justifyContent: "center" },
  previewImg: { width: "22px", height: "22px", display: "block" },
  previewCss: { fontSize: "9px", color: "#f2f2f2", textShadow: "0 0 2px #000", textAlign: "center", lineHeight: 1.1, padding: "0 2px" },
  customWrap: { display: "flex", flexDirection: "column", gap: "6px", padding: "2px 0 8px 128px" },
  textarea: { width: "100%", minHeight: "64px", boxSizing: "border-box", fontFamily: "var(--font-mono, monospace)", fontSize: "11px", lineHeight: 1.4, background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", padding: "6px", resize: "vertical" },
  numRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  numLabel: { fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" },
  numInput: { width: "54px", padding: "3px 5px", background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", font: "inherit", fontSize: "11px" },
  note: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.4 },
  btnRow: { display: "flex", gap: "8px", marginTop: "4px" },
  btn: { padding: "6px 11px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "4px", color: "var(--color-text-primary)", cursor: "pointer", font: "inherit", fontSize: "12px" }
};
var CUSTOM_PLACEHOLDER = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="3"/>\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#111" stroke-width="1.4"/>\n</svg>';
function choicesFor(role) {
  const arts = Object.keys(ART).filter((k) => ART[k].roles.includes(role)).map((k) => ({ value: k, label: ART[k].label }));
  return [
    { value: "preset", label: "From preset" },
    { value: "system", label: "System default" },
    ...arts,
    { value: "custom", label: "Custom SVG\u2026" }
  ];
}
function CursorPreview({ role, config }) {
  const h2 = h;
  const c = resolveRole(role, config);
  const inner = c.image ? h2("img", { src: svgToDataUrl(c.image), style: S.previewImg, alt: "", draggable: false }) : h2("span", { style: S.previewCss }, c.css ?? "");
  return h2("div", { style: S.previewBox, title: c.image ? "custom image cursor" : `system cursor: ${c.css}` }, inner);
}
function CustomEditor({
  role,
  config,
  onPatch
}) {
  const h2 = h;
  const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
  const num = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return h2(
    "div",
    { style: S.customWrap },
    h2("textarea", {
      style: S.textarea,
      spellCheck: false,
      value: cur.svg,
      placeholder: CUSTOM_PLACEHOLDER,
      onChange: (e) => onPatch({ svg: e.target.value })
    }),
    h2(
      "div",
      { style: S.numRow },
      h2(
        "label",
        { style: S.numLabel },
        "Hotspot X",
        h2("input", {
          type: "number",
          style: S.numInput,
          value: cur.hotspotX,
          min: 0,
          max: 32,
          step: 1,
          onChange: (e) => onPatch({ hotspotX: num(e.target.value, 12) })
        })
      ),
      h2(
        "label",
        { style: S.numLabel },
        "Hotspot Y",
        h2("input", {
          type: "number",
          style: S.numInput,
          value: cur.hotspotY,
          min: 0,
          max: 32,
          step: 1,
          onChange: (e) => onPatch({ hotspotY: num(e.target.value, 12) })
        })
      )
    ),
    h2(
      "div",
      { style: S.note },
      "Paste a small SVG (\u226432\xD732 renders best). Give it a white halo under a dark core so it shows on any photo. Hotspot is the active click point in the SVG's own pixels."
    )
  );
}
function RoleRow({
  role,
  hint,
  label,
  config,
  onChoice,
  onPatch
}) {
  const h2 = h;
  const value = config.overrides[role] ?? "preset";
  const showEditor = value === "custom";
  return h2(
    "div",
    { key: role },
    h2(
      "div",
      { style: S.roleRow },
      h2(
        "div",
        { style: S.roleInfo },
        h2("span", { style: S.roleLabel }, label),
        hint ? h2("span", { style: S.roleHint }, hint) : null
      ),
      h2(
        "select",
        { style: S.select, value, onChange: (e) => onChoice(e.target.value) },
        ...choicesFor(role).map((o) => h2("option", { key: o.value, value: o.value }, o.label))
      ),
      h2(CursorPreview, { role, config })
    ),
    showEditor ? h2(CustomEditor, { role, config, onPatch }) : null
  );
}
function PreferencesPanel() {
  const h2 = h;
  const { useState } = React;
  const [config, setConfig] = useState(() => getConfig());
  const commit = (next) => {
    setConfig(next);
    saveConfig(next);
  };
  const setPreset = (id) => commit({ ...config, preset: id });
  const setChoice = (role, value) => {
    const overrides = { ...config.overrides };
    if (value === "preset") delete overrides[role];
    else overrides[role] = value;
    commit({ ...config, overrides });
  };
  const patchCustom = (role, patch) => {
    const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
    commit({ ...config, custom: { ...config.custom, [role]: { ...cur, ...patch } } });
  };
  const resetOverrides = () => commit({ preset: config.preset, overrides: {}, custom: {} });
  const primary = ROLES.filter((r) => r.group === "primary");
  const advanced = ROLES.filter((r) => r.group === "advanced");
  const renderRow = (r) => h2(RoleRow, {
    key: r.role,
    role: r.role,
    label: r.label,
    hint: r.hint,
    config,
    onChoice: (v) => setChoice(r.role, v),
    onPatch: (p) => patchCustom(r.role, p)
  });
  return h2(
    "div",
    { style: S.wrap },
    h2(
      "p",
      { style: S.intro },
      "Choose a cursor preset, then fine-tune any single cursor below \u2014 or supply your own SVG. Changes apply instantly across the Develop canvas."
    ),
    h2(
      "div",
      { style: S.presetGrid },
      ...PRESETS.map(
        (p) => h2(
          "button",
          {
            key: p.id,
            style: { ...S.presetRow, ...config.preset === p.id ? S.presetRowOn : null },
            onClick: () => setPreset(p.id)
          },
          h2("span", { style: S.presetLabel }, p.label),
          h2("span", { style: S.presetDesc }, p.description)
        )
      )
    ),
    h2("div", { style: S.sectionLabel }, "Cursors"),
    ...primary.map(renderRow),
    h2("div", { style: S.sectionLabel }, "Advanced (system by default)"),
    ...advanced.map(renderRow),
    h2(
      "div",
      { style: S.btnRow },
      h2(
        "button",
        { style: S.btn, onClick: resetOverrides, title: "Clear every per-cursor override and custom SVG, keeping the chosen preset" },
        "Reset overrides"
      )
    )
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
