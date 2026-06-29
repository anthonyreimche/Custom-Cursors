// Dev-only: render the Preferences panel to prefs.html (with a dark theme shim)
// so the label/text can be eyeballed. Usage: node scripts/render-prefs.mjs <dir>

import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { build } from "esbuild";

const extDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] || extDir;

const res = await build({
  entryPoints: [path.join(extDir, "scripts", "render-prefs-entry.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  write: false,
});
const bundle = path.join(OUT, "render-prefs.bundle.cjs");
writeFileSync(bundle, res.outputFiles[0].text);
const body = execFileSync(process.execPath, [bundle], { encoding: "utf8" });

const html = `<!doctype html><html><head><meta charset="utf8"><style>
:root{
  --color-surface-0:#1d1d1f;--color-surface-1:#262629;--color-surface-2:#2f2f33;--color-surface-3:#3a3a3f;
  --color-text-primary:#e9e9ea;--color-text-secondary:#b2b2b6;--color-text-muted:#85858b;
  --color-border:#46464c;--color-border-subtle:#37373c;--color-accent:#4a90d9;--font-mono:ui-monospace,monospace;
}
body{margin:0;background:var(--color-surface-0);font-family:system-ui,sans-serif;padding:20px}
.frame{max-width:600px;background:var(--color-surface-0);padding:8px 16px;border:1px solid var(--color-border);border-radius:10px}
.frame>div{max-width:none}
</style></head><body><div class="frame">${body}</div></body></html>`;

const outFile = path.join(OUT, "prefs.html");
writeFileSync(outFile, html);
console.log("wrote", outFile);
