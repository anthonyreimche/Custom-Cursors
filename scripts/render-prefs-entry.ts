// Dev-only: server-render the Preferences panel body to stdout. The runner wraps
// it with a theme shim. Uses stub api.ui, so this checks structure + labels, not
// the real Tailwind-styled kit (which only renders inside the app).

import * as React from "react";
import { renderToString } from "react-dom/server";
import { initRuntime } from "../src/runtime";
import { PreferencesPanel } from "../src/preferences";
import { makeFakeApi } from "./test-harness";

const config = JSON.stringify({
  preset: "classic",
  overrides: { "zoom-in": "target-plus", crosshair: "custom" },
  custom: { crosshair: { svg: "", hotspotX: 12, hotspotY: 12 } },
});
const { api } = makeFakeApi(React, config);
initRuntime(api);

process.stdout.write(renderToString(React.createElement(PreferencesPanel)));
