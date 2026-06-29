// Dev-only: render every cursor art into an HTML contact sheet for eyeballing —
// each shown enlarged (with its hotspot) and at the true default on-screen size.
// Bundles src/cursors.ts in-memory, then writes contact.html to the given dir.

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import { build } from "esbuild";

const extDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] || extDir;

const res = await build({
  entryPoints: [path.join(extDir, "src", "cursors.ts")],
  bundle: true,
  format: "esm",
  write: false,
  target: "es2022",
});
const bundlePath = path.join(OUT, "cursors.bundle.mjs");
writeFileSync(bundlePath, res.outputFiles[0].text);
const { ART, svgToDataUrl, buildCursorSvg } = await import(pathToFileURL(bundlePath).href);

const BIG = 96;
const DEFAULT_PX = Math.round(24 * 0.6); // matches DEFAULT_SCALE
const cards = Object.entries(ART)
  .map(([key, a]) => {
    const big = svgToDataUrl(buildCursorSvg(a.inner, BIG));
    const real = svgToDataUrl(buildCursorSvg(a.inner, DEFAULT_PX));
    const hx = (a.hotspotX / 24) * BIG;
    const hy = (a.hotspotY / 24) * BIG;
    return `<div class="card">
      <div class="name">${key}</div>
      <div class="roles">${a.roles.join(", ")}</div>
      <div class="big"><img src="${big}" width="${BIG}" height="${BIG}"/><div class="hot" style="left:${hx}px;top:${hy}px"></div></div>
      <div class="actual"><img src="${real}"/><span>${DEFAULT_PX}px default · hotspot (${a.hotspotX},${a.hotspotY})</span></div>
    </div>`;
  })
  .join("\n");

const html = `<!doctype html><html><head><meta charset="utf8"><style>
body{margin:0;background:#3a3a3a;font-family:system-ui,sans-serif;color:#eee;padding:16px}
h2{font-size:15px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card{background:#2a2a2a;border:1px solid #555;border-radius:8px;padding:10px}
.name{font-size:13px;font-weight:600}
.roles{font-size:10px;color:#9ab;margin-bottom:6px;height:12px;overflow:hidden}
.big{position:relative;width:${BIG}px;height:${BIG}px;margin:0 auto;border-radius:4px;
  background:linear-gradient(90deg,#e8e8e8 0 33%,#808080 33% 66%,#1a1a1a 66% 100%)}
.big img{position:absolute;left:0;top:0}
.hot{position:absolute;width:7px;height:7px;border:1.5px solid #ff2d55;border-radius:50%;
  transform:translate(-50%,-50%);box-shadow:0 0 2px #000}
.actual{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:10px;color:#ccc;
  background:linear-gradient(90deg,#e8e8e8 0 50%,#1a1a1a 50% 100%);padding:6px;border-radius:4px;min-height:26px}
.actual span{background:#2a2a2a;padding:1px 5px;border-radius:3px}
</style></head><body>
<h2>Custom Cursors — art contact sheet (red ring = hotspot; right strip = true default size)</h2>
<div class="grid">${cards}</div>
</body></html>`;

const outFile = path.join(OUT, "contact.html");
writeFileSync(outFile, html);
console.log("wrote", outFile);
