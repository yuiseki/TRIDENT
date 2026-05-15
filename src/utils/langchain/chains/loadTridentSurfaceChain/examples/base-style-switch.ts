// Surface examples for the base-style-switch ability: the user wants to swap
// the underlying basemap to one of the MapStyleSelector presets. Emits an
// extra `Style: <preset-id>` line. Included only when OpenAI backend is active.
//
// Preset IDs (must match src/constants/MapStylePresets.ts):
// - fiord-color, dark-matter, osm-jp-bright, yuiseki-fiord, yuiseki-bright,
//   osm-hot, arcgis-world-imagery

export const surfaceBaseStyleSwitchExamples: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "ベースマップを人工衛星にして",
    output: `Ability: base-style-switch
Style: arcgis-world-imagery
Reply: 了解しました。ベースマップを衛星画像に切り替えます。`,
  },
  {
    input: "衛星画像で表示して",
    output: `Ability: base-style-switch
Style: arcgis-world-imagery
Reply: 了解しました。ベースマップを衛星画像に切り替えます。`,
  },
  {
    input: "Switch to satellite imagery",
    output: `Ability: base-style-switch
Style: arcgis-world-imagery
Reply: I copy. Switching the basemap to satellite imagery.`,
  },
  {
    input: "ダークモードにして",
    output: `Ability: base-style-switch
Style: dark-matter
Reply: 了解しました。ベースマップをダークモードに切り替えます。`,
  },
  {
    input: "地図を暗くして",
    output: `Ability: base-style-switch
Style: dark-matter
Reply: 了解しました。ベースマップをダークモードに切り替えます。`,
  },
  {
    input: "Switch to dark mode",
    output: `Ability: base-style-switch
Style: dark-matter
Reply: I copy. Switching the basemap to dark mode.`,
  },
  {
    input: "明るいスタイルに戻して",
    output: `Ability: base-style-switch
Style: fiord-color
Reply: 了解しました。デフォルトの明るいベースマップに切り替えます。`,
  },
  {
    input: "デフォルトのスタイルに戻して",
    output: `Ability: base-style-switch
Style: fiord-color
Reply: 了解しました。デフォルトのベースマップに戻します。`,
  },
  {
    input: "OSM HOT スタイルにして",
    output: `Ability: base-style-switch
Style: osm-hot
Reply: 了解しました。ベースマップを OSM HOT スタイルに切り替えます。`,
  },
  {
    input: "Humanitarian style please",
    output: `Ability: base-style-switch
Style: osm-hot
Reply: I copy. Switching the basemap to the Humanitarian OSM style.`,
  },
  {
    input: "OSM 日本のスタイルにして",
    output: `Ability: base-style-switch
Style: osm-jp-bright
Reply: 了解しました。ベースマップを OSM 日本の Bright スタイルに切り替えます。`,
  },
];
