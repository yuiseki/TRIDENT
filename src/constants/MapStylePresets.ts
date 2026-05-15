// Preset map styles surfaced by MapStyleSelector and referenced by the
// base-style-switch ability. The `id` is what the surface chain emits in
// `Style: ...` output and what page.tsx maps to a JSON URL.

export type MapStylePresetId =
  | "fiord-color"
  | "dark-matter"
  | "osm-jp-bright"
  | "yuiseki-fiord"
  | "yuiseki-bright"
  | "osm-hot"
  | "arcgis-world-imagery";

export type MapStylePreset = {
  id: MapStylePresetId;
  url: string;
  label: string;
  description: string;
};

export const MAP_STYLE_PRESETS: readonly MapStylePreset[] = [
  {
    id: "fiord-color",
    url: "/map_styles/fiord-color-gl-style/style.json",
    label: "🌍 OSM Fiord color (vector)",
    description: "Default OSM vector style with soft pastel colors",
  },
  {
    id: "dark-matter",
    url: "/map_styles/dark-matter-gl-style/style.json",
    label: "🌍 OSM Dark Matter (vector)",
    description: "Dark mode vector style for low-light viewing",
  },
  {
    id: "osm-jp-bright",
    url: "https://tile.openstreetmap.jp/styles/osm-bright/style.json",
    label: "🌍 OSM JP Bright (vector)",
    description: "Bright vector style hosted on OSM Japan tiles",
  },
  {
    id: "yuiseki-fiord",
    url: "https://tile.yuiseki.net/styles/osm-fiord/style.json",
    label: "🌍 yuiseki Fiord color (vector)",
    description: "Fiord color variant on yuiseki self-hosted tiles",
  },
  {
    id: "yuiseki-bright",
    url: "https://tile.yuiseki.net/styles/osm-bright/style.json",
    label: "🌍 yuiseki Bright (vector)",
    description: "Bright variant on yuiseki self-hosted tiles",
  },
  {
    id: "osm-hot",
    url: "/map_styles/osm-hot/style.json",
    label: "🗺️ OSM HOT (raster)",
    description: "Humanitarian OpenStreetMap style as raster tiles",
  },
  {
    id: "arcgis-world-imagery",
    url: "/map_styles/arcgis-world-imagery/style.json",
    label: "🛰 ArcGIS World Imagery (raster)",
    description: "Satellite imagery from ArcGIS World Imagery",
  },
] as const;

export const DEFAULT_MAP_STYLE_PRESET_ID: MapStylePresetId = "fiord-color";

export const getMapStylePresetById = (
  id: string
): MapStylePreset | undefined => MAP_STYLE_PRESETS.find((p) => p.id === id);

export const getMapStylePresetByUrl = (
  url: string
): MapStylePreset | undefined => MAP_STYLE_PRESETS.find((p) => p.url === url);
