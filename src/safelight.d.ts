// Minimal Safelight extension API surface used by Custom Cursors. Extensions are
// standalone bundles, so we declare only the pieces we touch rather than depend
// on the host's source. Mirrors src/extensions/types.ts in the app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentType = any;

/** A named cursor: a native CSS keyword (`css`) or a custom image (inline `<svg…>`
 *  markup or an image/data URL) with an optional hotspot. Re-registering the same
 *  `id` replaces it — including a built-in token like "pick" or "zoom-in". */
export interface CursorContribution {
  id: string;
  css?: string;
  image?: string;
  hotspotX?: number;
  hotspotY?: number;
  fallback?: string;
}

export type SettingsField =
  | { key: string; label: string; hint?: string; type: "boolean"; default: boolean }
  | {
      key: string;
      label: string;
      hint?: string;
      type: "select";
      default: string;
      options: { value: string; label: string }[];
    };

export interface SettingsContribution {
  title?: string;
  fields: SettingsField[];
  order?: number;
  keywords?: string[];
  /** A custom React component rendered instead of the declarative `fields`. */
  component?: ComponentType;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  react: any;
  /** Register (or replace) a named cursor — a built-in token id or a new one. */
  registerCursor(c: CursorContribution): void;
  registerSettings(c: SettingsContribution): void;
  settings: {
    get<T>(key: string, fallback: T): T;
    set(key: string, value: unknown): void;
    onChange(cb: (key: string, value: unknown) => void): () => void;
  };
  preferences: {
    /** Open Preferences focused on an extension's section. */
    open(extensionId: string): void;
  };
  /** { Panel, Slider, Histogram, CurveEditor, Rating, Thumbnail }. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, ComponentType>;
  /** { useDevelopStore, useCatalogStore, useUIStore, … }. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stores: Record<string, any>;
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
